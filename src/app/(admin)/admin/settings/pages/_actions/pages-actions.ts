"use server";

import { convertJsonToHtml } from "@/lib/helpers";
import db from "@/lib/prisma";
import { pageFormSchema, PageFormValues } from "@/lib/validation";
import { currentUser } from "@clerk/nextjs/server";
import { Page, Image } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getPages() {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const pages = await db.page.findMany({
		orderBy: { id: "asc" },
	});

	if (pages.length === 0) {
		throw new Error("No pages found. Ensure the database has been seeded.");
	}

	return pages;
}

export type PageToEdit = Page & { image: Image | null };

// GET Page by ID
export async function getPage(pageId: string): Promise<PageToEdit | null> {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const page = await db.page.findUnique({
		where: { id: pageId },
		include: {
			image: true,
		},
	});

	if (!page) {
		throw new Error(`Page with ID ${pageId} not found. Ensure the database has been seeded.`);
	}

	return {
		...page,
		image: page.image ?? null,
	};
}

// Upsert Page
export async function upsertPage(input: PageFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validated = pageFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	const existingPage = await db.page.findUnique({
		where: { id: input.id },
	});

	if (!existingPage) {
		throw new Error(`Page with ID ${input.id} does not exist. Creation of new pages is not allowed.`);
	}

	const updatedPage = await db.page.update({
		where: { id: input.id },
		data: {
			title: input.title,
			slug: input.slug,
			jsonContent: input.jsonContent,
			htmlContent: convertJsonToHtml(input.jsonContent),
			imageId: input.imageId,
			isVisible: input.isVisible,
		},
	});


    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");
    revalidatePath("/pages/[pageSlug]", "page");

	return updatedPage;
}

// Toggle Page Visibility
export async function togglePageVisibility(pageId: string, isVisible: boolean) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validPageId = z.string().min(1, "PageId must be a string").parse(pageId);

	const existingPage = await db.page.findUnique({
		where: { id: validPageId },
	});

	if (!existingPage) {
		throw new Error(`Page with ID ${validPageId} does not exist.`);
	}

	const updatedPage = await db.page.update({
		where: { id: validPageId },
		data: {
			isVisible,
		},
	});

    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");

	return updatedPage;
}
