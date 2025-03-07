import path from "node:path";

import {
	type ClassDoc,
	type DocItem,
	DocItemKind,
	type EnumDoc,
	type FunctionDoc,
	type InterfaceDoc,
	type MethodDoc,
	type ParameterDoc,
	type PropertyDoc,
	type TypeAliasDoc,
} from "../parser/traversal";

/**
 * Markdown formatting options
 */
export interface MarkdownOptions {
	tocDepth: number;
	linkReferences: boolean;
	includeTypes: boolean;
	includeExamples: boolean;
}

/**
 * Format documentation items as Markdown
 */
export function formatMarkdown(
	items: DocItem[],
	options: MarkdownOptions,
): string {
	// Sort items by kind and name
	const sortedItems = [...items].sort((a, b) => {
		// Sort by kind first
		const kindOrder = [
			DocItemKind.Class,
			DocItemKind.Interface,
			DocItemKind.Function,
			DocItemKind.TypeAlias,
			DocItemKind.Enum,
		];

		const aKindIndex = kindOrder.indexOf(a.kind);
		const bKindIndex = kindOrder.indexOf(b.kind);

		if (aKindIndex !== bKindIndex) {
			return aKindIndex - bKindIndex;
		}

		// Then sort by name
		return a.name.localeCompare(b.name);
	});

	let markdown = "";

	// Generate table of contents
	markdown += formatTableOfContents(sortedItems, options.tocDepth);
	markdown += "\n\n";

	// Format each item
	for (const item of sortedItems) {
		switch (item.kind) {
			case DocItemKind.Function:
				markdown += formatFunction(item as FunctionDoc, options);
				break;
			case DocItemKind.Class:
				markdown += formatClass(item as ClassDoc, options);
				break;
			case DocItemKind.Interface:
				markdown += formatInterface(item as InterfaceDoc, options);
				break;
			case DocItemKind.Enum:
				markdown += formatEnum(item as EnumDoc, options);
				break;
			case DocItemKind.TypeAlias:
				markdown += formatTypeAlias(item as TypeAliasDoc, options);
				break;
		}

		markdown += "\n\n";
	}

	return markdown;
}

/**
 * Format a table of contents subitem section (properties or methods)
 */
function formatTocSubItems(
	parentName: string,
	items: { name: string }[],
	sectionName: string,
): string {
	if (items.length === 0) {
		return "";
	}

	let toc = `  - ${sectionName}\n`;
	for (const item of items) {
		const itemSlug = getSlug(`${parentName}-${item.name}`);
		toc += `    - [${item.name}](#${itemSlug})\n`;
	}
	return toc;
}

/**
 * Format a table of contents from documentation items
 * @internal This function is exported for testing purposes only
 */
export function formatTableOfContents(items: DocItem[], depth: number): string {
	const getKindHeading = (kind: DocItemKind): string => {
		switch (kind) {
			case DocItemKind.Class:
				return "Classes";
			case DocItemKind.Interface:
				return "Interfaces";
			case DocItemKind.Function:
				return "Functions";
			case DocItemKind.Enum:
				return "Enums";
			case DocItemKind.TypeAlias:
				return "Type Aliases";
			default:
				return "Other";
		}
	};

	let toc = "# Table of Contents\n\n";

	// Group items by kind
	const kindGroups = new Map<DocItemKind, DocItem[]>();

	for (const item of items) {
		if (!kindGroups.has(item.kind)) {
			kindGroups.set(item.kind, []);
		}
		kindGroups.get(item.kind)?.push(item);
	}

	// Generate TOC for each kind
	for (const [kind, kindItems] of kindGroups.entries()) {
		toc += `## ${getKindHeading(kind)}\n\n`;

		for (const item of kindItems) {
			const slug = getSlug(item.name);
			toc += `- [${item.name}](#${slug})\n`;

			// Add sub-items for classes and interfaces if depth > 1
			if (depth > 1) {
				if (kind === DocItemKind.Class) {
					const classDoc = item as ClassDoc;
					toc += formatTocSubItems(
						item.name,
						classDoc.properties,
						"Properties",
					);
					toc += formatTocSubItems(item.name, classDoc.methods, "Methods");
				} else if (kind === DocItemKind.Interface) {
					const ifaceDoc = item as InterfaceDoc;
					toc += formatTocSubItems(
						item.name,
						ifaceDoc.properties,
						"Properties",
					);
					toc += formatTocSubItems(item.name, ifaceDoc.methods, "Methods");
				}
			}
		}

		toc += "\n";
	}

	return toc;
}

/**
 * Creates anchor and header for a documentation item
 */
function formatItemHeader(name: string, level = 2): string {
	return `<a id="${getSlug(name)}"></a>\n\n${"#".repeat(level)} ${name}\n\n`;
}

/**
 * Formats a description if present
 */
function formatDescription(description?: string): string {
	return description ? `${description}\n\n` : "";
}

/**
 * Formats source location information
 */
function formatSourceLocation(location: DocItem["location"]): string {
	return `### Source\n\n[${path.basename(location.filePath)}:${location.line}](${location.filePath}#L${location.line})\n\n`;
}

/**
 * Formats a code block with the provided code
 */
function formatCodeBlock(code: string, language = "typescript"): string {
	return `\`\`\`${language}\n${code}\`\`\`\n\n`;
}

/**
 * Format a function as Markdown
 * @internal This function is exported for testing purposes only
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
 * Format a class declaration as typescript code
 */
function formatClassDeclaration(cls: ClassDoc): string {
	let declaration = `class ${cls.name}`;

	if (cls.typeParameters && cls.typeParameters.length > 0) {
		declaration += `<${cls.typeParameters.join(", ")}>`;
	}

	if (cls.extends) {
		declaration += ` extends ${cls.extends}`;
	}

	if (cls.implements && cls.implements.length > 0) {
		declaration += ` implements ${cls.implements.join(", ")}`;
	}

	declaration += " {\n";

	// Add a placeholder for properties and methods
	if (
		cls.properties.length > 0 ||
		cls.methods.length > 0 ||
		cls.constructors.length > 0
	) {
		declaration += "  // Properties, methods, and constructors\n";
	}

	declaration += "}\n";

	return declaration;
}

/**
 * Format a collection of items with a section header
 */
function formatItemCollection<T>(
	items: T[],
	sectionName: string,
	formatter: (item: T) => string,
): string {
	if (items.length === 0) {
		return "";
	}

	let markdown = `### ${sectionName}\n\n`;
	for (const item of items) {
		markdown += formatter(item);
	}

	return markdown;
}

/**
 * Format a class as Markdown
 * @internal This function is exported for testing purposes only
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
 * Format an interface declaration as typescript code
 */
function formatInterfaceDeclaration(iface: InterfaceDoc): string {
	let declaration = `interface ${iface.name}`;

	if (iface.typeParameters && iface.typeParameters.length > 0) {
		declaration += `<${iface.typeParameters.join(", ")}>`;
	}

	if (iface.extends && iface.extends.length > 0) {
		declaration += ` extends ${iface.extends.join(", ")}`;
	}

	declaration += " {\n";

	// Add a placeholder for properties and methods
	if (iface.properties.length > 0 || iface.methods.length > 0) {
		declaration += "  // Properties and methods\n";
	}

	declaration += "}\n";

	return declaration;
}

/**
 * Format an interface as Markdown
 * @internal This function is exported for testing purposes only
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
 * Format an enum declaration as typescript code
 */
function formatEnumDeclaration(enumDoc: EnumDoc): string {
	let declaration = `enum ${enumDoc.name} {\n`;

	for (const member of enumDoc.members) {
		declaration += `  ${member.name}`;

		if (member.value !== undefined) {
			declaration += ` = ${member.value}`;
		}

		declaration += ",\n";
	}

	declaration += "}\n";

	return declaration;
}

/**
 * Format an enum member
 */
function formatEnumMember(member: EnumDoc["members"][0]): string {
	let markdown = `#### ${member.name}\n\n`;

	if (member.value !== undefined) {
		markdown += `Value: \`${member.value}\`\n\n`;
	}

	if (member.description) {
		markdown += `${member.description}\n\n`;
	}

	return markdown;
}

/**
 * Format an enum as Markdown
 * @internal This function is exported for testing purposes only
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
 * Format a type alias declaration as typescript code
 */
function formatTypeAliasDeclaration(typeAlias: TypeAliasDoc): string {
	let declaration = `type ${typeAlias.name}`;

	if (typeAlias.typeParameters && typeAlias.typeParameters.length > 0) {
		declaration += `<${typeAlias.typeParameters.join(", ")}>`;
	}

	declaration += ` = ${typeAlias.type};\n`;

	return declaration;
}

/**
 * Format a type alias as Markdown
 * @internal This function is exported for testing purposes only
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

/**
 * Format a property declaration as typescript code
 */
function formatPropertyDeclaration(
	prop: PropertyDoc,
	options: MarkdownOptions,
): string {
	let declaration = "";

	if (prop.isStatic) {
		declaration += "static ";
	}

	if (prop.isReadonly) {
		declaration += "readonly ";
	}

	declaration += prop.name;

	if (prop.isOptional) {
		declaration += "?";
	}

	if (options.includeTypes) {
		declaration += `: ${prop.type}`;
	}

	declaration += ";\n";

	return declaration;
}

/**
 * Format a property as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatProperty(
	prop: PropertyDoc,
	parentName: string,
	options: MarkdownOptions,
): string {
	// Create an anchor with parent name for proper linking
	const anchorId = getSlug(`${parentName}-${prop.name}`);
	let markdown = `<a id="${anchorId}"></a>\n\n`;
	markdown += `#### ${prop.name}\n\n`;

	markdown += formatDescription(prop.description);

	// Property signature
	markdown += formatCodeBlock(formatPropertyDeclaration(prop, options));

	return markdown;
}

/**
 * Format a method as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatMethod(
	method: MethodDoc,
	parentName: string,
	options: MarkdownOptions,
): string {
	// Create an anchor with parent name for proper linking
	const anchorId = getSlug(`${parentName}-${method.name}`);
	let markdown = `<a id="${anchorId}"></a>\n\n`;
	markdown += `#### ${method.name}\n\n`;

	markdown += formatDescription(method.description);

	// Method signature
	markdown += formatCodeBlock(formatMethodSignature(method));

	// Parameters - use H5 for parameter section
	if (method.parameters.length > 0) {
		markdown += "##### Parameters\n\n";
		markdown += formatParameters(method.parameters, options);
	}

	// Return type - use H5 for return section
	markdown += "##### Returns\n\n";
	markdown += `\`${method.returnType}\`\n\n`;

	return markdown;
}

/**
 * Format parameters as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatParameters(
	parameters: ParameterDoc[],
	options: MarkdownOptions,
): string {
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
 * Format a function signature
 * @internal This function is exported for testing purposes only
 */
export function formatFunctionSignature(func: FunctionDoc): string {
	let signature = `function ${func.name}`;

	if (func.typeParameters && func.typeParameters.length > 0) {
		signature += `<${func.typeParameters.join(", ")}>`;
	}

	signature += "(";

	if (func.parameters.length > 0) {
		signature += "\n";
		for (let i = 0; i < func.parameters.length; i++) {
			const param = func.parameters[i];
			signature += `  ${param.name}`;

			if (param.isOptional) {
				signature += "?";
			}

			signature += `: ${param.type}`;

			if (param.defaultValue) {
				signature += ` = ${param.defaultValue}`;
			}

			if (i < func.parameters.length - 1) {
				signature += ",";
			}

			signature += "\n";
		}
	}

	signature += `): ${func.returnType}`;

	return signature;
}

/**
 * Format a method signature
 * @internal This function is exported for testing purposes only
 */
export function formatMethodSignature(method: MethodDoc): string {
	let signature = "";

	if (method.isStatic) {
		signature += "static ";
	}

	if (method.isAsync) {
		signature += "async ";
	}

	signature += method.name;

	if (method.typeParameters && method.typeParameters.length > 0) {
		signature += `<${method.typeParameters.join(", ")}>`;
	}

	signature += "(";

	if (method.parameters.length > 0) {
		signature += "\n";
		for (let i = 0; i < method.parameters.length; i++) {
			const param = method.parameters[i];
			signature += `  ${param.name}`;

			if (param.isOptional) {
				signature += "?";
			}

			signature += `: ${param.type}`;

			if (param.defaultValue) {
				signature += ` = ${param.defaultValue}`;
			}

			if (i < method.parameters.length - 1) {
				signature += ",";
			}

			signature += "\n";
		}
	}

	signature += `): ${method.returnType}`;

	return signature;
}

/**
 * Create a slug from a string
 * @internal This function is exported for testing purposes only
 */
export function getSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}
