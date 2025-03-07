"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const cosmiconfig_1 = require("cosmiconfig");
const neverthrow_1 = require("neverthrow");
const schema_1 = require("./schema");
/**
 * Load the Hermes configuration
 * Uses cosmiconfig to search for configuration in standard locations
 */
function loadConfig() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        try {
            const explorer = (0, cosmiconfig_1.cosmiconfig)("hermes");
            // If config path is specified, load from there
            if (options.configPath) {
                const result = yield explorer.load(options.configPath);
                if (!result) {
                    return (0, neverthrow_1.err)({ type: "not_found" });
                }
                return parseConfig(result.config);
            }
            // Otherwise search for config in standard locations
            const result = yield explorer.search(options.cwd);
            if (!result) {
                // No config found, use defaults
                return (0, neverthrow_1.ok)(schema_1.defaultConfig);
            }
            return parseConfig(result.config);
        }
        catch (error) {
            return (0, neverthrow_1.err)({
                type: "io_error",
                details: error instanceof Error ? error.message : String(error),
            });
        }
    });
}
/**
 * Parse and validate the configuration
 */
function parseConfig(config) {
    try {
        // Merge with defaults and validate
        const result = schema_1.ConfigSchema.safeParse(Object.assign(Object.assign({}, schema_1.defaultConfig), config));
        if (!result.success) {
            return (0, neverthrow_1.err)({
                type: "invalid_format",
                details: result.error.message,
            });
        }
        return (0, neverthrow_1.ok)(result.data);
    }
    catch (error) {
        return (0, neverthrow_1.err)({
            type: "invalid_format",
            details: error instanceof Error ? error.message : String(error),
        });
    }
}
