import path from "node:path";
import { type Result, err, ok } from "neverthrow";
import type { SourceFile } from "ts-morph";

import type { HermesConfig } from "../config";
import { formatMarkdown, generateFilePath, writeFile } from "../markdown";
import { type ParserError, TypeScriptParser } from "../parser";
import type { MarkdownOptions } from "../parser/models";
import {
	type DocItem,
	extractDocumentation as extractFromSourceFile,
} from "../parser/traversal";

/**
 * Error types that can occur during document generation
 */
export type GeneratorError =
	| { type: "parser_error"; details: ParserError }
	| { type: "output_error"; path: string; details: string };

/**
 * Options for the documentation generator
 */
export interface GeneratorOptions {
	outputDir: string;
	markdownOptions: MarkdownOptions;
}

/**
 * Documentation generator
 */
export class DocumentationGenerator {
	private parser: TypeScriptParser;
	private config: HermesConfig;

	constructor(config: HermesConfig) {
		this.config = config;
		this.parser = new TypeScriptParser();
	}

	/**
	 * Generate documentation for TypeScript files matching the patterns
	 */
	public async generate(
		patterns: string[],
		options: Partial<GeneratorOptions> = {},
	): Promise<Result<string[], GeneratorError>> {
		// Add source files to the parser
		const filesResult = await this.parser.addSourceFiles(patterns);

		if (filesResult.isErr()) {
			return err({
				type: "parser_error",
				details: filesResult.error,
			});
		}

		const sourceFiles = filesResult.value;

		// Extract documentation from all source files
		const allDocItems: DocItem[] = [];

		for (const sourceFile of sourceFiles) {
			const docs = extractDocumentation(sourceFile);
			allDocItems.push(...docs);
		}

		// Generate markdown for each source file
		const outputDir = options.outputDir || this.config.outDir;
		const markdownOptions: MarkdownOptions = {
			...this.config.markdownOptions,
			...options.markdownOptions,
		};

		// Group doc items by file for separate output files
		const fileGroups = new Map<string, DocItem[]>();

		for (const item of allDocItems) {
			const filePath = item.location.filePath;
			const fileName = path.basename(filePath, path.extname(filePath));

			if (!fileGroups.has(fileName)) {
				fileGroups.set(fileName, []);
			}

			fileGroups.get(fileName)?.push(item);
		}

		// Generate output files
		const writtenFiles: string[] = [];

		for (const [fileName, items] of fileGroups.entries()) {
			const markdown = formatMarkdown(items, markdownOptions);
			const outputPath = generateFilePath(outputDir, fileName);

			const writeResult = await writeFile(outputPath, markdown, {
				overwrite: true,
			});

			if (writeResult.isErr()) {
				return err({
					type: "output_error",
					path: outputPath,
					details: JSON.stringify(writeResult.error),
				});
			}

			writtenFiles.push(writeResult.value);
		}

		// Generate an index file
		const indexItems = this.generateIndexItems(fileGroups);
		const indexPath = generateFilePath(outputDir, "index");

		const indexResult = await writeFile(indexPath, indexItems, {
			overwrite: true,
		});

		if (indexResult.isErr()) {
			return err({
				type: "output_error",
				path: indexPath,
				details: JSON.stringify(indexResult.error),
			});
		}

		writtenFiles.push(indexResult.value);

		return ok(writtenFiles);
	}

	/**
	 * Generate an index file with links to all documentation files
	 */
	private generateIndexItems(fileGroups: Map<string, DocItem[]>): string {
		let markdown = `# ${this.config.title}\n\n`;

		if (this.config.description) {
			markdown += `${this.config.description}\n\n`;
		}

		markdown += "## Documentation Files\n\n";

		for (const [fileName, items] of fileGroups.entries()) {
			markdown += `- [${fileName}](${fileName}.md) (${items.length} items)\n`;
		}

		return markdown;
	}
}

/**
 * Extract documentation from a source file
 */
function extractDocumentation(sourceFile: SourceFile): DocItem[] {
	return extractFromSourceFile(sourceFile);
}
