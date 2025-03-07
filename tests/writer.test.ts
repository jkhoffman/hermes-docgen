import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureDirectory, writeFile, generateFilePath } from "../src/markdown/writer";

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
      const dirExists = await fs.access(dirPath)
        .then(() => true)
        .catch(() => false);
      
      expect(dirExists).toBe(true);
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
      const fileExists = await fs.access(filePath)
        .then(() => true)
        .catch(() => false);
      
      expect(fileExists).toBe(true);
      
      // Check file content
      const fileContent = await fs.readFile(filePath, "utf8");
      expect(fileContent).toBe(content);
    }
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

  it("should create directories if they don't exist", async () => {
    const nestedDir = path.join(tempDir, "nested", "docs");
    const filePath = path.join(nestedDir, "test.md");
    const content = "Test content";
    
    // Write to a file in a nested directory that doesn't exist yet
    const result = await writeFile(filePath, content);
    
    expect(result.isOk()).toBe(true);
    
    if (result.isOk()) {
      // Check directory was created
      const dirExists = await fs.access(nestedDir)
        .then(() => true)
        .catch(() => false);
      
      expect(dirExists).toBe(true);
      
      // Check file was created
      const fileExists = await fs.access(filePath)
        .then(() => true)
        .catch(() => false);
      
      expect(fileExists).toBe(true);
      
      // Check content
      const fileContent = await fs.readFile(filePath, "utf8");
      expect(fileContent).toBe(content);
    }
  });

  it("should handle write errors with non-writable paths", async () => {
    // Create a path that would require elevated permissions
    // This is a bit tricky to test reliably, but we can try a path that's likely to fail
    const restrictedPath = path.join("/var/root", "test.md");
    
    const result = await writeFile(restrictedPath, "Content");
    
    // This will likely fail unless the test is running as root
    if (result.isErr()) {
      expect(result.error.type).toBe("write_failed");
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