import fs from "fs";
import path from "path";
import { Result, err, ok } from "neverthrow";

/**
 * Error types that can occur during file operations
 */
export type FileError =
	| { type: "path_creation_failed"; path: string; details: string }
	| { type: "write_failed"; path: string; details: string };

/**
 * Options for writing files
 */
export interface WriteOptions {
	overwrite?: boolean;
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectory(
	dirPath: string
): Promise<Result<string, FileError>> {
	try {
		await fs.promises.mkdir(dirPath, { recursive: true });
		return ok(dirPath);
	} catch (error) {
		return err({
			type: "path_creation_failed",
			path: dirPath,
			details: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Write content to a file
 */
export async function writeFile(
	filePath: string,
	content: string,
	options: WriteOptions = {}
): Promise<Result<string, FileError>> {
	try {
		// Check if the file exists and we're not overwriting
		if (!options.overwrite) {
			try {
				await fs.promises.access(filePath);
				// If we get here, the file exists
				
				// If overwrite is false, don't write
				if (options.overwrite === false) {
					return ok(filePath); // Return success but don't write
				}
			} catch {
				// File doesn't exist, so we'll create it
			}
		}
		
		// Ensure the directory exists
		const dirPath = path.dirname(filePath);
		const dirResult = await ensureDirectory(dirPath);
		
		if (dirResult.isErr()) {
			return dirResult;
		}
		
		// Write the file
		await fs.promises.writeFile(filePath, content, "utf8");
		return ok(filePath);
	} catch (error) {
		return err({
			type: "write_failed",
			path: filePath,
			details: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Generate a file path for a documentation output file
 */
export function generateFilePath(
	outputDir: string,
	fileName: string,
	fileExtension = ".md"
): string {
	// Ensure the fileName has the correct extension
	const baseName = fileName.endsWith(fileExtension)
		? fileName
		: `${fileName}${fileExtension}`;
	
	return path.join(outputDir, baseName);
}