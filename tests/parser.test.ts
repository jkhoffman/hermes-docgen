import path from "node:path";
import { describe, expect, it } from "vitest";

import { TypeScriptParser } from "../src/parser";

describe("TypeScriptParser", () => {
  it("should create a parser instance", () => {
    const parser = new TypeScriptParser();
    expect(parser).toBeDefined();
  });

  // Add more specific tests as the implementation evolves
});
