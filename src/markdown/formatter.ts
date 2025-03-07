import {
	type ClassDoc,
	type DocItem,
	DocItemKind,
	type EnumDoc,
	type FunctionDoc,
	type InterfaceDoc,
	type MarkdownOptions,
	type TypeAliasDoc,
} from "../parser/models";
import {
	formatClass,
	formatEnum,
	formatFunction,
	formatInterface,
	formatTableOfContents,
	formatTypeAlias,
} from "./formatters";

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
