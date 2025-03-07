import path from "node:path";
import type { DocItem } from "../../parser/traversal";

/**
 * Creates anchor and header for a documentation item
 */
export function formatItemHeader(name: string, level = 2): string {
	return `<a id="${getSlug(name)}"></a>\n\n${"#".repeat(level)} ${name}\n\n`;
}

/**
 * Formats a description if present
 */
export function formatDescription(description?: string): string {
	return description ? `${description}\n\n` : "";
}

/**
 * Formats source location information
 */
export function formatSourceLocation(location: DocItem["location"]): string {
	return `### Source\n\n[${path.basename(location.filePath)}:${location.line}](${location.filePath}#L${location.line})\n\n`;
}

/**
 * Formats a code block with the provided code
 */
export function formatCodeBlock(code: string, language = "typescript"): string {
	return `\`\`\`${language}\n${code}\`\`\`\n\n`;
}

/**
 * Format a collection of items with a section header
 */
export function formatItemCollection<T>(
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
 * Create a slug from a string
 */
export function getSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}
