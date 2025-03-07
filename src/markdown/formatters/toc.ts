import {
	type ClassDoc,
	type DocItem,
	DocItemKind,
	type InterfaceDoc,
} from "../../parser/traversal";
import { getSlug } from "./utils";

/**
 * Format a table of contents subitem section (properties or methods)
 */
export function formatTocSubItems(
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
 * Maps DocItemKind to a human-readable heading
 */
function getKindHeading(kind: DocItemKind): string {
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
}

/**
 * Format a table of contents from documentation items
 */
export function formatTableOfContents(items: DocItem[], depth: number): string {
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
