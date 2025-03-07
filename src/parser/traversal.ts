import type { SourceFile } from "ts-morph";
import {
	extractClassDoc,
	extractEnumDoc,
	extractFunctionDoc,
	extractInterfaceDoc,
	extractTypeAliasDoc,
} from "./extractors";
import type { DocItem } from "./models";

export * from "./models";
export * from "./extractors";

/**
 * Extract documentation from a source file
 */
export function extractDocumentation(sourceFile: SourceFile): DocItem[] {
	const items: DocItem[] = [];

	// Extract functions
	for (const func of sourceFile.getFunctions()) {
		items.push(extractFunctionDoc(func));
	}

	// Extract classes
	for (const cls of sourceFile.getClasses()) {
		items.push(extractClassDoc(cls));
	}

	// Extract interfaces
	for (const iface of sourceFile.getInterfaces()) {
		items.push(extractInterfaceDoc(iface));
	}

	// Extract enums
	for (const enumDecl of sourceFile.getEnums()) {
		items.push(extractEnumDoc(enumDecl));
	}

	// Extract type aliases
	for (const typeAlias of sourceFile.getTypeAliases()) {
		items.push(extractTypeAliasDoc(typeAlias));
	}

	return items;
}
