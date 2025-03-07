import type { JSDoc, ParameterDeclaration } from "ts-morph";
import type { JSDocInfo, ParameterDoc } from "../models";
import { DocItemKind } from "../models";

// Pre-compile the parameter regex pattern for better performance
const PARAM_REGEX_BASE = "(?:@param\\s+)?($1)\\b\\s*(.+)?";

/**
 * Extract parameter documentation
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
 */
export function extractParameterDescription(
	param: ParameterDeclaration,
	jsDocs: JSDoc[] | undefined,
): string {
	if (!jsDocs || jsDocs.length === 0) {
		return "";
	}

	const paramName = param.getName();

	// Create the regex pattern for this specific parameter name
	const paramRegex = new RegExp(PARAM_REGEX_BASE.replace("$1", paramName), "i");

	// Look through each JSDoc block
	for (const jsDoc of jsDocs) {
		// Get the tags
		const tags = jsDoc.getTags();

		// Look for a @param tag that matches this parameter
		for (const tag of tags) {
			if (tag.getTagName() === "param") {
				const tagText = tag.getText();

				// Extract the parameter name from the tag text
				const match = tagText.match(paramRegex);

				if (match && match[1] === paramName) {
					try {
						// Try to get the comment using the tag's getComment() method
						const comment = tag.getComment?.();
						if (comment) {
							if (typeof comment === "string") {
								return comment.trim();
							}

							if (Array.isArray(comment)) {
								return comment
									.map((c) => c?.getText?.() || "")
									.join(" ")
									.trim();
							}
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
 * Extracts parameters with JSDoc descriptions from a declaration
 */
export function extractParametersWithJSDoc(
	parameters: ParameterDeclaration[],
	jsDocs: JSDoc[] | undefined,
	jsDocInfo: JSDocInfo | undefined,
): ParameterDoc[] {
	return parameters.map((param) => {
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
				(tag) => tag.tag === "param" && tag.name === param.getName(),
			);
			if (paramTag?.description) {
				paramDoc.description = paramTag.description;
			}
		}

		return paramDoc;
	});
}
