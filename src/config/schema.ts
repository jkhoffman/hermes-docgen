import { z } from "zod";

/**
 * Schema for the Hermes configuration file
 */
export const ConfigSchema = z.object({
	// Basic configuration
	outDir: z.string().default("./docs"),
	include: z.array(z.string()).default(["src/**/*.ts"]),
	exclude: z.array(z.string()).default(["**/*.test.ts", "**/*.spec.ts"]),

	// Documentation options
	title: z.string().default("API Documentation"),
	description: z.string().optional(),

	// Generation options
	markdownOptions: z
		.object({
			tocDepth: z.number().int().min(1).max(6).default(3),
			linkReferences: z.boolean().default(true),
			includeTypes: z.boolean().default(true),
			includeExamples: z.boolean().default(true),
		})
		.default({}),

	// AI options
	ai: z
		.object({
			enabled: z.boolean().default(true),
			provider: z.enum(["openai", "anthropic", "google"]).default("openai"),
			model: z.string().optional(),
			enhanceComments: z.boolean().default(true),
			generateExamples: z.boolean().default(false),
		})
		.default({}),
});

/**
 * Type for the Hermes configuration
 */
export type HermesConfig = z.infer<typeof ConfigSchema>;

/**
 * Default configuration
 */
export const defaultConfig: HermesConfig = {
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
