import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { HermesConfig } from "../src/config";
import { DocumentationGenerator } from "../src/generator";
import fs from "fs/promises";
import path from "path";
import os from "os";

describe("Integration Tests", () => {
	let tempDir: string;
	let tempFilePath: string;
	let outputDir: string;

	/**
	 * Set up the test environment:
	 * 1. Create a temporary directory
	 * 2. Create a sample TypeScript file
	 * 3. Create an output directory
	 */
	beforeAll(async () => {
		// Create a temporary directory
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hermes-test-"));
		outputDir = path.join(tempDir, "docs");
		
		// Make sure the output directory exists
		await fs.mkdir(outputDir, { recursive: true });
		
		// Create a simple TypeScript file for testing
		tempFilePath = path.join(tempDir, "sample.ts");
		
		const sampleFileContent = `
/**
 * A simple calculator class
 * @example
 * const calc = new Calculator();
 * calc.add(1, 2); // Returns 3
 */
export class Calculator {
	/**
	 * Adds two numbers
	 * @param a - First number
	 * @param b - Second number
	 * @returns The sum of a and b
	 */
	add(a: number, b: number): number {
		return a + b;
	}

	/**
	 * Subtracts one number from another
	 * @param a - Number to subtract from
	 * @param b - Number to subtract
	 * @returns The difference of a and b
	 */
	subtract(a: number, b: number): number {
		return a - b;
	}
}
		`;
		
		await fs.writeFile(tempFilePath, sampleFileContent, "utf8");
	});

	/**
	 * Clean up the test environment:
	 * 1. Remove the temporary directory
	 */
	afterAll(async () => {
		// Clean up
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	/**
	 * Test that the documentation generator can process a simple file
	 */
	it("should generate documentation for a simple TypeScript file", async () => {
		// Create a test configuration
		const config: HermesConfig = {
			outDir: outputDir,
			include: ["**/*.ts"],
			exclude: ["**/*.test.ts", "**/*.spec.ts"],
			title: "Test Documentation",
			markdownOptions: {
				tocDepth: 3,
				linkReferences: true,
				includeTypes: true,
				includeExamples: true,
			},
			ai: {
				enabled: false,
				provider: "openai",
				enhanceComments: false,
				generateExamples: false,
			},
		};
		
		// Create the documentation generator
		const generator = new DocumentationGenerator(config);
		
		// Generate documentation
		const result = await generator.generate([tempFilePath]);
		
		// Check that the generation succeeded
		expect(result.isOk()).toBe(true);
		
		if (result.isOk()) {
			const filePaths = result.value;
			
			// Should have generated at least one file
			expect(filePaths.length).toBeGreaterThan(0);
			
			// Check for both the index file and content file
			const outputFiles = await fs.readdir(outputDir);
			expect(outputFiles).toContain("index.md");
			expect(outputFiles).toContain("sample.md");
			
			// Read and verify the content of the generated file
			const sampleContent = await fs.readFile(
				path.join(outputDir, "sample.md"),
				"utf8"
			);
			
			// Content should include the class name
			expect(sampleContent).toContain("# Calculator");
			
			// Content should include class description
			expect(sampleContent).toContain("A simple calculator class");
			
			// Content should include method descriptions
			expect(sampleContent).toContain("Adds two numbers");
			expect(sampleContent).toContain("Subtracts one number from another");
			
			// Content should include parameters section
			expect(sampleContent).toContain("Parameters");
			
			// Content should include return types
			expect(sampleContent).toContain("): number");
		}
	});
});
