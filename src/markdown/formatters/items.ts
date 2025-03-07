import type {
	ClassDoc,
	EnumDoc,
	FunctionDoc,
	InterfaceDoc,
	MarkdownOptions,
	TypeAliasDoc,
} from "../../parser/traversal";
import {
	formatClassDeclaration,
	formatEnumDeclaration,
	formatFunctionSignature,
	formatInterfaceDeclaration,
	formatTypeAliasDeclaration,
} from "./declarations";
import { formatEnumMember, formatMethod, formatProperty } from "./members";
import {
	formatCodeBlock,
	formatDescription,
	formatItemCollection,
	formatItemHeader,
	formatSourceLocation,
} from "./utils";

/**
 * Format a function as Markdown
 */
export function formatFunction(
	func: FunctionDoc,
	options: MarkdownOptions,
): string {
	let markdown = formatItemHeader(func.name);
	markdown += formatDescription(func.description);

	// Function signature
	markdown += formatCodeBlock(formatFunctionSignature(func));

	// Parameters
	if (func.parameters.length > 0) {
		markdown += "### Parameters\n\n";
		markdown += formatParameters(func.parameters, options);
	}

	// Return type
	markdown += "### Returns\n\n";
	markdown += `\`${func.returnType}\`\n\n`;

	// Source location
	markdown += formatSourceLocation(func.location);

	return markdown;
}

/**
 * Format parameters as Markdown
 */
function formatParameters(
	parameters: FunctionDoc["parameters"],
	options: MarkdownOptions,
) {
	let markdown = "";

	for (const param of parameters) {
		markdown += `- \`${param.name}`;

		if (param.isOptional) {
			markdown += "?";
		}

		if (options.includeTypes) {
			markdown += `: ${param.type}`;
		}

		markdown += "`";

		if (param.defaultValue) {
			markdown += ` (default: \`${param.defaultValue}\`)`;
		}

		if (param.description) {
			markdown += ` - ${param.description}`;
		}

		markdown += "\n";
	}

	markdown += "\n";
	return markdown;
}

/**
 * Format a class as Markdown
 */
export function formatClass(cls: ClassDoc, options: MarkdownOptions): string {
	let markdown = formatItemHeader(cls.name);
	markdown += formatDescription(cls.description);

	// Class declaration
	markdown += formatCodeBlock(formatClassDeclaration(cls));

	// Constructors
	markdown += formatItemCollection(cls.constructors, "Constructors", (ctor) =>
		formatMethod(ctor, cls.name, options),
	);

	// Properties
	markdown += formatItemCollection(cls.properties, "Properties", (prop) =>
		formatProperty(prop, cls.name, options),
	);

	// Methods
	markdown += formatItemCollection(cls.methods, "Methods", (method) =>
		formatMethod(method, cls.name, options),
	);

	// Source location
	markdown += formatSourceLocation(cls.location);

	return markdown;
}

/**
 * Format an interface as Markdown
 */
export function formatInterface(
	iface: InterfaceDoc,
	options: MarkdownOptions,
): string {
	let markdown = formatItemHeader(iface.name);
	markdown += formatDescription(iface.description);

	// Interface declaration
	markdown += formatCodeBlock(formatInterfaceDeclaration(iface));

	// Properties
	markdown += formatItemCollection(iface.properties, "Properties", (prop) =>
		formatProperty(prop, iface.name, options),
	);

	// Methods
	markdown += formatItemCollection(iface.methods, "Methods", (method) =>
		formatMethod(method, iface.name, options),
	);

	// Source location
	markdown += formatSourceLocation(iface.location);

	return markdown;
}

/**
 * Format an enum as Markdown
 */
export function formatEnum(enumDoc: EnumDoc, options: MarkdownOptions): string {
	let markdown = formatItemHeader(enumDoc.name);
	markdown += formatDescription(enumDoc.description);

	// Enum declaration
	markdown += formatCodeBlock(formatEnumDeclaration(enumDoc));

	// Members
	markdown += formatItemCollection(
		enumDoc.members,
		"Members",
		formatEnumMember,
	);

	// Source location
	markdown += formatSourceLocation(enumDoc.location);

	return markdown;
}

/**
 * Format a type alias as Markdown
 */
export function formatTypeAlias(
	typeAlias: TypeAliasDoc,
	options: MarkdownOptions,
): string {
	let markdown = formatItemHeader(typeAlias.name);
	markdown += formatDescription(typeAlias.description);

	// Type alias declaration
	markdown += formatCodeBlock(formatTypeAliasDeclaration(typeAlias));

	// Source location
	markdown += formatSourceLocation(typeAlias.location);

	return markdown;
}
