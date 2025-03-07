#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const commander_1 = require("commander");
const dotenv_1 = __importDefault(require("dotenv"));
const package_json_1 = require("../package.json");
// Load environment variables
dotenv_1.default.config();
// Create the CLI program
const program = new commander_1.Command();
program
    .name("hermes")
    .description("AI-powered documentation generator for TypeScript")
    .version(package_json_1.version);
// Generate command
program
    .command("generate")
    .description("Generate documentation from TypeScript files")
    .argument("<patterns...>", "File patterns to include (glob patterns)")
    .option("-o, --output <directory>", "Output directory", "./docs")
    .option("-c, --config <file>", "Path to config file")
    .action((patterns, options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Generating documentation for:", patterns);
    try {
        // Load configuration
        const { loadConfig } = yield Promise.resolve().then(() => __importStar(require("./config")));
        const configResult = yield loadConfig({
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
        const { DocumentationGenerator } = yield Promise.resolve().then(() => __importStar(require("./generator")));
        const generator = new DocumentationGenerator(config);
        const result = yield generator.generate(patterns);
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
    }
    catch (error) {
        console.error("Error generating documentation:", error);
        process.exit(1);
    }
}));
// Init command
program
    .command("init")
    .description("Initialize a new Hermes configuration")
    .option("-f, --force", "Overwrite existing configuration")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Initializing Hermes configuration");
    try {
        const fs = yield Promise.resolve().then(() => __importStar(require("fs/promises")));
        const path = yield Promise.resolve().then(() => __importStar(require("path")));
        const configFile = path.join(process.cwd(), ".hermesrc.json");
        // Check if the file already exists
        try {
            yield fs.access(configFile);
            if (!options.force) {
                console.error("Configuration file already exists. Use --force to overwrite.");
                process.exit(1);
            }
        }
        catch (_a) {
            // File doesn't exist, we can create it
        }
        // Import the default config
        const { defaultConfig } = yield Promise.resolve().then(() => __importStar(require("./config")));
        // Write the config file
        yield fs.writeFile(configFile, JSON.stringify(defaultConfig, null, 2), "utf8");
        console.log(`Configuration file created at ${configFile}`);
    }
    catch (error) {
        console.error("Error initializing configuration:", error);
        process.exit(1);
    }
}));
// Parse command line arguments
program.parse();
