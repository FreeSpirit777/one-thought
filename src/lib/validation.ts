import { z } from "zod";

// -------------------------------------------------------------------------------------------------------------------------
// Posts
// -------------------------------------------------------------------------------------------------------------------------

export const postFormSchema = z.object({
	id: z.string().optional(),
	title: z
		.string()
		.min(1, { message: "Title is required" }) // Ersetzt .nonempty()
		.max(70, { message: "Title must not exceed 50 characters" }),
	subTitle: z.string().optional(),
	slug: z
		.string()
		.min(1, { message: "Slug is required" }) // Ersetzt .nonempty()
		.max(100, { message: "Slug must not exceed 100 characters" })
		.regex(/^[a-z0-9-]+$/i, {
			message: "Slug can only contain letters, numbers, and hyphens",
		}),
	excerpt: z
		.string()
		.max(5000, { message: "Excerpt must not exceed 5000 characters" })
		.optional(),
	author: z.string().optional(),
	publishedAt: z.date({
		required_error: "A date of birth is required.",
	}),
	jsonContent: z.any().refine(
		(val) => {
			return val !== null && typeof val === "object";
		},
		{ message: "Content is required" }
	),
	categoryId: z.string().nullable(),
	imageId: z.string().nullable(),
	tagIds: z.array(z.string()),
	postStatus: z.enum(["DRAFT", "PUBLISHED", "TRASH"]),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

// -------------------------------------------------------------------------------------------------------------------------
// Pages
// -------------------------------------------------------------------------------------------------------------------------

export const pageFormSchema = z.object({
	id: z.string().optional(),
	title: z
		.string()
		.min(1, { message: "Title is required" })
		.max(70, { message: "Title must not exceed 50 characters" }),
	slug: z
		.string()
		.min(1, { message: "Slug is required" })
		.max(100, { message: "Slug must not exceed 100 characters" })
		.regex(/^[a-z0-9-]+$/i, {
			message: "Slug can only contain letters, numbers, and hyphens",
		}),
	jsonContent: z.any().refine(
		(val) => {
			return val !== null && typeof val === "object";
		},
		{ message: "Content is required" }
	),
	imageId: z.string().nullable(),
	isVisible: z.boolean(),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;

// -------------------------------------------------------------------------------------------------------------------------
// Categories
// -------------------------------------------------------------------------------------------------------------------------

export const categoryFormSchema = z.object({
	id: z.string().optional(),
	name: z
		.string()
		.min(1, { message: "Name is required" })
		.max(100, { message: "Name must not exceed 100 characters" }),
	slug: z
		.string()
		.min(1, { message: "Slug is required" })
		.max(100, { message: "Slug must not exceed 100 characters" })
		.regex(/^[a-z0-9-]+$/i, {
			message: "Slug can only contain letters, numbers, and hyphens",
		}),
	isFeatured: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// -------------------------------------------------------------------------------------------------------------------------
// Tags
// -------------------------------------------------------------------------------------------------------------------------

export const tagFormSchema = z.object({
	id: z.string().optional(),
	name: z
		.string()
		.min(1, { message: "Name is required" })
		.max(100, { message: "Name must not exceed 100 characters" }),
	slug: z
		.string()
		.min(1, { message: "Slug is required" })
		.max(100, { message: "Slug must not exceed 100 characters" })
		.regex(/^[a-z0-9-]+$/i, {
			message: "Slug can only contain letters, numbers, and hyphens",
		}),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;

// -------------------------------------------------------------------------------------------------------------------------
// Images
// -------------------------------------------------------------------------------------------------------------------------

export const imageUploadFormSchema = z.object({
	image: z
		.instanceof(File, { message: "Must be a valid file" })
		.refine(
			(file) =>
				!file ||
				["image/jpeg", "image/png", "image/gif"].includes(file.type),
			"Only JPEG, PNG, or GIF files are allowed"
		)
		.refine(
			(file) => !file || file.size <= 1024 * 1024 * 4, // 4 MB
			"File must be less than 4MB"
		),
});

export type ImageUploadFormValues = z.infer<typeof imageUploadFormSchema>;

export const imageUpdateFormSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(100, "Title must be 100 characters or less"),
	alt: z
		.string()
		.max(200, "Alt text must be 200 characters or less")
		.optional(),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
});

export type ImageUpdateFormValues = z.infer<typeof imageUpdateFormSchema>;

// -------------------------------------------------------------------------------------------------------------------------
// Settings
// -------------------------------------------------------------------------------------------------------------------------

export const updateSiteSettingsFormSchema = z.object({
	siteName: z.string().min(1, "Site Name is required"),
	siteDescription: z.string().min(1, "Site Description is required"),
	imageId: z.string().nullable(),
	isCookieConsentEnabled: z.boolean(),
	cookieConsentPageId: z.string().optional(),
	googleAnalyticsId: z.string().optional(),
});

export type UpdateSiteSettingsFormValues = z.infer<
	typeof updateSiteSettingsFormSchema
>;

// -------------------------------------------------------------------------------------------------------------------------

export const updateBlogSettingsFormSchema = z.object({
	visiblePages: z.coerce
		.number({ invalid_type_error: "Value has to be a number" })
		.refine((val) => val !== 0, { message: "Zero is not allowed" }),
	postsPerPage: z.coerce
		.number({ invalid_type_error: "Value has to be a number" })
		.refine((val) => val !== 0, { message: "Zero is not allowed" }),
});

export type UpdateBlogSettingsFormValues = z.infer<
	typeof updateBlogSettingsFormSchema
>;

// -------------------------------------------------------------------------------------------------------------------------

export const updateEmailSettingsFormSchema = z.object({
	id: z.string().optional(),
	emailHostSmtp: z
		.string()
		.min(1, "Host is required")
		.max(50, "Host must be 50 characters or less"),
	emailPortSmtp: z
		.string()
		.min(1, "Port is required")
		.max(50, "Port must be 50 characters or less"),
	isEmailSecureSmtp: z.boolean(),
	emailUser: z
		.string()
		.min(1, "User is required")
		.max(50, "User must be 50 characters or less"),
	emailPass: z
		.string()
		.optional()
		.refine(
			(val) => !val || val.length >= 8,
			{ message: "Passwort muss mindestens 8 Zeichen lang sein" }
		),
});

export type UpdateEmailSettingsFormValues = z.infer<
	typeof updateEmailSettingsFormSchema
>;


// -------------------------------------------------------------------------------------------------------------------------

// Zod-Schema
export const contactFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    message: z
      .string()
      .min(10, "The message must contain at least 10 characters")
      .max(500, "The message must not exceed 500 characters"),
  });

export type ContactFormValues = z.infer<typeof contactFormSchema>;