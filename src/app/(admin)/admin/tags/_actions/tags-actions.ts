"use server";

import db from "@/lib/prisma";
import { tagFormSchema, TagFormValues } from "@/lib/validation";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// GET Tags
export async function getTags() {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const tags = await db.tag.findMany({
		orderBy: { id: "asc" },
	});

	return tags;
}

// GET Tag by ID
export async function getTag(tagId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const tag = await db.tag.findUnique({
		where: { id: tagId },
	});

	return tag;
}

// CREATE Tag
export async function createTag(input: TagFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validated = tagFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}
	const createdTag = await db.tag.create({
		data: {
			name: input.name,
			slug: input.slug.toLowerCase(),
		},
	});

    revalidatePath("/admin/tags");
    revalidatePath("/", "layout");

	return createdTag;
}

// UPDATE Tag
export async function updateTag(input: TagFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	if (!input.id) throw new Error("TagId required");
	const validated = tagFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	const updatedTag = await db.tag.update({
		where: { id: input.id },
		data: {
			name: input.name,
			slug: input.slug.toLowerCase(),
		},
	});

    revalidatePath("/admin/tags");
    revalidatePath("/", "layout");

	return updatedTag;
}

// DELETE Tag
export async function deleteTag(tagId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

    const validtagId = z.string().min(1, "TagId must be a string").parse(tagId);

	const deletedTag = await db.tag.delete({
		where: { id: validtagId },
	});

    revalidatePath("/admin/tags");
    revalidatePath("/", "layout");

	return deletedTag;
}
