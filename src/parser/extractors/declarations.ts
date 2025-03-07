import type {
	ClassDeclaration,
	ConstructorDeclaration,
	EnumDeclaration,
	FunctionDeclaration,
	InterfaceDeclaration,
	MethodDeclaration,
	PropertyDeclaration,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";
import {
	type ClassDoc,
	DocItemKind,
	type EnumDoc,
	type FunctionDoc,
	type InterfaceDoc,
	type MethodDoc,
	type PropertyDoc,
	type TypeAliasDoc,
} from "../models";
import { extractJSDocInfo } from "./jsdoc";
import { extractParametersWithJSDoc } from "./parameters";

/**
 * Creates a location object for a node
 */
export function createLocationInfo(node: {
	getSourceFile(): SourceFile;
	getStartLineNumber(): number;
}): { filePath: string; line: number } {
	return {
		filePath: node.getSourceFile().getFilePath(),
		line: node.getStartLineNumber(),
	};
}

/**
 * Extract documentation for a function declaration
 */
export function extractFunctionDoc(func: FunctionDeclaration): FunctionDoc {
	// Get JSDoc comments
	const jsDocs = func.getJsDocs();
	const jsDocInfo = extractJSDocInfo(jsDocs);

	// Extract parameters with JSDoc descriptions
	const parameters = extractParametersWithJSDoc(
		func.getParameters(),
		jsDocs,
		jsDocInfo,
	);

	return {
		name: func.getName() || "anonymous",
		kind: DocItemKind.Function,
		description: func.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(func),
		jsDoc: jsDocInfo,
		parameters,
		returnType: func.getReturnType().getText(),
		typeParameters: func.getTypeParameters().map((tp) => tp.getText()),
	} as FunctionDoc;
}

/**
 * Extract documentation for a class property
 */
export function extractPropertyDoc(prop: PropertyDeclaration): PropertyDoc {
	return {
		name: prop.getName(),
		kind: DocItemKind.Property,
		description: prop.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(prop),
		jsDoc: extractJSDocInfo(prop.getJsDocs()),
		type: prop.getType().getText(),
		isStatic: prop.isStatic(),
		isReadonly: prop.isReadonly(),
		isOptional: prop.hasQuestionToken(),
	} as PropertyDoc;
}

/**
 * Extract documentation for a class method
 */
export function extractMethodDoc(method: MethodDeclaration): MethodDoc {
	// Get JSDoc comments
	const methodJsDocs = method.getJsDocs();
	const methodJsDocInfo = extractJSDocInfo(methodJsDocs);

	// Extract parameters with JSDoc descriptions
	const parameters = extractParametersWithJSDoc(
		method.getParameters(),
		methodJsDocs,
		methodJsDocInfo,
	);

	return {
		name: method.getName(),
		kind: DocItemKind.Method,
		description: method.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(method),
		jsDoc: methodJsDocInfo,
		parameters,
		returnType: method.getReturnType().getText(),
		isStatic: method.isStatic(),
		isAsync: method.isAsync(),
		typeParameters: method.getTypeParameters().map((tp) => tp.getText()),
	} as MethodDoc;
}

/**
 * Extract documentation for a class constructor
 */
export function extractConstructorDoc(
	ctor: ConstructorDeclaration,
	className: string,
): MethodDoc {
	// Get JSDoc comments for constructor
	const ctorJsDocs = ctor.getJsDocs();
	const ctorJsDocInfo = extractJSDocInfo(ctorJsDocs);

	// Extract parameters with JSDoc descriptions
	const parameters = extractParametersWithJSDoc(
		ctor.getParameters(),
		ctorJsDocs,
		ctorJsDocInfo,
	);

	return {
		name: "constructor",
		kind: DocItemKind.Method,
		description: ctor.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(ctor),
		jsDoc: ctorJsDocInfo,
		parameters,
		returnType: className,
		isStatic: false,
		isAsync: false,
	} as MethodDoc;
}

/**
 * Extract documentation for a class declaration
 */
export function extractClassDoc(cls: ClassDeclaration): ClassDoc {
	const properties = cls.getProperties().map(extractPropertyDoc);
	const methods = cls.getMethods().map(extractMethodDoc);
	const className = cls.getName();
	const constructors = cls
		.getConstructors()
		.map((ctor) => extractConstructorDoc(ctor, className || "Unknown"));

	return {
		name: cls.getName(),
		kind: DocItemKind.Class,
		description: cls.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(cls),
		jsDoc: extractJSDocInfo(cls.getJsDocs()),
		properties,
		methods,
		constructors,
		extends: cls.getExtends()?.getText(),
		implements: cls.getImplements().map((impl) => impl.getText()),
		typeParameters: cls.getTypeParameters().map((tp) => tp.getText()),
	} as ClassDoc;
}

/**
 * Extract documentation for an enum declaration
 */
export function extractEnumDoc(enumDecl: EnumDeclaration): EnumDoc {
	const members = enumDecl.getMembers().map((member) => {
		return {
			name: member.getName(),
			value: member.getValue()?.toString(),
			description: member.getJsDocs()?.[0]?.getDescription()?.trim(),
		};
	});

	return {
		name: enumDecl.getName(),
		kind: DocItemKind.Enum,
		description: enumDecl.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(enumDecl),
		jsDoc: extractJSDocInfo(enumDecl.getJsDocs()),
		members,
	} as EnumDoc;
}

/**
 * Extract documentation for a type alias declaration
 */
export function extractTypeAliasDoc(
	typeAlias: TypeAliasDeclaration,
): TypeAliasDoc {
	return {
		name: typeAlias.getName(),
		kind: DocItemKind.TypeAlias,
		description: typeAlias.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(typeAlias),
		jsDoc: extractJSDocInfo(typeAlias.getJsDocs()),
		type: typeAlias.getType().getText(),
		typeParameters: typeAlias.getTypeParameters().map((tp) => tp.getText()),
	} as TypeAliasDoc;
}

/**
 * Extract interface properties
 */
export function extractInterfaceProperties(
	iface: InterfaceDeclaration,
): PropertyDoc[] {
	return iface.getProperties().map((prop) => {
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
export function extractInterfaceMethods(
	iface: InterfaceDeclaration,
): MethodDoc[] {
	return iface.getMethods().map((method) => {
		// Get JSDoc comments for the method
		const methodJsDocs = method.getJsDocs();
		const methodJsDocInfo = extractJSDocInfo(methodJsDocs);

		// Extract parameters with JSDoc descriptions
		const parameters = extractParametersWithJSDoc(
			method.getParameters(),
			methodJsDocs,
			methodJsDocInfo,
		);

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
			typeParameters: method.getTypeParameters().map((tp) => tp.getText()),
		} as MethodDoc;
	});
}

/**
 * Extract documentation for an interface declaration
 */
export function extractInterfaceDoc(iface: InterfaceDeclaration): InterfaceDoc {
	const properties = extractInterfaceProperties(iface);
	const methods = extractInterfaceMethods(iface);

	return {
		name: iface.getName(),
		kind: DocItemKind.Interface,
		description: iface.getJsDocs()?.[0]?.getDescription()?.trim(),
		location: createLocationInfo(iface),
		jsDoc: extractJSDocInfo(iface.getJsDocs()),
		properties,
		methods,
		extends: iface.getExtends().map((ext) => ext.getText()),
		typeParameters: iface.getTypeParameters().map((tp) => tp.getText()),
	} as InterfaceDoc;
}
