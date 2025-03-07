#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
// We need to use require here because of how package.json is loaded
const { version } = require("../package.json");

// Load environment variables
dotenv.config();

// Create the CLI program
const program = new Command();

program
	.name("hermes")
	.description("AI-powered documentation generator for TypeScript")
	.version(version);

// Generate command
program
	.command("generate")
	.description("Generate documentation from TypeScript files")
	.argument("<patterns...>", "File patterns to include (glob patterns)")
	.option("-o, --output <directory>", "Output directory", "./docs")
	.option("-c, --config <file>", "Path to config file")
	.action(async (patterns, options) => {
		console.log("Generating documentation for:", patterns);
		
		try {
			// Load configuration
			const { loadConfig } = await import("./config");
			const configResult = await loadConfig({ 
				configPath: options.config,
				cwd: process.cwd() 
			});
			
			if (configResult.isErr()) {
				const error = configResult.error;
				switch (error.type) {
					case "not_found":
						console.error("Configuration file not found");
						break;
					case "invalid_format":
						console.error("Invalid configuration format:", error.details);
						break;
					case "io_error":
						console.error("Error reading configuration:", error.details);
						break;
				}
				process.exit(1);
			}
			
			const config = configResult.value;
			
			// Override config with CLI options
			if (options.output) {
				config.outDir = options.output;
			}
			
			// Generate documentation
			const { DocumentationGenerator } = await import("./generator");
			const generator = new DocumentationGenerator(config);
			
			const result = await generator.generate(patterns);
			
			if (result.isErr()) {
				const error = result.error;
				switch (error.type) {
					case "parser_error":
						console.error("Error parsing TypeScript files:", error.details);
						break;
					case "output_error":
						console.error(`Error writing output file ${error.path}:`, error.details);
						break;
				}
				process.exit(1);
			}
			
			const files = result.value;
			console.log(`Documentation generated successfully. ${files.length} files written.`);
			
		} catch (error) {
			console.error("Error generating documentation:", error);
			process.exit(1);
		}
	});

// Init command
program
	.command("init")
	.description("Initialize a new Hermes configuration")
	.option("-f, --force", "Overwrite existing configuration")
	.action(async (options) => {
		console.log("Initializing Hermes configuration");
		
		try {
			const fs = await import("fs/promises");
			const path = await import("path");
			
			const configFile = path.join(process.cwd(), ".hermesrc.json");
			
			// Check if the file already exists
			try {
				await fs.access(configFile);
				
				if (!options.force) {
					console.error("Configuration file already exists. Use --force to overwrite.");
					process.exit(1);
				}
			} catch {
				// File doesn't exist, we can create it
			}
			
			// Import the default config
			const { defaultConfig } = await import("./config");
			
			// Write the config file
			await fs.writeFile(
				configFile,
				JSON.stringify(defaultConfig, null, 2),
				"utf8"
			);
			
			console.log(`Configuration file created at ${configFile}`);
			
		} catch (error) {
			console.error("Error initializing configuration:", error);
			process.exit(1);
		}
	});

// Parse command line arguments
program.parse();