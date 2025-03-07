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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptParser = void 0;
const ts_morph_1 = require("ts-morph");
const neverthrow_1 = require("neverthrow");
/**
 * TypeScript parser using ts-morph
 */
class TypeScriptParser {
    constructor(options = {}) {
        var _a;
        this.project = new ts_morph_1.Project({
            tsConfigFilePath: options.tsConfigFilePath,
            skipAddingFilesFromTsConfig: true,
            skipFileDependencyResolution: (_a = options.skipNodeModules) !== null && _a !== void 0 ? _a : true,
        });
    }
    /**
     * Add source files from glob patterns
     */
    addSourceFiles(patterns) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = this.project.addSourceFilesAtPaths(patterns);
                return (0, neverthrow_1.ok)(files);
            }
            catch (error) {
                return (0, neverthrow_1.err)({
                    type: "invalid_pattern",
                    pattern: patterns.join(", "),
                });
            }
        });
    }
    /**
     * Get all source files in the project
     */
    getSourceFiles() {
        return this.project.getSourceFiles();
    }
    /**
     * Get a specific source file by path
     */
    getSourceFile(filePath) {
        const file = this.project.getSourceFile(filePath);
        if (!file) {
            return (0, neverthrow_1.err)({
                type: "file_not_found",
                file: filePath,
            });
        }
        return (0, neverthrow_1.ok)(file);
    }
    /**
     * Check if there are any compiler errors
     */
    getCompilerErrors() {
        const diagnostics = this.project.getPreEmitDiagnostics();
        return diagnostics.map(diagnostic => diagnostic.getMessageText().toString());
    }
}
exports.TypeScriptParser = TypeScriptParser;
