import { describe, it, expect } from "vitest";
import { formatMarkdown } from "../src/markdown";
import { DocItem, DocItemKind } from "../src/parser/traversal";

describe("Markdown Formatter", () => {
  it("should format empty doc items", () => {
    const items: DocItem[] = [];
    const markdownOptions = {
      tocDepth: 2,
      linkReferences: true,
      includeTypes: true,
      includeExamples: true
    };
    
    const result = formatMarkdown(items, markdownOptions);
    expect(result).toContain("# Table of Contents");
  });

  // Add more specific tests as the implementation evolves
});