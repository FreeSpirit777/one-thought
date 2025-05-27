import { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import { BlogPost, SerializedBlogPost } from "./types";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import sanitizeHtml from "sanitize-html";
import { format } from "date-fns";
import * as crypto from "crypto";

// -----------------------------------------------------------------------------------------------------------------
// General Helpers
// -----------------------------------------------------------------------------------------------------------------

export const generateSlug = (name: string): string => {
	return (
		name
			// Replace special characters
			.replace(/[Ää]/g, "ae")
			.replace(/[Öö]/g, "oe")
			.replace(/[Üü]/g, "ue")
			// Default slug processing
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-") // Replaces all non-alphanumeric characters with hyphens
			.replace(/(^-|-$)/g, "")
	);
};

export const formatEnumLabel = (value: string): string => {
	return value
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

// -----------------------------------------------------------------------------------------------------------------
// Serialize Post Data
// -----------------------------------------------------------------------------------------------------------------

export const serializePostData = (post: BlogPost): SerializedBlogPost => {
	return {
		id: post.id,
		title: post.title,
		subTitle: post.subTitle || "",
		slug: post.slug,
		excerpt: post.excerpt || "",
		author: post.author || "",
		publishedAt: format(post.publishedAt, "PPP"),
		content: post.htmlContent,
		category: post.category || {
			id: "",
			name: "Uncategorized",
			slug: "",
			isFeatured: false,
		},
		tags:
			post.PostTag?.map((postTag) => ({
				id: postTag.tag.id,
				name: postTag.tag.name,
				slug: postTag.tag.slug,
			})) || [],
		imageUrl: post.image?.imageUrl || "",
	};
};

// -----------------------------------------------------------------------------------------------------------------
// Sanitize Content
// -----------------------------------------------------------------------------------------------------------------

export const convertJsonToHtml = (jsonContent: JSONContent) => {
	const htmlContent = generateHTML(jsonContent as JSONContent, [StarterKit, TextAlign, Highlight]);

	const sanitizedHtmlContent = sanitizeHtml(htmlContent, {
		allowedTags: [
			"h1",
			"h2",
			"h3",
			"h4",
			"p",
			"strong",
			"em",
			"ul",
			"ol",
			"li",
			"a",
			"br",
			"code",
			"pre",
			"blockquote",
			"span",
		],
		allowedAttributes: {
			a: ["href", "target", "rel"], // Only for <a> tags
			"*": ["class"], // class allowed for all tags
		},
		allowedSchemes: ["https"],
		allowedSchemesByTag: {
			a: ["https"], // Explicit for <a> tags
		},
		transformTags: {
			a: (tagName, attribs) => {
				// Add rel="noopener noreferrer" for target="_blank"
				if (attribs.target === "_blank") {
					attribs.rel = "noopener noreferrer";
				}
				// Remove href if it does not start with https://
				if (attribs.href && !attribs.href.startsWith("https://")) {
					delete attribs.href;
				}
				return { tagName, attribs };
			},
		},
		allowProtocolRelative: false,
	});

	return sanitizedHtmlContent;
};

// -----------------------------------------------------------------------------------------------------------------
// Crypto
// -----------------------------------------------------------------------------------------------------------------

// Encrypt password
export function encryptPassword(password: string) {
	const algorithm = "aes-256-cbc";
	const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
	const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex");

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(password, "utf8", "hex");
	encrypted += cipher.final("hex");

	return encrypted;
}

// Decrypt password
export function decryptPassword(encryptedPassword: string) {
	const algorithm = "aes-256-cbc";
	const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
	const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex");

	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
	decrypted += decipher.final("utf8");
	
    return decrypted;
}
