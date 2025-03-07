/**
 * Base interface for all documentation items
 */
export interface DocItem {
	name: string;
	description?: string;
	kind: DocItemKind;
	location: {
		filePath: string;
		line: number;
	};
	jsDoc?: JSDocInfo;
}

/**
 * Types of documentation items
 */
export enum DocItemKind {
	Function = "function",
	Class = "class",
	Interface = "interface",
	Enum = "enum",
	TypeAlias = "typeAlias",
	Property = "property",
	Method = "method",
	Parameter = "parameter",
}

/**
 * Parsed JSDoc information
 */
export interface JSDocInfo {
	description?: string;
	tags: JSDocTag[];
}

/**
 * JSDoc tag information
 */
export interface JSDocTag {
	tag: string;
	name?: string;
	description?: string;
}

/**
 * Function documentation information
 */
export interface FunctionDoc extends DocItem {
	kind: DocItemKind.Function;
	parameters: ParameterDoc[];
	returnType: string;
	typeParameters?: string[];
}

/**
 * Class documentation information
 */
export interface ClassDoc extends DocItem {
	kind: DocItemKind.Class;
	properties: PropertyDoc[];
	methods: MethodDoc[];
	constructors: MethodDoc[];
	extends?: string;
	implements?: string[];
	typeParameters?: string[];
}

/**
 * Interface documentation information
 */
export interface InterfaceDoc extends DocItem {
	kind: DocItemKind.Interface;
	properties: PropertyDoc[];
	methods: MethodDoc[];
	extends?: string[];
	typeParameters?: string[];
}

/**
 * Enum documentation information
 */
export interface EnumDoc extends DocItem {
	kind: DocItemKind.Enum;
	members: {
		name: string;
		value?: string;
		description?: string;
	}[];
}

/**
 * Type alias documentation information
 */
export interface TypeAliasDoc extends DocItem {
	kind: DocItemKind.TypeAlias;
	type: string;
	typeParameters?: string[];
}

/**
 * Property documentation information
 */
export interface PropertyDoc extends DocItem {
	kind: DocItemKind.Property;
	type: string;
	isStatic: boolean;
	isReadonly: boolean;
	isOptional: boolean;
}

/**
 * Method documentation information
 */
export interface MethodDoc extends DocItem {
	kind: DocItemKind.Method;
	parameters: ParameterDoc[];
	returnType: string;
	isStatic: boolean;
	isAsync: boolean;
	typeParameters?: string[];
}

/**
 * Parameter documentation information
 */
export interface ParameterDoc extends DocItem {
	kind: DocItemKind.Parameter;
	type: string;
	isOptional: boolean;
	defaultValue?: string;
}

/**
 * Markdown formatting options
 */
export interface MarkdownOptions {
	tocDepth: number;
	linkReferences: boolean;
	includeTypes: boolean;
	includeExamples: boolean;
}
