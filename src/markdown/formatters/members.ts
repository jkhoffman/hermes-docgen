import type {
	EnumDoc,
	MarkdownOptions,
	MethodDoc,
	ParameterDoc,
	PropertyDoc,
} from "../../parser/traversal";
import { formatMethodSignature } from "./declarations";
import { formatCodeBlock, formatDescription, getSlug } from "./utils";

/**
 * Format a property declaration as typescript code
 */
export function formatPropertyDeclaration(
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
 * Format an enum member
 */
export function formatEnumMember(member: EnumDoc["members"][0]): string {
	let markdown = `#### ${member.name}\n\n`;

	if (member.value !== undefined) {
		markdown += `Value: \`${member.value}\`\n\n`;
	}

	if (member.description) {
		markdown += `${member.description}\n\n`;
	}

	return markdown;
}
