import { Project, SourceFile } from "ts-morph";
import { Result, err, ok } from "neverthrow";

/**
 * Error types that can occur during TypeScript parsing
 */
export type ParserError = 
	| { type: "file_not_found"; file: string }
	| { type: "invalid_pattern"; pattern: string }
	| { type: "typescript_error"; details: string };

/**
 * Options for the TypeScript parser
 */
export interface ParserOptions {
	tsConfigFilePath?: string;
	skipNodeModules?: boolean;
}

/**
 * TypeScript parser using ts-morph
 */
export class TypeScriptParser {
	private project: Project;
	
	constructor(options: ParserOptions = {}) {
		this.project = new Project({
			tsConfigFilePath: options.tsConfigFilePath,
			skipAddingFilesFromTsConfig: true,
			skipFileDependencyResolution: options.skipNodeModules ?? true,
		});
	}
	
	/**
	 * Add source files from glob patterns
	 */
	public async addSourceFiles(
		patterns: string[]
	): Promise<Result<SourceFile[], ParserError>> {
		try {
			const files = this.project.addSourceFilesAtPaths(patterns);
			return ok(files);
		} catch (error) {
			return err({
				type: "invalid_pattern",
				pattern: patterns.join(", "),
			});
		}
	}
	
	/**
	 * Get all source files in the project
	 */
	public getSourceFiles(): SourceFile[] {
		return this.project.getSourceFiles();
	}
	
	/**
	 * Get a specific source file by path
	 */
	public getSourceFile(filePath: string): Result<SourceFile, ParserError> {
		const file = this.project.getSourceFile(filePath);
		if (!file) {
			return err({
				type: "file_not_found",
				file: filePath,
			});
		}
		return ok(file);
	}
	
	/**
	 * Check if there are any compiler errors
	 */
	public getCompilerErrors(): string[] {
		const diagnostics = this.project.getPreEmitDiagnostics();
		return diagnostics.map(diagnostic => diagnostic.getMessageText().toString());
	}
}