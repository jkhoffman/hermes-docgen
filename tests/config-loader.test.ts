import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Result } from "neverthrow";
import { loadConfig } from "../src/config/loader";

// Mock cosmiconfig
vi.mock("cosmiconfig", () => ({
  cosmiconfig: vi.fn().mockImplementation(() => ({
    load: vi.fn(),
    search: vi.fn(),
  })),
}));

describe("Config Loader", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should handle IO errors during config loading", async () => {
    // Mock cosmiconfig to throw an error
    const { cosmiconfig } = await import("cosmiconfig");
    const mockExplorer = {
      load: vi.fn().mockImplementation(() => {
        throw new Error("IO error");
      }),
      search: vi.fn().mockImplementation(() => {
        throw new Error("IO error");
      }),
    };
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

    // Load config with a specified path
    const result = await loadConfig({ configPath: "some/path.json" });

    // Should return an error
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("io_error");
      expect(result.error.details).toContain("IO error");
    }
  });

  it("should handle file not found when loading from specific path", async () => {
    // Mock cosmiconfig to return null (file not found)
    const { cosmiconfig } = await import("cosmiconfig");
    const mockExplorer = {
      load: vi.fn().mockResolvedValue(null),
      search: vi.fn(),
    };
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

    // Load config with a specified path
    const result = await loadConfig({ configPath: "nonexistent.json" });

    // Should return a not_found error
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("not_found");
    }
  });

  it("should parse valid config data", async () => {
    // Mock cosmiconfig to return valid config
    const { cosmiconfig } = await import("cosmiconfig");
    const mockExplorer = {
      load: vi.fn().mockResolvedValue({
        config: {
          outDir: "./custom-docs",
          title: "Custom Documentation",
          ai: {
            enabled: false,
          },
        },
      }),
      search: vi.fn(),
    };
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

    // Load config with a specified path
    const result = await loadConfig({ configPath: "valid-config.json" });

    // Should return a successful result with merged config
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const config = result.value;
      expect(config.outDir).toBe("./custom-docs");
      expect(config.title).toBe("Custom Documentation");
      expect(config.ai.enabled).toBe(false);
      // Default values should be preserved
      expect(config.include).toEqual(expect.any(Array));
      expect(config.exclude).toEqual(expect.any(Array));
    }
  });

  it("should handle invalid config data", async () => {
    // Mock cosmiconfig to return invalid config
    const { cosmiconfig } = await import("cosmiconfig");
    const mockExplorer = {
      load: vi.fn().mockResolvedValue({
        config: {
          outDir: 123, // Should be a string
        },
      }),
      search: vi.fn(),
    };
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

    // Load config with a specified path
    const result = await loadConfig({ configPath: "invalid-config.json" });

    // Should return an invalid_format error
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("invalid_format");
      // Don't check the exact error message content since it comes from Zod
    }
  });

  it("should handle JSON parse errors", async () => {
    // Mock cosmiconfig to throw a SyntaxError (like with invalid JSON)
    const { cosmiconfig } = await import("cosmiconfig");
    const mockExplorer = {
      load: vi.fn().mockImplementation(() => {
        throw new SyntaxError("Unexpected token in JSON");
      }),
      search: vi.fn(),
    };
    
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

    // Load config with a specified path
    const result = await loadConfig({ configPath: "invalid-json.json" });

    // Should return an io_error
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("io_error");
    }
  });

  it("should use default config when no config file is found", async () => {
    // Mock cosmiconfig to return null (no config found)
    const { cosmiconfig } = await import("cosmiconfig");
    const mockExplorer = {
      load: vi.fn(),
      search: vi.fn().mockResolvedValue(null),
    };
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

    // Load config with no specified path
    const result = await loadConfig();

    // Should return the default config
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const config = result.value;
      expect(config.outDir).toBe("./docs");
      expect(config.title).toBe("API Documentation");
      expect(config.ai.enabled).toBe(true);
    }
  });
});