import type { JSDoc } from "ts-morph";
import type { JSDocInfo, JSDocTag } from "../models";

// Pre-compile the parameter name regex for performance
const PARAM_NAME_REGEX = /^(\w+)(?:\s+.*)?$/;

/**
 * Parse JSDoc comments into structured information
 */
export function extractJSDocInfo(
	jsDocs: JSDoc[] | undefined,
): JSDocInfo | undefined {
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

		// Extract comment in a safe way with fallbacks
		let comment = "";
		try {
			const result = tag.getComment?.();
			if (result) {
				comment =
					typeof result === "string"
						? result
						: result.map((r) => r?.getText?.() || "").join(" ");
			}
		} catch (e) {
			// Fallback for tests with mocked objects
			const tagText = tag.getText();
			if (tagName === "param") {
				// For param tags, strip the parameter name
				comment = tagText.replace(/^\w+\s*/, "").trim();
			} else {
				// For other tags, use the full text (might include the tag name)
				comment = tagText.trim();
			}
		}

		if (tagName === "param") {
			const tagText = tag.getText();
			const paramMatch = tagText.match(PARAM_NAME_REGEX);

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
			tags.push({
				tag: tagName,
				name: "", // We don't extract names for other tags currently
				description: comment.trim(),
			});
		}
	}

	return {
		description: commentText,
		tags,
	};
}
