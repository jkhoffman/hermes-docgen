"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.ConfigSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for the Hermes configuration file
 */
exports.ConfigSchema = zod_1.z.object({
    // Basic configuration
    outDir: zod_1.z.string().default("./docs"),
    include: zod_1.z.array(zod_1.z.string()).default(["src/**/*.ts"]),
    exclude: zod_1.z.array(zod_1.z.string()).default(["**/*.test.ts", "**/*.spec.ts"]),
    // Documentation options
    title: zod_1.z.string().default("API Documentation"),
    description: zod_1.z.string().optional(),
    // Generation options
    markdownOptions: zod_1.z.object({
        tocDepth: zod_1.z.number().int().min(1).max(6).default(3),
        linkReferences: zod_1.z.boolean().default(true),
        includeTypes: zod_1.z.boolean().default(true),
        includeExamples: zod_1.z.boolean().default(true),
    }).default({}),
    // AI options
    ai: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        provider: zod_1.z.enum(["openai", "anthropic", "google"]).default("openai"),
        model: zod_1.z.string().optional(),
        enhanceComments: zod_1.z.boolean().default(true),
        generateExamples: zod_1.z.boolean().default(false),
    }).default({}),
});
/**
 * Default configuration
 */
exports.defaultConfig = {
    outDir: "./docs",
    include: ["src/**/*.ts"],
    exclude: ["**/*.test.ts", "**/*.spec.ts"],
    title: "API Documentation",
    markdownOptions: {
        tocDepth: 3,
        linkReferences: true,
        includeTypes: true,
        includeExamples: true,
    },
    ai: {
        enabled: true,
        provider: "openai",
        enhanceComments: true,
        generateExamples: false,
    },
};
