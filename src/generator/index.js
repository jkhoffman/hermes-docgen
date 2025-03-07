"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGenerator = void 0;
const neverthrow_1 = require("neverthrow");
const path_1 = __importDefault(require("path"));
const markdown_1 = require("../markdown");
const traversal_1 = require("../parser/traversal");
const parser_1 = require("../parser");
/**
 * Documentation generator
 */
class DocumentationGenerator {
    constructor(config) {
        this.config = config;
        this.parser = new parser_1.TypeScriptParser();
    }
    /**
     * Generate documentation for TypeScript files matching the patterns
     */
    generate(patterns_1) {
        return __awaiter(this, arguments, void 0, function* (patterns, options = {}) {
            // Add source files to the parser
            const filesResult = yield this.parser.addSourceFiles(patterns);
            if (filesResult.isErr()) {
                return (0, neverthrow_1.err)({
                    type: "parser_error",
                    details: filesResult.error,
                });
            }
            const sourceFiles = filesResult.value;
            // Extract documentation from all source files
            const allDocItems = [];
            for (const sourceFile of sourceFiles) {
                const docs = extractDocumentation(sourceFile);
                allDocItems.push(...docs);
            }
            // Generate markdown for each source file
            const outputDir = options.outputDir || this.config.outDir;
            const markdownOptions = Object.assign(Object.assign({}, this.config.markdownOptions), options.markdownOptions);
            // Group doc items by file for separate output files
            const fileGroups = new Map();
            for (const item of allDocItems) {
                const filePath = item.location.filePath;
                const fileName = path_1.default.basename(filePath, path_1.default.extname(filePath));
                if (!fileGroups.has(fileName)) {
                    fileGroups.set(fileName, []);
                }
                fileGroups.get(fileName).push(item);
            }
            // Generate output files
            const writtenFiles = [];
            for (const [fileName, items] of fileGroups.entries()) {
                const markdown = (0, markdown_1.formatMarkdown)(items, markdownOptions);
                const outputPath = (0, markdown_1.generateFilePath)(outputDir, fileName);
                const writeResult = yield (0, markdown_1.writeFile)(outputPath, markdown, { overwrite: true });
                if (writeResult.isErr()) {
                    return (0, neverthrow_1.err)({
                        type: "output_error",
                        path: outputPath,
                        details: JSON.stringify(writeResult.error),
                    });
                }
                writtenFiles.push(writeResult.value);
            }
            // Generate an index file
            const indexItems = this.generateIndexItems(fileGroups);
            const indexPath = (0, markdown_1.generateFilePath)(outputDir, "index");
            const indexResult = yield (0, markdown_1.writeFile)(indexPath, indexItems, { overwrite: true });
            if (indexResult.isErr()) {
                return (0, neverthrow_1.err)({
                    type: "output_error",
                    path: indexPath,
                    details: JSON.stringify(indexResult.error),
                });
            }
            writtenFiles.push(indexResult.value);
            return (0, neverthrow_1.ok)(writtenFiles);
        });
    }
    /**
     * Generate an index file with links to all documentation files
     */
    generateIndexItems(fileGroups) {
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
exports.DocumentationGenerator = DocumentationGenerator;
/**
 * Extract documentation from a source file
 */
function extractDocumentation(sourceFile) {
    return (0, traversal_1.extractDocumentation)(sourceFile);
}
