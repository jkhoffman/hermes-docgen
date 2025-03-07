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
exports.ensureDirectory = ensureDirectory;
exports.writeFile = writeFile;
exports.generateFilePath = generateFilePath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const neverthrow_1 = require("neverthrow");
/**
 * Ensure a directory exists, creating it if necessary
 */
function ensureDirectory(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.default.promises.mkdir(dirPath, { recursive: true });
            return (0, neverthrow_1.ok)(dirPath);
        }
        catch (error) {
            return (0, neverthrow_1.err)({
                type: "path_creation_failed",
                path: dirPath,
                details: error instanceof Error ? error.message : String(error),
            });
        }
    });
}
/**
 * Write content to a file
 */
function writeFile(filePath_1, content_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, content, options = {}) {
        try {
            // Check if the file exists and we're not overwriting
            if (!options.overwrite) {
                try {
                    yield fs_1.default.promises.access(filePath);
                    // If we get here, the file exists
                    // If overwrite is false, don't write
                    if (options.overwrite === false) {
                        return (0, neverthrow_1.ok)(filePath); // Return success but don't write
                    }
                }
                catch (_a) {
                    // File doesn't exist, so we'll create it
                }
            }
            // Ensure the directory exists
            const dirPath = path_1.default.dirname(filePath);
            const dirResult = yield ensureDirectory(dirPath);
            if (dirResult.isErr()) {
                return dirResult;
            }
            // Write the file
            yield fs_1.default.promises.writeFile(filePath, content, "utf8");
            return (0, neverthrow_1.ok)(filePath);
        }
        catch (error) {
            return (0, neverthrow_1.err)({
                type: "write_failed",
                path: filePath,
                details: error instanceof Error ? error.message : String(error),
            });
        }
    });
}
/**
 * Generate a file path for a documentation output file
 */
function generateFilePath(outputDir, fileName, fileExtension = ".md") {
    // Ensure the fileName has the correct extension
    const baseName = fileName.endsWith(fileExtension)
        ? fileName
        : `${fileName}${fileExtension}`;
    return path_1.default.join(outputDir, baseName);
}
