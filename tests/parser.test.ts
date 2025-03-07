import { describe, it, expect } from "vitest";
import { TypeScriptParser } from "../src/parser";
import path from "path";

describe("TypeScriptParser", () => {
  it("should create a parser instance", () => {
    const parser = new TypeScriptParser();
    expect(parser).toBeDefined();
  });

  // Add more specific tests as the implementation evolves
});