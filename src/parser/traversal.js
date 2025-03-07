"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocItemKind = void 0;
exports.extractDocumentation = extractDocumentation;
const comment_parser_1 = require("comment-parser");
/**
 * Types of documentation items
 */
var DocItemKind;
(function (DocItemKind) {
    DocItemKind["Function"] = "function";
    DocItemKind["Class"] = "class";
    DocItemKind["Interface"] = "interface";
    DocItemKind["Enum"] = "enum";
    DocItemKind["TypeAlias"] = "typeAlias";
    DocItemKind["Property"] = "property";
    DocItemKind["Method"] = "method";
    DocItemKind["Parameter"] = "parameter";
})(DocItemKind || (exports.DocItemKind = DocItemKind = {}));
/**
 * Extract documentation from a source file
 */
function extractDocumentation(sourceFile) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const items = [];
    // Extract functions
    for (const func of sourceFile.getFunctions()) {
        const parameters = func.getParameters().map(param => extractParameterDoc(param));
        items.push({
            name: func.getName() || "anonymous",
            kind: DocItemKind.Function,
            description: (_c = (_b = (_a = func.getJsDocs()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getDescription()) === null || _c === void 0 ? void 0 : _c.trim(),
            location: {
                filePath: sourceFile.getFilePath(),
                line: func.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(func.getJsDocs()),
            parameters,
            returnType: func.getReturnType().getText(),
            typeParameters: func.getTypeParameters().map(tp => tp.getText()),
        });
    }
    // Extract classes
    for (const cls of sourceFile.getClasses()) {
        const properties = cls.getProperties().map(prop => {
            var _a, _b, _c;
            return {
                name: prop.getName(),
                kind: DocItemKind.Property,
                description: (_c = (_b = (_a = prop.getJsDocs()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getDescription()) === null || _c === void 0 ? void 0 : _c.trim(),
                location: {
                    filePath: sourceFile.getFilePath(),
                    line: prop.getStartLineNumber(),
                },
                jsDoc: extractJSDocInfo(prop.getJsDocs()),
                type: prop.getType().getText(),
                isStatic: prop.isStatic(),
                isReadonly: prop.isReadonly(),
                isOptional: prop.hasQuestionToken(),
            };
        });
        const methods = cls.getMethods().map(method => {
            var _a, _b, _c;
            const parameters = method.getParameters().map(param => extractParameterDoc(param));
            return {
                name: method.getName(),
                kind: DocItemKind.Method,
                description: (_c = (_b = (_a = method.getJsDocs()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getDescription()) === null || _c === void 0 ? void 0 : _c.trim(),
                location: {
                    filePath: sourceFile.getFilePath(),
                    line: method.getStartLineNumber(),
                },
                jsDoc: extractJSDocInfo(method.getJsDocs()),
                parameters,
                returnType: method.getReturnType().getText(),
                isStatic: method.isStatic(),
                isAsync: method.isAsync(),
                typeParameters: method.getTypeParameters().map(tp => tp.getText()),
            };
        });
        const constructors = cls.getConstructors().map(ctor => {
            var _a, _b, _c;
            const parameters = ctor.getParameters().map(param => extractParameterDoc(param));
            return {
                name: "constructor",
                kind: DocItemKind.Method,
                description: (_c = (_b = (_a = ctor.getJsDocs()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getDescription()) === null || _c === void 0 ? void 0 : _c.trim(),
                location: {
                    filePath: sourceFile.getFilePath(),
                    line: ctor.getStartLineNumber(),
                },
                jsDoc: extractJSDocInfo(ctor.getJsDocs()),
                parameters,
                returnType: cls.getName(),
                isStatic: false,
                isAsync: false,
            };
        });
        items.push({
            name: cls.getName(),
            kind: DocItemKind.Class,
            description: (_f = (_e = (_d = cls.getJsDocs()) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.getDescription()) === null || _f === void 0 ? void 0 : _f.trim(),
            location: {
                filePath: sourceFile.getFilePath(),
                line: cls.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(cls.getJsDocs()),
            properties,
            methods,
            constructors,
            extends: (_g = cls.getExtends()) === null || _g === void 0 ? void 0 : _g.getText(),
            implements: cls.getImplements().map(impl => impl.getText()),
            typeParameters: cls.getTypeParameters().map(tp => tp.getText()),
        });
    }
    // Extract interfaces
    for (const iface of sourceFile.getInterfaces()) {
        const properties = extractInterfaceProperties(iface);
        const methods = extractInterfaceMethods(iface);
        items.push({
            name: iface.getName(),
            kind: DocItemKind.Interface,
            description: (_k = (_j = (_h = iface.getJsDocs()) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.getDescription()) === null || _k === void 0 ? void 0 : _k.trim(),
            location: {
                filePath: sourceFile.getFilePath(),
                line: iface.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(iface.getJsDocs()),
            properties,
            methods,
            extends: iface.getExtends().map(ext => ext.getText()),
            typeParameters: iface.getTypeParameters().map(tp => tp.getText()),
        });
    }
    // Extract enums
    for (const enumDecl of sourceFile.getEnums()) {
        const members = enumDecl.getMembers().map(member => {
            var _a, _b, _c, _d;
            return {
                name: member.getName(),
                value: (_a = member.getValue()) === null || _a === void 0 ? void 0 : _a.toString(),
                description: (_d = (_c = (_b = member.getJsDocs()) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.getDescription()) === null || _d === void 0 ? void 0 : _d.trim(),
            };
        });
        items.push({
            name: enumDecl.getName(),
            kind: DocItemKind.Enum,
            description: (_o = (_m = (_l = enumDecl.getJsDocs()) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.getDescription()) === null || _o === void 0 ? void 0 : _o.trim(),
            location: {
                filePath: sourceFile.getFilePath(),
                line: enumDecl.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(enumDecl.getJsDocs()),
            members,
        });
    }
    // Extract type aliases
    for (const typeAlias of sourceFile.getTypeAliases()) {
        items.push({
            name: typeAlias.getName(),
            kind: DocItemKind.TypeAlias,
            description: (_r = (_q = (_p = typeAlias.getJsDocs()) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.getDescription()) === null || _r === void 0 ? void 0 : _r.trim(),
            location: {
                filePath: sourceFile.getFilePath(),
                line: typeAlias.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(typeAlias.getJsDocs()),
            type: typeAlias.getType().getText(),
            typeParameters: typeAlias.getTypeParameters().map(tp => tp.getText()),
        });
    }
    return items;
}
/**
 * Extract interface properties
 */
function extractInterfaceProperties(iface) {
    return iface.getProperties().map(prop => {
        var _a, _b, _c;
        return {
            name: prop.getName(),
            kind: DocItemKind.Property,
            description: (_c = (_b = (_a = prop.getJsDocs()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getDescription()) === null || _c === void 0 ? void 0 : _c.trim(),
            location: {
                filePath: prop.getSourceFile().getFilePath(),
                line: prop.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(prop.getJsDocs()),
            type: prop.getType().getText(),
            isStatic: false,
            isReadonly: prop.isReadonly(),
            isOptional: prop.hasQuestionToken(),
        };
    });
}
/**
 * Extract interface methods
 */
function extractInterfaceMethods(iface) {
    return iface.getMethods().map(method => {
        var _a, _b, _c;
        const parameters = method.getParameters().map(param => extractParameterDoc(param));
        return {
            name: method.getName(),
            kind: DocItemKind.Method,
            description: (_c = (_b = (_a = method.getJsDocs()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getDescription()) === null || _c === void 0 ? void 0 : _c.trim(),
            location: {
                filePath: method.getSourceFile().getFilePath(),
                line: method.getStartLineNumber(),
            },
            jsDoc: extractJSDocInfo(method.getJsDocs()),
            parameters,
            returnType: method.getReturnType().getText(),
            isStatic: false,
            isAsync: method.isAsync(),
            typeParameters: method.getTypeParameters().map(tp => tp.getText()),
        };
    });
}
/**
 * Extract parameter documentation
 */
function extractParameterDoc(param) {
    var _a;
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
        defaultValue: (_a = param.getInitializer()) === null || _a === void 0 ? void 0 : _a.getText(),
    };
}
/**
 * Parse JSDoc comments into structured information
 */
function extractJSDocInfo(jsDocs) {
    if (!jsDocs || jsDocs.length === 0) {
        return undefined;
    }
    // Get the first JSDoc comment
    const jsDoc = jsDocs[0];
    const commentText = jsDoc.getDescription();
    try {
        // Use comment-parser to parse the JSDoc
        const parsed = (0, comment_parser_1.parse)(`/**\n * ${commentText}\n * ${jsDoc.getTags().map(tag => `@${tag.getTagName()} ${tag.getText()}`).join("\n * ")}\n */`);
        if (parsed.length === 0) {
            return undefined;
        }
        const parsedComment = parsed[0];
        return {
            description: parsedComment.description,
            tags: parsedComment.tags.map(tag => ({
                tag: tag.tag,
                name: tag.name,
                description: tag.description,
            })),
        };
    }
    catch (error) {
        // Return a simpler version if parsing fails
        return {
            description: commentText,
            tags: jsDoc.getTags().map(tag => ({
                tag: tag.getTagName(),
                name: "",
                description: tag.getText(),
            })),
        };
    }
}
