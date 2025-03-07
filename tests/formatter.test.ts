import { describe, it, expect, vi } from "vitest";
import path from "path";

import { 
	DocItemKind,
	ClassDoc,
	EnumDoc,
	FunctionDoc,
	InterfaceDoc,
	MethodDoc,
	ParameterDoc,
	PropertyDoc,
	TypeAliasDoc
} from "../src/parser/traversal";

// We're no longer mocking the formatter, but testing the actual implementation
import { formatMarkdown, MarkdownOptions } from "../src/markdown";
import {
	formatTableOfContents,
	getSlug,
	formatFunction,
	formatFunctionSignature,
	formatClass,
	formatInterface,
	formatEnum,
	formatTypeAlias,
	formatProperty,
	formatMethod,
	formatParameters,
	formatMethodSignature
} from "../src/markdown/formatter";

describe("Markdown Formatter", () => {
	// Helper function to create basic markdown options
	function createOptions(overrides = {}): MarkdownOptions {
		return {
			tocDepth: 2,
			linkReferences: true,
			includeTypes: true,
			includeExamples: true,
			...overrides
		};
	}

	describe("formatMarkdown", () => {
		it("should format empty doc items", () => {
			const items = [];
			const options = createOptions();

			const result = formatMarkdown(items, options);
			expect(result).toContain("# Table of Contents");
			// Empty table of contents should just have the heading
			expect(result.split("\n").length).toBeLessThan(10);
		});

		it("should format function doc items", () => {
			const items = [{
				name: "testFunction",
				kind: DocItemKind.Function,
				description: "A test function",
				parameters: [],
				returnType: "void",
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			} as FunctionDoc];

			const options = createOptions();

			const result = formatMarkdown(items, options);
			expect(result).toContain("# Table of Contents");
			expect(result).toContain("## Functions");
			expect(result).toContain("## testFunction");
		});

		it("should sort items by kind and name", () => {
			const items = [
				{
					name: "BFunction",
					kind: DocItemKind.Function,
					description: "Function B",
					parameters: [],
					returnType: "void",
					location: { filePath: "/test/file.ts", line: 1 }
				} as FunctionDoc,
				{
					name: "AClass",
					kind: DocItemKind.Class,
					description: "Class A",
					properties: [],
					methods: [],
					constructors: [],
					location: { filePath: "/test/file.ts", line: 2 }
				} as ClassDoc,
				{
					name: "AFunction",
					kind: DocItemKind.Function,
					description: "Function A",
					parameters: [],
					returnType: "void",
					location: { filePath: "/test/file.ts", line: 3 }
				} as FunctionDoc
			];

			const options = createOptions();
			const result = formatMarkdown(items, options);
			
			// Classes should come before functions
			const classIndex = result.indexOf("AClass");
			const functionBIndex = result.indexOf("BFunction");
			const functionAIndex = result.indexOf("AFunction");
			
			expect(classIndex).toBeLessThan(functionBIndex);
			expect(classIndex).toBeLessThan(functionAIndex);
			
			// Functions should be sorted alphabetically
			expect(functionAIndex).toBeLessThan(functionBIndex);
		});
	});

	describe("formatTableOfContents", () => {
		it("should generate empty TOC for empty items", () => {
			const items = [];
			const result = formatTableOfContents(items, 2);
			expect(result).toContain("# Table of Contents");
			// No section headings should be generated
			expect(result).not.toContain("## ");
		});

		it("should generate TOC with proper sections for different kinds", () => {
			const items = [
				{
					name: "TestClass",
					kind: DocItemKind.Class,
					description: "A class",
					properties: [],
					methods: [],
					constructors: [],
					location: { filePath: "/test/file.ts", line: 1 }
				} as ClassDoc,
				{
					name: "TestFunction",
					kind: DocItemKind.Function,
					description: "A function",
					parameters: [],
					returnType: "void",
					location: { filePath: "/test/file.ts", line: 2 }
				} as FunctionDoc
			];

			const result = formatTableOfContents(items, 2);
			expect(result).toContain("## Classes");
			expect(result).toContain("## Functions");
			expect(result).toContain("- [TestClass]");
			expect(result).toContain("- [TestFunction]");
		});

		it("should include class members in TOC when depth > 1", () => {
			const items = [{
				name: "TestClass",
				kind: DocItemKind.Class,
				description: "A class",
				properties: [{
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: false,
					isReadonly: false,
					isOptional: false,
					location: { filePath: "/test/file.ts", line: 2 }
				}],
				methods: [{
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [],
					returnType: "void",
					isStatic: false,
					isAsync: false,
					location: { filePath: "/test/file.ts", line: 3 }
				}],
				constructors: [],
				location: { filePath: "/test/file.ts", line: 1 }
			} as ClassDoc];

			const result = formatTableOfContents(items, 2);
			expect(result).toContain("  - Properties");
			expect(result).toContain("    - [testProp]");
			expect(result).toContain("  - Methods");
			expect(result).toContain("    - [testMethod]");
		});

		it("should not include class members in TOC when depth = 1", () => {
			const items = [{
				name: "TestClass",
				kind: DocItemKind.Class,
				description: "A class",
				properties: [{
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: false,
					isReadonly: false,
					isOptional: false,
					location: { filePath: "/test/file.ts", line: 2 }
				}],
				methods: [{
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [],
					returnType: "void",
					isStatic: false,
					isAsync: false,
					location: { filePath: "/test/file.ts", line: 3 }
				}],
				constructors: [],
				location: { filePath: "/test/file.ts", line: 1 }
			} as ClassDoc];

			const result = formatTableOfContents(items, 1);
			expect(result).not.toContain("  - Properties");
			expect(result).not.toContain("    - [testProp]");
			expect(result).not.toContain("  - Methods");
			expect(result).not.toContain("    - [testMethod]");
		});
	});

	describe("formatFunction", () => {
		it("should format a basic function", () => {
			const func: FunctionDoc = {
				name: "testFunction",
				kind: DocItemKind.Function,
				description: "A test function",
				parameters: [],
				returnType: "void",
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatFunction(func, options);
			
			expect(result).toContain("## testFunction");
			expect(result).toContain("A test function");
			expect(result).toContain("```typescript");
			expect(result).toContain("function testFunction");
			expect(result).toContain("): void");
			expect(result).toContain("### Returns");
			expect(result).toContain("`void`");
			expect(result).toContain("### Source");
			expect(result).toContain("file.ts:1");
		});

		it("should format a function with parameters", () => {
			const func: FunctionDoc = {
				name: "testFunction",
				kind: DocItemKind.Function,
				description: "A test function",
				parameters: [{
					name: "param1",
					kind: DocItemKind.Parameter,
					type: "string",
					isOptional: false,
					description: "A string parameter",
					location: {
						filePath: "/test/file.ts",
						line: 2
					}
				}],
				returnType: "string",
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatFunction(func, options);
			
			expect(result).toContain("### Parameters");
			expect(result).toContain("- `param1: string`");
			expect(result).toContain("### Returns");
			expect(result).toContain("`string`");
		});

		it("should include type parameters if provided", () => {
			const func: FunctionDoc = {
				name: "testFunction",
				kind: DocItemKind.Function,
				description: "A test function",
				parameters: [],
				returnType: "T",
				typeParameters: ["T"],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatFunction(func, options);
			
			expect(result).toContain("<T>");
		});
	});

	describe("formatClass", () => {
		it("should format a basic class", () => {
			const cls: ClassDoc = {
				name: "TestClass",
				kind: DocItemKind.Class,
				description: "A test class",
				properties: [],
				methods: [],
				constructors: [],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatClass(cls, options);
			
			expect(result).toContain("## TestClass");
			expect(result).toContain("A test class");
			expect(result).toContain("```typescript");
			expect(result).toContain("class TestClass");
			expect(result).toContain("### Source");
			expect(result).toContain("file.ts:1");
		});

		it("should format a class with properties, methods, and constructors", () => {
			const cls: ClassDoc = {
				name: "TestClass",
				kind: DocItemKind.Class,
				description: "A test class",
				properties: [{
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: false,
					isReadonly: false,
					isOptional: false,
					location: {
						filePath: "/test/file.ts",
						line: 2
					}
				}],
				methods: [{
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [],
					returnType: "void",
					isStatic: false,
					isAsync: false,
					location: {
						filePath: "/test/file.ts",
						line: 3
					}
				}],
				constructors: [{
					name: "constructor",
					kind: DocItemKind.Method,
					parameters: [{
						name: "param",
						kind: DocItemKind.Parameter,
						type: "string",
						isOptional: false,
						location: {
							filePath: "/test/file.ts",
							line: 4
						}
					}],
					returnType: "TestClass",
					isStatic: false,
					isAsync: false,
					location: {
						filePath: "/test/file.ts",
						line: 4
					}
				}],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatClass(cls, options);
			
			expect(result).toContain("### Constructors");
			expect(result).toContain("### Properties");
			expect(result).toContain("### Methods");
			expect(result).toContain("#### testProp");
			expect(result).toContain("#### testMethod");
			expect(result).toContain("#### constructor");
		});

		it("should include inheritance information if provided", () => {
			const cls: ClassDoc = {
				name: "TestClass",
				kind: DocItemKind.Class,
				description: "A test class",
				properties: [],
				methods: [],
				constructors: [],
				extends: "BaseClass",
				implements: ["Interface1", "Interface2"],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatClass(cls, options);
			
			expect(result).toContain("extends BaseClass");
			expect(result).toContain("implements Interface1, Interface2");
		});
	});

	describe("formatInterface", () => {
		it("should format a basic interface", () => {
			const iface: InterfaceDoc = {
				name: "TestInterface",
				kind: DocItemKind.Interface,
				description: "A test interface",
				properties: [],
				methods: [],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatInterface(iface, options);
			
			expect(result).toContain("## TestInterface");
			expect(result).toContain("A test interface");
			expect(result).toContain("```typescript");
			expect(result).toContain("interface TestInterface");
			expect(result).toContain("### Source");
			expect(result).toContain("file.ts:1");
		});

		it("should format an interface with properties and methods", () => {
			const iface: InterfaceDoc = {
				name: "TestInterface",
				kind: DocItemKind.Interface,
				description: "A test interface",
				properties: [{
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: false,
					isReadonly: false,
					isOptional: false,
					location: {
						filePath: "/test/file.ts",
						line: 2
					}
				}],
				methods: [{
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [],
					returnType: "void",
					isStatic: false,
					isAsync: false,
					location: {
						filePath: "/test/file.ts",
						line: 3
					}
				}],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatInterface(iface, options);
			
			expect(result).toContain("### Properties");
			expect(result).toContain("#### testProp");
			expect(result).toContain("### Methods");
			expect(result).toContain("#### testMethod");
		});

		it("should include inheritance and type parameters if provided", () => {
			const iface: InterfaceDoc = {
				name: "TestInterface",
				kind: DocItemKind.Interface,
				description: "A test interface",
				properties: [],
				methods: [],
				extends: ["BaseInterface1", "BaseInterface2"],
				typeParameters: ["T", "U"],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatInterface(iface, options);
			
			expect(result).toContain("<T, U>");
			expect(result).toContain("extends BaseInterface1, BaseInterface2");
		});
	});

	describe("formatEnum", () => {
		it("should format a basic enum", () => {
			const enumDoc: EnumDoc = {
				name: "TestEnum",
				kind: DocItemKind.Enum,
				description: "A test enum",
				members: [],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatEnum(enumDoc, options);
			
			expect(result).toContain("## TestEnum");
			expect(result).toContain("A test enum");
			expect(result).toContain("```typescript");
			expect(result).toContain("enum TestEnum");
			expect(result).toContain("### Source");
			expect(result).toContain("file.ts:1");
		});

		it("should format an enum with members", () => {
			const enumDoc: EnumDoc = {
				name: "TestEnum",
				kind: DocItemKind.Enum,
				description: "A test enum",
				members: [
					{
						name: "Option1",
						value: "1",
						description: "First option"
					},
					{
						name: "Option2",
						value: "2",
						description: "Second option"
					}
				],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatEnum(enumDoc, options);
			
			expect(result).toContain("### Members");
			expect(result).toContain("#### Option1");
			expect(result).toContain("Value: `1`");
			expect(result).toContain("First option");
			expect(result).toContain("#### Option2");
			expect(result).toContain("Value: `2`");
			expect(result).toContain("Second option");
		});
	});

	describe("formatTypeAlias", () => {
		it("should format a basic type alias", () => {
			const typeAlias: TypeAliasDoc = {
				name: "TestType",
				kind: DocItemKind.TypeAlias,
				description: "A test type",
				type: "string | number",
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatTypeAlias(typeAlias, options);
			
			expect(result).toContain("## TestType");
			expect(result).toContain("A test type");
			expect(result).toContain("```typescript");
			expect(result).toContain("type TestType = string | number;");
			expect(result).toContain("### Source");
			expect(result).toContain("file.ts:1");
		});

		it("should include type parameters if provided", () => {
			const typeAlias: TypeAliasDoc = {
				name: "TestType",
				kind: DocItemKind.TypeAlias,
				description: "A test type",
				type: "Record<T, U>",
				typeParameters: ["T", "U"],
				location: {
					filePath: "/test/file.ts",
					line: 1
				}
			};

			const options = createOptions();
			const result = formatTypeAlias(typeAlias, options);
			
			expect(result).toContain("<T, U>");
		});
	});

	describe("Helper Functions", () => {
		describe("getSlug", () => {
			it("should convert text to lowercase", () => {
				expect(getSlug("TestFunction")).toBe("testfunction");
			});

			it("should replace spaces with hyphens", () => {
				expect(getSlug("Test Function")).toBe("test-function");
			});

			it("should remove special characters", () => {
				expect(getSlug("Test@Function!")).toBe("testfunction");
			});

			it("should handle multiple consecutive non-word characters", () => {
				expect(getSlug("Test--Function")).toBe("test-function");
			});
		});

		describe("formatProperty", () => {
			it("should format a basic property", () => {
				const prop: PropertyDoc = {
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: false,
					isReadonly: false,
					isOptional: false,
					location: {
						filePath: "/test/file.ts",
						line: 1
					}
				};

				const parentName = "TestClass";
				const options = createOptions();
				const result = formatProperty(prop, parentName, options);
				
				expect(result).toContain("#### testProp");
				expect(result).toContain("```typescript");
				expect(result).toContain("testProp: string;");
			});

			it("should include modifiers if present", () => {
				const prop: PropertyDoc = {
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: true,
					isReadonly: true,
					isOptional: true,
					location: {
						filePath: "/test/file.ts",
						line: 1
					}
				};

				const parentName = "TestClass";
				const options = createOptions();
				const result = formatProperty(prop, parentName, options);
				
				expect(result).toContain("static readonly testProp?");
			});

			it("should respect includeTypes option", () => {
				const prop: PropertyDoc = {
					name: "testProp",
					kind: DocItemKind.Property,
					type: "string",
					isStatic: false,
					isReadonly: false,
					isOptional: false,
					location: {
						filePath: "/test/file.ts",
						line: 1
					}
				};

				const parentName = "TestClass";
				
				// With types
				const withTypes = formatProperty(prop, parentName, createOptions({ includeTypes: true }));
				expect(withTypes).toContain(": string");
				
				// Without types
				const withoutTypes = formatProperty(prop, parentName, createOptions({ includeTypes: false }));
				expect(withoutTypes).not.toContain(": string");
			});
		});

		describe("formatMethod", () => {
			it("should format a basic method", () => {
				const method: MethodDoc = {
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [],
					returnType: "void",
					isStatic: false,
					isAsync: false,
					location: {
						filePath: "/test/file.ts",
						line: 1
					}
				};

				const parentName = "TestClass";
				const options = createOptions();
				const result = formatMethod(method, parentName, options);
				
				expect(result).toContain("#### testMethod");
				expect(result).toContain("```typescript");
				expect(result).toContain("testMethod()");
				expect(result).toContain("##### Returns");
				expect(result).toContain("`void`");
			});

			it("should include modifiers if present", () => {
				const method: MethodDoc = {
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [],
					returnType: "Promise<void>",
					isStatic: true,
					isAsync: true,
					location: {
						filePath: "/test/file.ts",
						line: 1
					}
				};

				const parentName = "TestClass";
				const options = createOptions();
				const result = formatMethod(method, parentName, options);
				
				expect(result).toContain("static async testMethod");
			});

			it("should format parameters", () => {
				const method: MethodDoc = {
					name: "testMethod",
					kind: DocItemKind.Method,
					parameters: [{
						name: "param1",
						kind: DocItemKind.Parameter,
						type: "string",
						isOptional: false,
						location: {
							filePath: "/test/file.ts",
							line: 2
						}
					}, {
						name: "param2",
						kind: DocItemKind.Parameter,
						type: "number",
						isOptional: true,
						defaultValue: "0",
						location: {
							filePath: "/test/file.ts",
							line: 2
						}
					}],
					returnType: "void",
					isStatic: false,
					isAsync: false,
					location: {
						filePath: "/test/file.ts",
						line: 1
					}
				};

				const parentName = "TestClass";
				const options = createOptions();
				const result = formatMethod(method, parentName, options);
				
				expect(result).toContain("##### Parameters");
				expect(result).toContain("- `param1: string`");
				expect(result).toContain("- `param2?: number` (default: `0`)");
			});
		});

		describe("formatParameters", () => {
			it("should format multiple parameters", () => {
				const params: ParameterDoc[] = [
					{
						name: "required",
						kind: DocItemKind.Parameter,
						type: "string",
						isOptional: false,
						location: {
							filePath: "/test/file.ts",
							line: 1
						}
					},
					{
						name: "optional",
						kind: DocItemKind.Parameter,
						type: "number",
						isOptional: true,
						location: {
							filePath: "/test/file.ts",
							line: 1
						}
					},
					{
						name: "defaulted",
						kind: DocItemKind.Parameter,
						type: "boolean",
						isOptional: true,
						defaultValue: "false",
						location: {
							filePath: "/test/file.ts",
							line: 1
						}
					}
				];

				const options = createOptions();
				const result = formatParameters(params, options);
				
				expect(result).toContain("- `required: string`");
				expect(result).toContain("- `optional?: number`");
				expect(result).toContain("- `defaulted?: boolean` (default: `false`)");
			});

			it("should respect includeTypes option", () => {
				const params: ParameterDoc[] = [
					{
						name: "param",
						kind: DocItemKind.Parameter,
						type: "string",
						isOptional: false,
						location: {
							filePath: "/test/file.ts",
							line: 1
						}
					}
				];
				
				// With types
				const withTypes = formatParameters(params, createOptions({ includeTypes: true }));
				expect(withTypes).toContain(": string");
				
				// Without types
				const withoutTypes = formatParameters(params, createOptions({ includeTypes: false }));
				expect(withoutTypes).not.toContain(": string");
			});
		});
	});
});
