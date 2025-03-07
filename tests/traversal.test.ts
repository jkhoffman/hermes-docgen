import { describe, expect, it, vi } from "vitest";
import {
	ClassDeclaration,
	EnumDeclaration,
	FunctionDeclaration,
	InterfaceDeclaration,
	JSDoc,
	MethodDeclaration,
	ParameterDeclaration,
	Project,
	PropertyDeclaration,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";
import {
	DocItem,
	DocItemKind,
} from "../src/parser/traversal";

// Import implementation functions directly from traversal module 
// These are not exported in the public API
import { 
	extractDocumentation,
	extractJSDocInfo,
	extractParameterDoc,
	extractParameterDescription
} from "../src/parser/traversal";

// Helper to create a source file from code
function createSourceFile(code: string): SourceFile {
	const project = new Project();
	return project.createSourceFile("test.ts", code);
}

describe("traversal.ts", () => {
	describe("extractDocumentation", () => {
		it("should handle empty source files", () => {
			const sourceFile = createSourceFile("");
			const items = extractDocumentation(sourceFile);
			expect(items).toEqual([]);
		});

		it("should extract function declarations", () => {
			const sourceFile = createSourceFile(`
				/**
				 * Test function
				 * @param input A string
				 * @returns A processed string
				 */
				function testFunction(input: string): string {
					return input.trim();
				}
			`);

			const items = extractDocumentation(sourceFile);
			expect(items.length).toBe(1);
			expect(items[0].kind).toBe(DocItemKind.Function);
			expect(items[0].name).toBe("testFunction");
			expect(items[0].description).toBeTruthy();
		});

		it("should extract class declarations", () => {
			const sourceFile = createSourceFile(`
				/**
				 * A test class
				 */
				class TestClass {
					/**
					 * A property
					 */
					private value: string;

					/**
					 * Constructor
					 */
					constructor(value: string) {
						this.value = value;
					}

					/**
					 * A method
					 */
					getValue(): string {
						return this.value;
					}
				}
			`);

			const items = extractDocumentation(sourceFile);
			expect(items.length).toBe(1);
			expect(items[0].kind).toBe(DocItemKind.Class);
			expect(items[0].name).toBe("TestClass");
			
			const classDoc = items[0] as any;
			expect(classDoc.properties.length).toBe(1);
			expect(classDoc.methods.length).toBe(1);
			expect(classDoc.constructors.length).toBe(1);
		});

		it("should extract interface declarations", () => {
			const sourceFile = createSourceFile(`
				/**
				 * A test interface
				 */
				interface TestInterface {
					/**
					 * A property
					 */
					value: string;

					/**
					 * A method
					 */
					getValue(): string;
				}
			`);

			const items = extractDocumentation(sourceFile);
			expect(items.length).toBe(1);
			expect(items[0].kind).toBe(DocItemKind.Interface);
			expect(items[0].name).toBe("TestInterface");
			
			const interfaceDoc = items[0] as any;
			expect(interfaceDoc.properties.length).toBe(1);
			expect(interfaceDoc.methods.length).toBe(1);
		});

		it("should extract enum declarations", () => {
			const sourceFile = createSourceFile(`
				/**
				 * A test enum
				 */
				enum TestEnum {
					/**
					 * Option 1
					 */
					Option1 = "option1",
					
					/**
					 * Option 2
					 */
					Option2 = "option2"
				}
			`);

			const items = extractDocumentation(sourceFile);
			expect(items.length).toBe(1);
			expect(items[0].kind).toBe(DocItemKind.Enum);
			expect(items[0].name).toBe("TestEnum");
			
			const enumDoc = items[0] as any;
			expect(enumDoc.members.length).toBe(2);
		});

		it("should extract type alias declarations", () => {
			const sourceFile = createSourceFile(`
				/**
				 * A test type
				 */
				type TestType = string | number;
			`);

			const items = extractDocumentation(sourceFile);
			expect(items.length).toBe(1);
			expect(items[0].kind).toBe(DocItemKind.TypeAlias);
			expect(items[0].name).toBe("TestType");
		});

		it("should extract from a complex source file with multiple declarations", () => {
			const sourceFile = createSourceFile(`
				/**
				 * A test interface
				 */
				interface TestInterface {
					value: string;
				}

				/**
				 * A test class
				 */
				class TestClass implements TestInterface {
					value: string;
					
					constructor(value: string) {
						this.value = value;
					}
				}

				/**
				 * A test function
				 */
				function testFunction(): TestInterface {
					return new TestClass("test");
				}

				/**
				 * A test enum
				 */
				enum TestEnum {
					One = 1,
					Two = 2
				}

				/**
				 * A test type
				 */
				type TestType = TestInterface | string;
			`);

			const items = extractDocumentation(sourceFile);
			expect(items.length).toBe(5);
			
			// Verify we have one of each kind
			const kinds = items.map(item => item.kind);
			expect(kinds).toContain(DocItemKind.Interface);
			expect(kinds).toContain(DocItemKind.Class);
			expect(kinds).toContain(DocItemKind.Function);
			expect(kinds).toContain(DocItemKind.Enum);
			expect(kinds).toContain(DocItemKind.TypeAlias);
		});
	});

	describe("extractJSDocInfo", () => {
		it("should return undefined for undefined JSDoc", () => {
			const result = extractJSDocInfo(undefined);
			expect(result).toBeUndefined();
		});

		it("should return undefined for empty JSDoc array", () => {
			const result = extractJSDocInfo([]);
			expect(result).toBeUndefined();
		});

		it("should extract description from JSDoc", () => {
			// Mock a JSDoc object
			const mockJSDoc = {
				getDescription: vi.fn().mockReturnValue("Test description"),
				getTags: vi.fn().mockReturnValue([])
			} as unknown as JSDoc;

			const result = extractJSDocInfo([mockJSDoc]);
			expect(result).toBeDefined();
			expect(result?.description).toBe("Test description");
			expect(result?.tags).toEqual([]);
		});

		it("should extract tags from JSDoc", () => {
			// Mock a JSDoc object with tags
			const mockJSDoc = {
				getDescription: vi.fn().mockReturnValue("Test description"),
				getTags: vi.fn().mockReturnValue([
					{
						getTagName: vi.fn().mockReturnValue("param"),
						getText: vi.fn().mockReturnValue("input Test parameter"),
						getComment: vi.fn().mockReturnValue("Test parameter")
					},
					{
						getTagName: vi.fn().mockReturnValue("returns"),
						getText: vi.fn().mockReturnValue("Test return value"),
						getComment: vi.fn().mockReturnValue("Test return value")
					}
				])
			} as unknown as JSDoc;

			const result = extractJSDocInfo([mockJSDoc]);
			expect(result).toBeDefined();
			expect(result?.description).toBe("Test description");
			expect(result?.tags.length).toBe(2);
			expect(result?.tags[0].tag).toBe("param");
			expect(result?.tags[1].tag).toBe("returns");
		});

		it("should handle errors in JSDoc parsing", () => {
			// Mock a JSDoc object that would cause the parser to throw
			const mockJSDoc = {
				getDescription: vi.fn().mockReturnValue("Test {invalid} description"),
				getTags: vi.fn().mockReturnValue([
					{
						getTagName: vi.fn().mockReturnValue("param"),
						getText: vi.fn().mockReturnValue("input Test parameter"),
						getComment: vi.fn().mockImplementation(() => { throw new Error("Test error"); })
					}
				])
			} as unknown as JSDoc;

			// Mock comment-parser to throw an error
			vi.mock("comment-parser", () => ({
				parse: vi.fn().mockImplementation(() => {
					throw new Error("Test error");
				})
			}));

			const result = extractJSDocInfo([mockJSDoc]);
			expect(result).toBeDefined();
			expect(result?.description).toBe("Test {invalid} description");
			expect(result?.tags.length).toBe(1);
			
			// Restore the original implementation
			vi.restoreAllMocks();
		});
	});
	
	describe("extractParameterDescription", () => {
		it("should extract parameter descriptions directly", () => {
			// Create a function with JSDoc parameter descriptions
			const sourceFile = createSourceFile(`
				/**
				 * Test function with parameter descriptions
				 * @param first The first parameter
				 * @param second The second parameter with more details
				 * @returns The return value
				 */
				function test(first: string, second: number) {
					return first + second;
				}
			`);
			
			const func = sourceFile.getFunction("test");
			if (!func) {
				throw new Error("Function not found in test code");
			}
			
			// Get parameters
			const params = func.getParameters();
			expect(params.length).toBe(2);
			
			// Get JSDoc blocks
			const jsDocs = func.getJsDocs();
			expect(jsDocs.length).toBeGreaterThan(0);
			
			// Try our helper function
			const firstParamDesc = extractParameterDescription(params[0], jsDocs);
			const secondParamDesc = extractParameterDescription(params[1], jsDocs);
			
			// Check our extraction results
			expect(firstParamDesc).toBe("The first parameter");
			expect(secondParamDesc).toBe("The second parameter with more details");
		});

		it("should extract parameter descriptions from function documentation", () => {
			// Create a function with JSDoc parameter descriptions
			const sourceFile = createSourceFile(`
				/**
				 * Test function with parameter descriptions
				 * @param first The first parameter
				 * @param second The second parameter with more details
				 * @returns The return value
				 */
				function test(first: string, second: number) {
					return first + second;
				}
			`);
			
			// Extract all function documentation
			const docItems = extractDocumentation(sourceFile);
			expect(docItems.length).toBe(1);
			
			const funcDoc = docItems[0] as any;
			expect(funcDoc.kind).toBe(DocItemKind.Function);
			expect(funcDoc.parameters.length).toBe(2);
			
			// Check that parameter descriptions were populated from JSDoc
			expect(funcDoc.parameters[0].description).toBe("The first parameter");
			expect(funcDoc.parameters[1].description).toBe("The second parameter with more details");
		});
	});

	describe("extractParameterDoc", () => {
		it("should extract basic parameter information", () => {
			// Create a simple parameter declaration
			const sourceFile = createSourceFile(`
				function test(param: string) {}
			`);
			
			const func = sourceFile.getFunction("test");
			const param = func?.getParameters()[0];
			
			if (!param) {
				throw new Error("Parameter not found in test code");
			}
			
			const result = extractParameterDoc(param);
			
			expect(result).toBeDefined();
			expect(result.name).toBe("param");
			expect(result.kind).toBe(DocItemKind.Parameter);
			expect(result.type).toBe("string");
			expect(result.isOptional).toBe(false);
			expect(result.defaultValue).toBeUndefined();
		});

		it("should handle optional parameters", () => {
			const sourceFile = createSourceFile(`
				function test(param?: string) {}
			`);
			
			const func = sourceFile.getFunction("test");
			const param = func?.getParameters()[0];
			
			if (!param) {
				throw new Error("Parameter not found in test code");
			}
			
			const result = extractParameterDoc(param);
			
			expect(result.isOptional).toBe(true);
		});

		it("should handle parameters with default values", () => {
			const sourceFile = createSourceFile(`
				function test(param: string = "default") {}
			`);
			
			const func = sourceFile.getFunction("test");
			const param = func?.getParameters()[0];
			
			if (!param) {
				throw new Error("Parameter not found in test code");
			}
			
			const result = extractParameterDoc(param);
			
			expect(result.defaultValue).toBe('"default"');
		});

		it("should handle parameters with complex types", () => {
			const sourceFile = createSourceFile(`
				function test(param: string | number | { prop: boolean }) {}
			`);
			
			const func = sourceFile.getFunction("test");
			const param = func?.getParameters()[0];
			
			if (!param) {
				throw new Error("Parameter not found in test code");
			}
			
			const result = extractParameterDoc(param);
			
			expect(result.type).toMatch(/string \| number \| \{.+\}/);
		});
	});
});