import {
	ClassDeclaration,
	EnumDeclaration,
	FunctionDeclaration,
	InterfaceDeclaration,
	JSDoc,
	MethodDeclaration,
	ParameterDeclaration,
	PropertyDeclaration,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";
import { parse as parseJSDoc } from "comment-parser";

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
 * Extract documentation from a source file
 * @internal This function is exported for testing purposes only
 */
export function extractDocumentation(sourceFile: SourceFile): DocItem[] {
	const items: DocItem[] = [];
	
	// Extract functions
	for (const func of sourceFile.getFunctions()) {
		// Get JSDoc comments
		const jsDocs = func.getJsDocs();
		const jsDocInfo = extractJSDocInfo(jsDocs);
		
		// Extract basic parameter information
		const parameters: ParameterDoc[] = func.getParameters().map(param => {
			// Get basic parameter info
			const paramDoc = extractParameterDoc(param);
			
			// Extract description from JSDoc
			const description = extractParameterDescription(param, jsDocs);
			if (description) {
				paramDoc.description = description;
			}
			// Fallback to using the parsed JSDoc info if direct method didn't work
			else if (jsDocInfo?.tags) {
				const paramTag = jsDocInfo.tags.find(
					tag => tag.tag === "param" && tag.name === param.getName()
				);
				if (paramTag?.description) {
					paramDoc.description = paramTag.description;
				}
			}
			
			return paramDoc;
		});
		
		items.push({
			name: func.getName() || "anonymous",
			kind: DocItemKind.Function,
			description: func.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: sourceFile.getFilePath(),
				line: func.getStartLineNumber(),
			},
			jsDoc: jsDocInfo,
			parameters,
			returnType: func.getReturnType().getText(),
			typeParameters: func.getTypeParameters().map(tp => tp.getText()),
		} as FunctionDoc);
	}
	
	// Extract classes
	for (const cls of sourceFile.getClasses()) {
		const properties: PropertyDoc[] = cls.getProperties().map(prop => {
			return {
				name: prop.getName(),
				kind: DocItemKind.Property,
				description: prop.getJsDocs()?.[0]?.getDescription()?.trim(),
				location: {
					filePath: sourceFile.getFilePath(),
					line: prop.getStartLineNumber(),
				},
				jsDoc: extractJSDocInfo(prop.getJsDocs()),
				type: prop.getType().getText(),
				isStatic: prop.isStatic(),
				isReadonly: prop.isReadonly(),
				isOptional: prop.hasQuestionToken(),
			} as PropertyDoc;
		});
		
		const methods: MethodDoc[] = cls.getMethods().map(method => {
			// Get JSDoc comments
			const methodJsDocs = method.getJsDocs();
			const methodJsDocInfo = extractJSDocInfo(methodJsDocs);
			
			// Extract basic parameter information with JSDoc descriptions
			const parameters: ParameterDoc[] = method.getParameters().map(param => {
				// Get basic parameter info
				const paramDoc = extractParameterDoc(param);
				
				// Extract description from JSDoc
				const description = extractParameterDescription(param, methodJsDocs);
				if (description) {
					paramDoc.description = description;
				}
				// Fallback to using the parsed JSDoc info if direct method didn't work
				else if (methodJsDocInfo?.tags) {
					const paramTag = methodJsDocInfo.tags.find(
						tag => tag.tag === "param" && tag.name === param.getName()
					);
					if (paramTag?.description) {
						paramDoc.description = paramTag.description;
					}
				}
				
				return paramDoc;
			});
			
			return {
				name: method.getName(),
				kind: DocItemKind.Method,
				description: method.getJsDocs()?.[0]?.getDescription()?.trim(),
				location: {
					filePath: sourceFile.getFilePath(),
					line: method.getStartLineNumber(),
				},
				jsDoc: methodJsDocInfo,
				parameters,
				returnType: method.getReturnType().getText(),
				isStatic: method.isStatic(),
				isAsync: method.isAsync(), // Check if the method is async
				typeParameters: method.getTypeParameters().map(tp => tp.getText()),
			} as MethodDoc;
		});
		
		const constructors: MethodDoc[] = cls.getConstructors().map(ctor => {
			// Get JSDoc comments for constructor
			const ctorJsDocs = ctor.getJsDocs();
			const ctorJsDocInfo = extractJSDocInfo(ctorJsDocs);
			
			// Extract basic parameter information with JSDoc descriptions
			const parameters: ParameterDoc[] = ctor.getParameters().map(param => {
				// Get basic parameter info
				const paramDoc = extractParameterDoc(param);
				
				// Extract description from JSDoc
				const description = extractParameterDescription(param, ctorJsDocs);
				if (description) {
					paramDoc.description = description;
				}
				// Fallback to using the parsed JSDoc info if direct method didn't work
				else if (ctorJsDocInfo?.tags) {
					const paramTag = ctorJsDocInfo.tags.find(
						tag => tag.tag === "param" && tag.name === param.getName()
					);
					if (paramTag?.description) {
						paramDoc.description = paramTag.description;
					}
				}
				
				return paramDoc;
			});
			
			return {
				name: "constructor",
				kind: DocItemKind.Method,
				description: ctor.getJsDocs()?.[0]?.getDescription()?.trim(),
				location: {
					filePath: sourceFile.getFilePath(),
					line: ctor.getStartLineNumber(),
				},
				jsDoc: ctorJsDocInfo,
				parameters,
				returnType: cls.getName(),
				isStatic: false,
				isAsync: false,
			} as MethodDoc;
		});
		
		items.push({
			name: cls.getName(),
			kind: DocItemKind.Class,
			description: cls.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: sourceFile.getFilePath(),
				line: cls.getStartLineNumber(),
			},
			jsDoc: extractJSDocInfo(cls.getJsDocs()),
			properties,
			methods,
			constructors,
			extends: cls.getExtends()?.getText(),
			implements: cls.getImplements().map(impl => impl.getText()),
			typeParameters: cls.getTypeParameters().map(tp => tp.getText()),
		} as ClassDoc);
	}
	
	// Extract interfaces
	for (const iface of sourceFile.getInterfaces()) {
		const properties = extractInterfaceProperties(iface);
		const methods = extractInterfaceMethods(iface);
		
		items.push({
			name: iface.getName(),
			kind: DocItemKind.Interface,
			description: iface.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: sourceFile.getFilePath(),
				line: iface.getStartLineNumber(),
			},
			jsDoc: extractJSDocInfo(iface.getJsDocs()),
			properties,
			methods,
			extends: iface.getExtends().map(ext => ext.getText()),
			typeParameters: iface.getTypeParameters().map(tp => tp.getText()),
		} as InterfaceDoc);
	}
	
	// Extract enums
	for (const enumDecl of sourceFile.getEnums()) {
		const members = enumDecl.getMembers().map(member => {
			return {
				name: member.getName(),
				value: member.getValue()?.toString(),
				description: member.getJsDocs()?.[0]?.getDescription()?.trim(),
			};
		});
		
		items.push({
			name: enumDecl.getName(),
			kind: DocItemKind.Enum,
			description: enumDecl.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: sourceFile.getFilePath(),
				line: enumDecl.getStartLineNumber(),
			},
			jsDoc: extractJSDocInfo(enumDecl.getJsDocs()),
			members,
		} as EnumDoc);
	}
	
	// Extract type aliases
	for (const typeAlias of sourceFile.getTypeAliases()) {
		items.push({
			name: typeAlias.getName(),
			kind: DocItemKind.TypeAlias,
			description: typeAlias.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: sourceFile.getFilePath(),
				line: typeAlias.getStartLineNumber(),
			},
			jsDoc: extractJSDocInfo(typeAlias.getJsDocs()),
			type: typeAlias.getType().getText(),
			typeParameters: typeAlias.getTypeParameters().map(tp => tp.getText()),
		} as TypeAliasDoc);
	}
	
	return items;
}

/**
 * Extract interface properties
 */
function extractInterfaceProperties(iface: InterfaceDeclaration): PropertyDoc[] {
	return iface.getProperties().map(prop => {
		return {
			name: prop.getName(),
			kind: DocItemKind.Property,
			description: prop.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: prop.getSourceFile().getFilePath(),
				line: prop.getStartLineNumber(),
			},
			jsDoc: extractJSDocInfo(prop.getJsDocs()),
			type: prop.getType().getText(),
			isStatic: false,
			isReadonly: prop.isReadonly(),
			isOptional: prop.hasQuestionToken(),
		} as PropertyDoc;
	});
}

/**
 * Extract interface methods
 */
function extractInterfaceMethods(iface: InterfaceDeclaration): MethodDoc[] {
	return iface.getMethods().map(method => {
		// Get JSDoc comments for the method
		const methodJsDocs = method.getJsDocs();
		const methodJsDocInfo = extractJSDocInfo(methodJsDocs);
		
		// Extract basic parameter information with JSDoc descriptions
		const parameters: ParameterDoc[] = method.getParameters().map(param => {
			// Get basic parameter info
			const paramDoc = extractParameterDoc(param);
			
			// Extract description from JSDoc
			const description = extractParameterDescription(param, methodJsDocs);
			if (description) {
				paramDoc.description = description;
			}
			// Fallback to using the parsed JSDoc info if direct method didn't work
			else if (methodJsDocInfo?.tags) {
				const paramTag = methodJsDocInfo.tags.find(
					tag => tag.tag === "param" && tag.name === param.getName()
				);
				if (paramTag?.description) {
					paramDoc.description = paramTag.description;
				}
			}
			
			return paramDoc;
		});
		
		return {
			name: method.getName(),
			kind: DocItemKind.Method,
			description: method.getJsDocs()?.[0]?.getDescription()?.trim(),
			location: {
				filePath: method.getSourceFile().getFilePath(),
				line: method.getStartLineNumber(),
			},
			jsDoc: methodJsDocInfo,
			parameters,
			returnType: method.getReturnType().getText(),
			isStatic: false,
			isAsync: false, // Interface methods cannot be async
			typeParameters: method.getTypeParameters().map(tp => tp.getText()),
		} as MethodDoc;
	});
}

/**
 * Extract parameter documentation
 * @internal This function is exported for testing purposes only
 */
export function extractParameterDoc(param: ParameterDeclaration): ParameterDoc {
	return {
		name: param.getName(),
		kind: DocItemKind.Parameter,
		description: "", // Parameters don't have direct JSDoc, they come from function JSDoc
		location: {
			filePath: param.getSourceFile().getFilePath(),
			line: param.getStartLineNumber(),
		},
		type: param.getType().getText(),
		isOptional: param.isOptional(),
		defaultValue: param.getInitializer()?.getText(),
	};
}

/**
 * Extracts parameter description from JSDoc tags
 * @internal This function is exported for testing purposes only
 */
export function extractParameterDescription(param: ParameterDeclaration, jsDocs: JSDoc[] | undefined): string {
	if (!jsDocs || jsDocs.length === 0) {
		return "";
	}
	
	const paramName = param.getName();
	
	// Look through each JSDoc block
	for (const jsDoc of jsDocs) {
		// Get the tags
		const tags = jsDoc.getTags();
		
		// Look for a @param tag that matches this parameter
		for (const tag of tags) {
			if (tag.getTagName() === "param") {
				const tagText = tag.getText();
				
				// Extract the parameter name from the tag text
				// The tagText may include the entire tag: "@param paramName description"
				// or it might just be "paramName description"
				const paramRegex = new RegExp(`(?:@param\\s+)?(${paramName})\\b\\s*(.+)?`, "i");
				const match = tagText.match(paramRegex);
				
				if (match && match[1] === paramName) {
					try {
						// Try to get the comment using the tag's getComment() method
						const comment = tag.getComment?.();
						if (comment) {
							return comment.trim();
						}
						
						// If no getComment or it returned empty, but we matched in the regex
						if (match[2]) {
							return match[2].trim();
						}
					} catch (e) {
						// Fallback for tests with mocked objects
						if (match[2]) {
							return match[2].trim();
						}
					}
				}
			}
		}
	}
	
	return "";
}

/**
 * Parse JSDoc comments into structured information
 * @internal This function is exported for testing purposes only
 */
export function extractJSDocInfo(jsDocs: JSDoc[] | undefined): JSDocInfo | undefined {
	if (!jsDocs || jsDocs.length === 0) {
		return undefined;
	}
	
	// Get the first JSDoc comment
	const jsDoc = jsDocs[0];
	const commentText = jsDoc.getDescription();
	
	// Extract tags directly from ts-morph
	const tags: JSDocTag[] = [];
	
	for (const tag of jsDoc.getTags()) {
		const tagName = tag.getTagName();
		
		if (tagName === "param") {
			// For param tags, extract the parameter name from the tag text
			const tagText = tag.getText();
			const paramMatch = tagText.match(/^(\w+)(?:\s+.*)?$/);
			
			// Try to get comment using getComment (available in actual code)
			let comment = "";
			try {
				comment = tag.getComment?.() || "";
			} catch (e) {
				// Fallback for tests with mocked objects
				comment = tagText.replace(/^\w+\s*/, "").trim();
			}
			
			if (paramMatch) {
				const paramName = paramMatch[1];
				tags.push({
					tag: "param",
					name: paramName,
					description: comment.trim(),
				});
			} else {
				// Fallback if we can't extract the parameter name
				tags.push({
					tag: "param",
					name: "",
					description: comment.trim(),
				});
			}
		} else {
			// For other tags, just use the comment
			let comment = "";
			try {
				comment = tag.getComment?.() || "";
			} catch (e) {
				// Fallback for tests with mocked objects
				comment = tag.getText().trim();
			}
			
			tags.push({
				tag: tagName,
				name: "",
				description: comment,
			});
		}
	}
	
	return {
		description: commentText,
		tags,
	};
}