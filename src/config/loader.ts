import { cosmiconfig } from "cosmiconfig";
import { Result, err, ok } from "neverthrow";
import { ConfigSchema, HermesConfig, defaultConfig } from "./schema";

/**
 * Error types that can occur during configuration loading
 */
export type ConfigError = 
	| { type: "not_found" }
	| { type: "invalid_format"; details: string }
	| { type: "io_error"; details: string };

/**
 * Options for loading configuration
 */
export interface LoadConfigOptions {
	configPath?: string;
	cwd?: string;
}

/**
 * Load the Hermes configuration
 * Uses cosmiconfig to search for configuration in standard locations
 */
export async function loadConfig(
	options: LoadConfigOptions = {}
): Promise<Result<HermesConfig, ConfigError>> {
	try {
		const explorer = cosmiconfig("hermes");
		
		// If config path is specified, load from there
		if (options.configPath) {
			const result = await explorer.load(options.configPath);
			if (!result) {
				return err({ type: "not_found" });
			}
			return parseConfig(result.config);
		}
		
		// Otherwise search for config in standard locations
		const result = await explorer.search(options.cwd);
		if (!result) {
			// No config found, use defaults
			return ok(defaultConfig);
		}
		
		return parseConfig(result.config);
	} catch (error) {
		return err({
			type: "io_error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Parse and validate the configuration
 */
function parseConfig(config: unknown): Result<HermesConfig, ConfigError> {
	try {
		// Merge with defaults and validate
		const mergedConfig = Object.assign({}, defaultConfig, config as Record<string, unknown>);
		const result = ConfigSchema.safeParse(mergedConfig);
		
		if (!result.success) {
			return err({
				type: "invalid_format",
				details: result.error.message,
			});
		}
		
		return ok(result.data);
	} catch (error) {
		return err({
			type: "invalid_format",
			details: error instanceof Error ? error.message : String(error),
		});
	}
}