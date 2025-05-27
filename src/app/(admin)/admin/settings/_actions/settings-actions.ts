"use server";
import { encryptPassword } from "@/lib/helpers";
import db from "@/lib/prisma";
import {
	updateBlogSettingsFormSchema,
	UpdateBlogSettingsFormValues,
	updateEmailSettingsFormSchema,
	UpdateEmailSettingsFormValues,
	updateSiteSettingsFormSchema,
	UpdateSiteSettingsFormValues,
} from "@/lib/validation";
import { currentUser } from "@clerk/nextjs/server";
import { SiteSettings, Image } from "@prisma/client";
import { revalidatePath } from "next/cache";
//import bcrypt from "bcryptjs";


// -------------------------------------------------------------------------------------------
// Site Settings
// -------------------------------------------------------------------------------------------

export type SiteSettingsToEdit = SiteSettings & { image: Image | null };

export async function getSiteSettings(): Promise<SiteSettingsToEdit> {
	
    const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------
    
    const siteSettings = await db.siteSettings.findUnique({
		where: { id: "site-settings" },
		include: {
			siteSettingImage: true,
		},
	});

	if (!siteSettings) {
		throw new Error(
			"SiteSettings not found. Ensure the database has been seeded."
		);
	}

	return {
		...siteSettings,
		image: siteSettings.siteSettingImage ?? null,
	};
}


export async function upsertSiteSettings(input: UpdateSiteSettingsFormValues) {
	
    const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------
    
    const validated = updateSiteSettingsFormSchema.safeParse(input);

	if (!validated.success) {
		throw new Error(
			validated.error.issues.map((issue) => issue.message).join(", ")
		);
	}

	const siteSettings = await db.siteSettings.update({
		where: { id: "site-settings" },
		data: {
			siteName: input.siteName,
			siteDescription: input.siteDescription,
			imageId: input.imageId,
			isCookieConsentEnabled: input.isCookieConsentEnabled,
			cookieConsentPageId: input.cookieConsentPageId,
			googleAnalyticsId: input.googleAnalyticsId,
		},
	});

	revalidatePath("/admin/settings/general");
    revalidatePath("/", "layout");

	return siteSettings;
}

// -------------------------------------------------------------------------------------------
// Blog Settings
// -------------------------------------------------------------------------------------------

export async function getBlogSettings() {
	
    const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

    
    const blogSettings = await db.blogSettings.findUnique({
		where: { id: "blog-settings" },
	});

	if (!blogSettings) {
		throw new Error(
			"BlogSettings not found. Ensure the database has been seeded."
		);
	}

	return blogSettings;
}

export async function upsertBlogSettings(input: UpdateBlogSettingsFormValues) {
	
    const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

    
    const validated = updateBlogSettingsFormSchema.safeParse(input);

	if (!validated.success) {
		throw new Error(
			validated.error.issues.map((issue) => issue.message).join(", ")
		);
	}

	const blogSettings = await db.blogSettings.update({
		where: { id: "blog-settings" },
		data: {
			visiblePages: input.visiblePages,
			postsPerPage: input.postsPerPage,
		},
	});

	revalidatePath("/admin/settings/general");
    revalidatePath("/", "layout");

	return blogSettings;
}

// -------------------------------------------------------------------------------------------
// Email Settings
// -------------------------------------------------------------------------------------------

export async function getEmailSettings() {
	
    const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

    
    const emailSettings = await db.emailSettings.findUnique({
		where: { id: "email-settings" },
	});

	return emailSettings;
}

export async function upsertEmailSettings(
	input: UpdateEmailSettingsFormValues
) {

    const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validated = updateEmailSettingsFormSchema.safeParse(input);

	if (!validated.success) {
		throw new Error(
			validated.error.issues.map((issue) => issue.message).join(", ")
		);
	}

	const existingSettings = await db.emailSettings.findFirst({
		where: { id: "email-settings" },
	});

	let encryptedPassword = existingSettings?.emailPass; // Keep existing password by default
	if (input.emailPass) {

        // If a new password was provided, encrypt it
	    encryptedPassword = encryptPassword(input.emailPass);
	
    } else if (!existingSettings) {
		// Upon creation (no existing settings), a password is required
		throw new Error("Passwort ist bei der Erstellung erforderlich");
	}

	const emailSettings = await db.emailSettings.upsert({
		where: { id: "email-settings" },
		update: {
			emailHostSmtp: input.emailHostSmtp,
			emailPortSmtp: input.emailPortSmtp,
			isEmailSecureSmtp: input.isEmailSecureSmtp,
			emailUser: input.emailUser,
			...(encryptedPassword && { emailPass: encryptedPassword }), // Only update if password is present
		},
		create: {
			id: "email-settings",
			emailHostSmtp: input.emailHostSmtp,
			emailPortSmtp: input.emailPortSmtp,
			isEmailSecureSmtp: input.isEmailSecureSmtp,
			emailUser: input.emailUser,
			emailPass: encryptedPassword!,
		},
	});

	revalidatePath("/admin/settings/email");

	return emailSettings;
}
