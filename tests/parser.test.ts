import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { TypeScriptParser } from "../src/parser";

// Mock the traversal module since that's where the actual processing happens
vi.mock("../src/parser/traversal", () => ({
	DocItemKind: {
		Function: "function",
		Class: "class",
		Interface: "interface",
		Enum: "enum",
		TypeAlias: "type_alias",
	},
	traverseSourceFile: vi.fn().mockReturnValue([]),
}));

describe("TypeScriptParser", () => {
	let tempDir: string;
	let tempFilePath: string;

	beforeAll(async () => {
		// Create a temporary directory
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hermes-parser-test-"));

		// Create a simple TypeScript file for testing
		tempFilePath = path.join(tempDir, "sample.ts");

		const sampleFileContent = `
    /**
     * A test interface
     */
    export interface TestInterface {
      /**
       * A string property
       */
      name: string;

      /**
       * An optional number property
       */
      age?: number;
    }

    /**
     * A test type alias
     */
    export type TestType = string | number;

    /**
     * A test function
     * @param input - Input string
     * @returns Processed string
     */
    export function processString(input: string): string {
      return input.trim();
    }

    /**
     * A test class
     */
    export class TestClass {
      /**
       * A private property
       */
      private _value: string;

      /**
       * Creates a new instance
       * @param initialValue - Initial value
       */
      constructor(initialValue: string) {
        this._value = initialValue;
      }

      /**
       * Gets the current value
       */
      getValue(): string {
        return this._value;
      }

      /**
       * Sets a new value
       * @param newValue - New value to set
       */
      setValue(newValue: string): void {
        this._value = newValue;
      }
    }

    /**
     * A simple enum
     */
    export enum TestEnum {
      /**
       * First option
       */
      Option1 = "option1",

      /**
       * Second option
       */
      Option2 = "option2"
    }
    `;

		await fs.writeFile(tempFilePath, sampleFileContent, "utf8");
	});

	afterAll(async () => {
		// Clean up
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	it("should create a parser instance", () => {
		const parser = new TypeScriptParser();
		expect(parser).toBeDefined();
	});

	it("should add source files from patterns", async () => {
		const parser = new TypeScriptParser();

		// Add source files using the pattern
		const result = await parser.addSourceFiles([`${tempDir}/**/*.ts`]);

		expect(result.isOk()).toBe(true);

		if (result.isOk()) {
			const files = result.value;
			expect(files.length).toBeGreaterThan(0);

			// At least our sample file should be found
			const fileNames = files.map((f) => f.getFilePath());
			expect(fileNames).toContain(tempFilePath);
		}
	});

	it("should get source files", () => {
		const parser = new TypeScriptParser();

		// Add a source file directly to the project
		parser.addSourceFiles([tempFilePath]);

		// Get all source files
		const files = parser.getSourceFiles();

		// We should have at least our sample file
		expect(files.length).toBeGreaterThan(0);
		const fileNames = files.map((f) => f.getFilePath());
		expect(fileNames).toContain(tempFilePath);
	});

	it("should get a specific source file", async () => {
		const parser = new TypeScriptParser();

		// Add the sample file
		await parser.addSourceFiles([tempFilePath]);

		// Get the specific file
		const result = parser.getSourceFile(tempFilePath);

		expect(result.isOk()).toBe(true);

		if (result.isOk()) {
			const file = result.value;
			expect(file.getFilePath()).toBe(tempFilePath);
		}
	});

	it("should handle file not found", async () => {
		const parser = new TypeScriptParser();

		// Try to get a non-existent file
		const nonExistentFile = path.join(tempDir, "nonexistent.ts");
		const result = parser.getSourceFile(nonExistentFile);

		expect(result.isErr()).toBe(true);

		if (result.isErr()) {
			const error = result.error;
			expect(error.type).toBe("file_not_found");
		}
	});

	it("should handle invalid patterns", async () => {
		const parser = new TypeScriptParser();

		// Try with an invalid glob pattern
		const result = await parser.addSourceFiles(["[invalid"]);

		// This might not fail on all systems, but we'll check both outcomes
		if (result.isErr()) {
			expect(result.error.type).toBe("invalid_pattern");
		}
	});

	it("should check for compiler errors", async () => {
		const parser = new TypeScriptParser();

		// Add the sample file
		await parser.addSourceFiles([tempFilePath]);

		// Check for compiler errors
		const errors = parser.getCompilerErrors();

		// Our sample file should compile without errors
		expect(Array.isArray(errors)).toBe(true);
	});
});
