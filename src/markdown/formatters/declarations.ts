import type {
	ClassDoc,
	EnumDoc,
	FunctionDoc,
	InterfaceDoc,
	MethodDoc,
	TypeAliasDoc,
} from "../../parser/traversal";

/**
 * Format a function signature
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
 * Format a class declaration as typescript code
 */
export function formatClassDeclaration(cls: ClassDoc): string {
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
 * Format an interface declaration as typescript code
 */
export function formatInterfaceDeclaration(iface: InterfaceDoc): string {
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
 * Format an enum declaration as typescript code
 */
export function formatEnumDeclaration(enumDoc: EnumDoc): string {
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
 * Format a type alias declaration as typescript code
 */
export function formatTypeAliasDeclaration(typeAlias: TypeAliasDoc): string {
	let declaration = `type ${typeAlias.name}`;

	if (typeAlias.typeParameters && typeAlias.typeParameters.length > 0) {
		declaration += `<${typeAlias.typeParameters.join(", ")}>`;
	}

	declaration += ` = ${typeAlias.type};\n`;

	return declaration;
}
