import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultConfig, loadConfig } from "../src/config";

describe("Configuration Loading", () => {
	let tempDir: string;

	// Create a temporary directory before each test
	beforeEach(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hermes-config-test-"));
	});

	// Clean up after each test
	afterEach(async () => {
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	it("should return default config when no configuration file exists", async () => {
		const result = await loadConfig({ cwd: tempDir });

		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			const config = result.value;
			expect(config).toMatchObject(defaultConfig);
		}
	});

	it("should load configuration from .hermesrc.json file", async () => {
		const testConfig = {
			outDir: "./custom-docs",
			title: "Test Documentation",
			ai: {
				enabled: false
			}
		};

		// Create a .hermesrc.json file
		await fs.writeFile(
			path.join(tempDir, ".hermesrc.json"),
			JSON.stringify(testConfig, null, 2),
			"utf8"
		);

		const result = await loadConfig({ cwd: tempDir });

		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			const config = result.value;
			expect(config.outDir).toBe("./custom-docs");
			expect(config.title).toBe("Test Documentation");
			expect(config.ai.enabled).toBe(false);

			// Default values should still be present for unspecified fields
			expect(config.include).toEqual(defaultConfig.include);
			expect(config.exclude).toEqual(defaultConfig.exclude);
		}
	});

	it("should load configuration from specified path", async () => {
		const testConfig = {
			outDir: "./specified-path-docs",
			title: "Specified Path Documentation"
		};

		const configPath = path.join(tempDir, "custom-config.json");

		// Create a custom config file
		await fs.writeFile(
			configPath,
			JSON.stringify(testConfig, null, 2),
			"utf8"
		);

		const result = await loadConfig({ configPath });

		expect(result.isOk()).toBe(true);
		if (result.isOk()) {
			const config = result.value;
			expect(config.outDir).toBe("./specified-path-docs");
			expect(config.title).toBe("Specified Path Documentation");
		}
	});

	it("should handle invalid configuration format", async () => {
		const invalidConfig = `{
			"outDir": "./invalid-docs",
			"markdownOptions": {
				"tocDepth": "not-a-number"  // Invalid type, should be a number
			}
		}`;

		// Create an invalid config file
		await fs.writeFile(
			path.join(tempDir, ".hermesrc.json"),
			invalidConfig,
			"utf8"
		);

		const result = await loadConfig({ cwd: tempDir });

		expect(result.isErr()).toBe(true);
		if (result.isErr()) {
			const error = result.error;
			// Based on implementation, it returns io_error when parsing fails
			expect(error.type).toBe("io_error");
		}
	});

	it("should handle non-existent specified config path", async () => {
		const nonExistentPath = path.join(tempDir, "does-not-exist.json");

		const result = await loadConfig({ configPath: nonExistentPath });

		expect(result.isErr()).toBe(true);
		if (result.isErr()) {
			const error = result.error;
			// Based on implementation, it returns io_error when file not found
			expect(error.type).toBe("io_error");
		}
	});

	it("should handle JSON parse errors", async () => {
		const invalidJSON = `{
			"outDir": "./invalid-json-docs",
			"include": ["src/**/*.ts"
		}`; // Missing closing bracket

		// Create an invalid JSON file
		await fs.writeFile(
			path.join(tempDir, ".hermesrc.json"),
			invalidJSON,
			"utf8"
		);

		const result = await loadConfig({ cwd: tempDir });

		expect(result.isErr()).toBe(true);
		if (result.isErr()) {
			const error = result.error;
			expect(error.type).toBe("io_error");
		}
	});
});
