import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Mock the modules that would be imported by the CLI
vi.mock("commander", () => {
  const mockCommand = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    argument: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn(fn => {
      mockCommand.actionHandler = fn;
      return mockCommand;
    }),
    parse: vi.fn(),
    actionHandler: null as any,
    commands: [
      { name: () => "generate", options: [{ flags: "-o, --output <directory>" }, { flags: "-c, --config <file>" }] },
      { name: () => "init", options: [{ flags: "-f, --force" }] }
    ]
  };

  return {
    Command: vi.fn(() => mockCommand)
  };
});

vi.mock("../package.json", () => ({
  version: "0.1.0"
}));

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn()
  }
}));

vi.mock("./config", () => ({
  loadConfig: vi.fn(),
  defaultConfig: { 
    outDir: "./docs", 
    include: ["src/**/*.ts"],
    exclude: ["**/*.test.ts"],
    title: "API Documentation",
    markdownOptions: {
      tocDepth: 3,
      linkReferences: true,
      includeTypes: true,
      includeExamples: true
    },
    ai: {
      enabled: true,
      provider: "openai",
      enhanceComments: true,
      generateExamples: false
    }
  }
}), { virtual: true });

vi.mock("./generator", () => ({
  DocumentationGenerator: vi.fn(() => ({
    generate: vi.fn()
  }))
}), { virtual: true });

describe("CLI", () => {
  let tempDir: string;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let exitSpy: any;

  beforeEach(async () => {
    // Create temp directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hermes-cli-test-"));
    
    // Spy on console.log and console.error
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock process.exit
    exitSpy = vi.spyOn(process, "exit").mockImplementation((code?: number) => { 
      throw new Error(`Process exited with code ${code}`);
    });
    
    // Reset mock configuration
    vi.resetModules();
  });

  afterEach(async () => {
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    
    // Restore console and process.exit
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
    
    // Reset all mocks
    vi.resetAllMocks();
  });

  it("should create the CLI program", async () => {
    // Import the CLI module
    await import("../src/index");
    
    // Get the mock Command instance
    const { Command } = await import("commander");
    const mockCommand = Command();
    
    // Check that the program is configured correctly
    expect(mockCommand.name).toHaveBeenCalledWith("hermes");
    expect(mockCommand.description).toHaveBeenCalledWith("AI-powered documentation generator for TypeScript");
    expect(mockCommand.version).toHaveBeenCalledWith("0.1.0");
    expect(mockCommand.command).toHaveBeenCalledWith("generate");
    expect(mockCommand.command).toHaveBeenCalledWith("init");
    expect(mockCommand.parse).toHaveBeenCalled();
  });

});