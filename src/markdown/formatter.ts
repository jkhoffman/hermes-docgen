import path from "path";
import {
	ClassDoc,
	DocItem,
	DocItemKind,
	EnumDoc,
	FunctionDoc,
	InterfaceDoc,
	MethodDoc,
	ParameterDoc,
	PropertyDoc,
	TypeAliasDoc,
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
	options: MarkdownOptions
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
		kindGroups.get(item.kind)!.push(item);
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
					
					// Properties
					if (classDoc.properties.length > 0) {
						toc += "  - Properties\n";
						for (const prop of classDoc.properties) {
							const propSlug = getSlug(`${item.name}-${prop.name}`);
							toc += `    - [${prop.name}](#${propSlug})\n`;
						}
					}
					
					// Methods
					if (classDoc.methods.length > 0) {
						toc += "  - Methods\n";
						for (const method of classDoc.methods) {
							const methodSlug = getSlug(`${item.name}-${method.name}`);
							toc += `    - [${method.name}](#${methodSlug})\n`;
						}
					}
				} else if (kind === DocItemKind.Interface) {
					const ifaceDoc = item as InterfaceDoc;
					
					// Properties
					if (ifaceDoc.properties.length > 0) {
						toc += "  - Properties\n";
						for (const prop of ifaceDoc.properties) {
							const propSlug = getSlug(`${item.name}-${prop.name}`);
							toc += `    - [${prop.name}](#${propSlug})\n`;
						}
					}
					
					// Methods
					if (ifaceDoc.methods.length > 0) {
						toc += "  - Methods\n";
						for (const method of ifaceDoc.methods) {
							const methodSlug = getSlug(`${item.name}-${method.name}`);
							toc += `    - [${method.name}](#${methodSlug})\n`;
						}
					}
				}
			}
		}
		
		toc += "\n";
	}
	
	return toc;
}

/**
 * Format a function as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatFunction(func: FunctionDoc, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(func.name)}"></a>\n\n`;
	markdown += `## ${func.name}\n\n`;
	
	if (func.description) {
		markdown += `${func.description}\n\n`;
	}
	
	// Function signature
	markdown += "```typescript\n";
	markdown += formatFunctionSignature(func);
	markdown += "\n```\n\n";
	
	// Parameters
	if (func.parameters.length > 0) {
		markdown += "### Parameters\n\n";
		markdown += formatParameters(func.parameters, options);
	}
	
	// Return type
	markdown += "### Returns\n\n";
	markdown += `\`${func.returnType}\`\n\n`;
	
	// Source location
	markdown += "### Source\n\n";
	markdown += `[${path.basename(func.location.filePath)}:${func.location.line}](${func.location.filePath}#L${func.location.line})\n\n`;
	
	return markdown;
}

/**
 * Format a class as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatClass(cls: ClassDoc, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(cls.name)}"></a>\n\n`;
	markdown += `## ${cls.name}\n\n`;
	
	if (cls.description) {
		markdown += `${cls.description}\n\n`;
	}
	
	// Class declaration
	markdown += "```typescript\n";
	markdown += `class ${cls.name}`;
	
	if (cls.typeParameters && cls.typeParameters.length > 0) {
		markdown += `<${cls.typeParameters.join(", ")}>`;
	}
	
	if (cls.extends) {
		markdown += ` extends ${cls.extends}`;
	}
	
	if (cls.implements && cls.implements.length > 0) {
		markdown += ` implements ${cls.implements.join(", ")}`;
	}
	
	markdown += " {\n";
	
	// Add a placeholder for properties and methods
	if (cls.properties.length > 0 || cls.methods.length > 0 || cls.constructors.length > 0) {
		markdown += "  // Properties, methods, and constructors\n";
	}
	
	markdown += "}\n";
	markdown += "```\n\n";
	
	// Constructors
	if (cls.constructors.length > 0) {
		markdown += "### Constructors\n\n";
		
		for (const ctor of cls.constructors) {
			markdown += formatMethod(ctor, cls.name, options);
		}
	}
	
	// Properties
	if (cls.properties.length > 0) {
		markdown += "### Properties\n\n";
		
		for (const prop of cls.properties) {
			markdown += formatProperty(prop, cls.name, options);
		}
	}
	
	// Methods
	if (cls.methods.length > 0) {
		markdown += "### Methods\n\n";
		
		for (const method of cls.methods) {
			markdown += formatMethod(method, cls.name, options);
		}
	}
	
	// Source location
	markdown += "### Source\n\n";
	markdown += `[${path.basename(cls.location.filePath)}:${cls.location.line}](${cls.location.filePath}#L${cls.location.line})\n\n`;
	
	return markdown;
}

/**
 * Format an interface as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatInterface(iface: InterfaceDoc, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(iface.name)}"></a>\n\n`;
	markdown += `## ${iface.name}\n\n`;
	
	if (iface.description) {
		markdown += `${iface.description}\n\n`;
	}
	
	// Interface declaration
	markdown += "```typescript\n";
	markdown += `interface ${iface.name}`;
	
	if (iface.typeParameters && iface.typeParameters.length > 0) {
		markdown += `<${iface.typeParameters.join(", ")}>`;
	}
	
	if (iface.extends && iface.extends.length > 0) {
		markdown += ` extends ${iface.extends.join(", ")}`;
	}
	
	markdown += " {\n";
	
	// Add a placeholder for properties and methods
	if (iface.properties.length > 0 || iface.methods.length > 0) {
		markdown += "  // Properties and methods\n";
	}
	
	markdown += "}\n";
	markdown += "```\n\n";
	
	// Properties
	if (iface.properties.length > 0) {
		markdown += "### Properties\n\n";
		
		for (const prop of iface.properties) {
			markdown += formatProperty(prop, iface.name, options);
		}
	}
	
	// Methods
	if (iface.methods.length > 0) {
		markdown += "### Methods\n\n";
		
		for (const method of iface.methods) {
			markdown += formatMethod(method, iface.name, options);
		}
	}
	
	// Source location
	markdown += "### Source\n\n";
	markdown += `[${path.basename(iface.location.filePath)}:${iface.location.line}](${iface.location.filePath}#L${iface.location.line})\n\n`;
	
	return markdown;
}

/**
 * Format an enum as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatEnum(enumDoc: EnumDoc, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(enumDoc.name)}"></a>\n\n`;
	markdown += `## ${enumDoc.name}\n\n`;
	
	if (enumDoc.description) {
		markdown += `${enumDoc.description}\n\n`;
	}
	
	// Enum declaration
	markdown += "```typescript\n";
	markdown += `enum ${enumDoc.name} {\n`;
	
	for (const member of enumDoc.members) {
		markdown += `  ${member.name}`;
		
		if (member.value !== undefined) {
			markdown += ` = ${member.value}`;
		}
		
		markdown += ",\n";
	}
	
	markdown += "}\n";
	markdown += "```\n\n";
	
	// Members
	if (enumDoc.members.length > 0) {
		markdown += "### Members\n\n";
		
		for (const member of enumDoc.members) {
			markdown += `#### ${member.name}\n\n`;
			
			if (member.value !== undefined) {
				markdown += `Value: \`${member.value}\`\n\n`;
			}
			
			if (member.description) {
				markdown += `${member.description}\n\n`;
			}
		}
	}
	
	// Source location
	markdown += "### Source\n\n";
	markdown += `[${path.basename(enumDoc.location.filePath)}:${enumDoc.location.line}](${enumDoc.location.filePath}#L${enumDoc.location.line})\n\n`;
	
	return markdown;
}

/**
 * Format a type alias as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatTypeAlias(typeAlias: TypeAliasDoc, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(typeAlias.name)}"></a>\n\n`;
	markdown += `## ${typeAlias.name}\n\n`;
	
	if (typeAlias.description) {
		markdown += `${typeAlias.description}\n\n`;
	}
	
	// Type alias declaration
	markdown += "```typescript\n";
	markdown += `type ${typeAlias.name}`;
	
	if (typeAlias.typeParameters && typeAlias.typeParameters.length > 0) {
		markdown += `<${typeAlias.typeParameters.join(", ")}>`;
	}
	
	markdown += ` = ${typeAlias.type};\n`;
	markdown += "```\n\n";
	
	// Source location
	markdown += "### Source\n\n";
	markdown += `[${path.basename(typeAlias.location.filePath)}:${typeAlias.location.line}](${typeAlias.location.filePath}#L${typeAlias.location.line})\n\n`;
	
	return markdown;
}

/**
 * Format a property as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatProperty(prop: PropertyDoc, parentName: string, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(`${parentName}-${prop.name}`)}"></a>\n\n`;
	markdown += `#### ${prop.name}\n\n`;
	
	if (prop.description) {
		markdown += `${prop.description}\n\n`;
	}
	
	// Property signature
	markdown += "```typescript\n";
	
	if (prop.isStatic) {
		markdown += "static ";
	}
	
	if (prop.isReadonly) {
		markdown += "readonly ";
	}
	
	markdown += prop.name;
	
	if (prop.isOptional) {
		markdown += "?";
	}
	
	if (options.includeTypes) {
		markdown += `: ${prop.type}`;
	}
	
	markdown += ";\n";
	markdown += "```\n\n";
	
	return markdown;
}

/**
 * Format a method as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatMethod(method: MethodDoc, parentName: string, options: MarkdownOptions): string {
	let markdown = `<a id="${getSlug(`${parentName}-${method.name}`)}"></a>\n\n`;
	markdown += `#### ${method.name}\n\n`;
	
	if (method.description) {
		markdown += `${method.description}\n\n`;
	}
	
	// Method signature
	markdown += "```typescript\n";
	markdown += formatMethodSignature(method);
	markdown += "\n```\n\n";
	
	// Parameters
	if (method.parameters.length > 0) {
		markdown += "##### Parameters\n\n";
		markdown += formatParameters(method.parameters, options);
	}
	
	// Return type
	markdown += "##### Returns\n\n";
	markdown += `\`${method.returnType}\`\n\n`;
	
	return markdown;
}

/**
 * Format parameters as Markdown
 * @internal This function is exported for testing purposes only
 */
export function formatParameters(parameters: ParameterDoc[], options: MarkdownOptions): string {
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