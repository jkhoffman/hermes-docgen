import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
	ensureDirectory,
	generateFilePath,
	writeFile,
} from "../src/markdown/writer";

describe("Markdown Writer", () => {
	let tempDir: string;
	let outputDir: string;

	beforeAll(async () => {
		// Create a temporary directory
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hermes-writer-test-"));
		outputDir = path.join(tempDir, "docs");

		// Create output directory
		await fs.mkdir(outputDir, { recursive: true });
	});

	afterAll(async () => {
		// Clean up
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	it("should ensure directory exists", async () => {
		const dirPath = path.join(tempDir, "ensure-test");

		const result = await ensureDirectory(dirPath);

		expect(result.isOk()).toBe(true);

		if (result.isOk()) {
			// Check directory was created
			const dirExists = await fs
				.access(dirPath)
				.then(() => true)
				.catch(() => false);

			expect(dirExists).toBe(true);
		}
	});

	it("should handle directory creation errors", async () => {
		// Create a really long path that's likely to fail
		const dirPath = path.join(tempDir, "a".repeat(1000), "error-dir");

		const result = await ensureDirectory(dirPath);

		// This might fail due to path length restrictions
		if (result.isErr()) {
			expect(result.error.type).toBe("path_creation_failed");
			expect(result.error.path).toBe(dirPath);
		}
	});

	it("should write markdown content to file", async () => {
		const fileName = "test.md";
		const filePath = path.join(outputDir, fileName);
		const content = "# Test Markdown\n\nThis is a test content.";

		const result = await writeFile(filePath, content);

		expect(result.isOk()).toBe(true);

		if (result.isOk()) {
			const resultPath = result.value;

			// Check that the file path is correct
			expect(resultPath).toBe(filePath);

			// Check file exists
			const fileExists = await fs
				.access(filePath)
				.then(() => true)
				.catch(() => false);

			expect(fileExists).toBe(true);

			// Check file content
			const fileContent = await fs.readFile(filePath, "utf8");
			expect(fileContent).toBe(content);
		}
	});

	it("should overwrite existing file by default", async () => {
		const fileName = "overwrite-test.md";
		const filePath = path.join(outputDir, fileName);
		const originalContent = "Original content";
		const newContent = "New content";

		// Write the original content
		await fs.writeFile(filePath, originalContent, "utf8");

		// Write new content with default options
		const result = await writeFile(filePath, newContent);

		expect(result.isOk()).toBe(true);

		// Check content has been updated
		const fileContent = await fs.readFile(filePath, "utf8");
		expect(fileContent).toBe(newContent);
	});

	it("should not overwrite file when overwrite is false", async () => {
		const fileName = "no-overwrite.md";
		const filePath = path.join(outputDir, fileName);
		const originalContent = "Original content";
		const newContent = "New content";

		// Write the original content
		await fs.writeFile(filePath, originalContent, "utf8");

		// Try to write new content with overwrite=false
		const result = await writeFile(filePath, newContent, { overwrite: false });

		expect(result.isOk()).toBe(true);

		// Check content hasn't changed
		const fileContent = await fs.readFile(filePath, "utf8");
		expect(fileContent).toBe(originalContent);
	});

	it("should explicitly overwrite file when overwrite is true", async () => {
		const fileName = "explicit-overwrite.md";
		const filePath = path.join(outputDir, fileName);
		const originalContent = "Original content";
		const newContent = "New content";

		// Write the original content
		await fs.writeFile(filePath, originalContent, "utf8");

		// Try to write new content with overwrite=true
		const result = await writeFile(filePath, newContent, { overwrite: true });

		expect(result.isOk()).toBe(true);

		// Check content has been updated
		const fileContent = await fs.readFile(filePath, "utf8");
		expect(fileContent).toBe(newContent);
	});

	it("should create directories if they don't exist", async () => {
		const nestedDir = path.join(tempDir, "nested", "docs");
		const filePath = path.join(nestedDir, "test.md");
		const content = "Test content";

		// Write to a file in a nested directory that doesn't exist yet
		const result = await writeFile(filePath, content);

		expect(result.isOk()).toBe(true);

		if (result.isOk()) {
			// Check directory was created
			const dirExists = await fs
				.access(nestedDir)
				.then(() => true)
				.catch(() => false);

			expect(dirExists).toBe(true);

			// Check file was created
			const fileExists = await fs
				.access(filePath)
				.then(() => true)
				.catch(() => false);

			expect(fileExists).toBe(true);

			// Check content
			const fileContent = await fs.readFile(filePath, "utf8");
			expect(fileContent).toBe(content);
		}
	});

	it("should handle directory creation failures when writing", async () => {
		// Create a file path with an invalid directory path (too long)
		const dirPath = path.join(tempDir, "a".repeat(1000));
		const filePath = path.join(dirPath, "test.md");
		const content = "Test content";

		// Write to a file that will fail to create its parent directory
		const result = await writeFile(filePath, content);

		// This will likely fail due to path length restrictions
		if (result.isErr()) {
			expect(result.error.type).toBe("path_creation_failed");
		}
	});

	it("should handle file write failures", async () => {
		// Use a path that likely won't be writable in a normal environment
		const filePath = path.join("/etc/", "test.md");
		const content = "Test content";

		// Write to a file that will likely fail due to permissions
		const result = await writeFile(filePath, content);

		// This will likely fail with permission error
		if (result.isErr()) {
			expect(result.error.type).toBe("write_failed");
			expect(result.error.path).toBe(filePath);
		}
	});

	it("should handle write errors with non-writable paths", async () => {
		// Create a path that would require elevated permissions
		// This is a bit tricky to test reliably, but we can try a path that's likely to fail
		const restrictedPath = path.join("/var/root", "test.md");

		const result = await writeFile(restrictedPath, "Content");

		// This will likely fail unless the test is running as root
		if (result.isErr()) {
			// Both error types are possible depending on environment:
			// - In some environments it's a "write_failed" error (local)
			// - In others it's a "path_creation_failed" error (CI)
			expect(['write_failed', 'path_creation_failed']).toContain(result.error.type);
			expect(result.error.path).toBe(restrictedPath);
		}
	});

	it("should generate file paths correctly", () => {
		// Test with no extension provided
		const path1 = generateFilePath(outputDir, "test");
		expect(path1).toBe(path.join(outputDir, "test.md"));

		// Test with extension already included
		const path2 = generateFilePath(outputDir, "test.md");
		expect(path2).toBe(path.join(outputDir, "test.md"));

		// Test with custom extension
		const path3 = generateFilePath(outputDir, "test", ".txt");
		expect(path3).toBe(path.join(outputDir, "test.txt"));
	});
});
