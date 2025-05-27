"use server";

import { convertJsonToHtml } from "@/lib/helpers";
import db from "@/lib/prisma";
import { postFormSchema, PostFormValues } from "@/lib/validation";
import { currentUser } from "@clerk/nextjs/server";
import { Post, Image, Tag } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// GET Posts
export async function getPosts() {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const posts = await db.post.findMany({
		orderBy: { id: "asc" },
		include: {
			PostTag: {
				include: { tag: true },
			},
			image: true,
		},
	});

	return posts;
}

export type PostToEdit = Post & {
	image: Image | null;
	PostTag: { tag: Tag }[];
};

// GET Post by ID
export async function getPost(postId: string): Promise<PostToEdit | null> {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const post = await db.post.findUnique({
		where: { id: postId },
		include: {
			image: true,
			PostTag: {
				include: {
					tag: true,
				},
			},
		},
	});

	return post;
}

// CREATE Post
export async function createPost(input: PostFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validated = postFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	const createdPost = await db.post.create({
		data: {
			title: input.title,
			subTitle: input.subTitle,
			slug: input.slug.trim().toLowerCase(),
			excerpt: input.excerpt,
			author: input.author,
			publishedAt: input.publishedAt,
			jsonContent: input.jsonContent,
			htmlContent: convertJsonToHtml(input.jsonContent),
			categoryId: input.categoryId,
			imageId: input.imageId,
			postStatus: input.postStatus,
			PostTag: {
				create: input.tagIds.map((tagId) => ({
					tag: { connect: { id: tagId } },
				})),
			},
		},
		include: {
			PostTag: {
				include: { tag: true },
			},
			image: true,
		},
	});

    revalidatePath("/admin/posts");
    revalidatePath("/", "layout");

	return createdPost;
}

// UPDATE Post
export async function updatePost(input: PostFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	if (!input.id) throw new Error("PostId required");
	const validated = postFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}
	const updatedPost = await db.post.update({
		where: { id: input.id },
		data: {
			title: input.title,
			subTitle: input.subTitle,
			slug: input.slug.trim().toLowerCase(),
			excerpt: input.excerpt,
			author: input.author,
			jsonContent: input.jsonContent,
			htmlContent: convertJsonToHtml(input.jsonContent),
			categoryId: input.categoryId,
			imageId: input.imageId,
			postStatus: input.postStatus,
			PostTag: {
				deleteMany: {},
				create: input.tagIds.map((tagId) => ({
					tag: { connect: { id: tagId } },
				})),
			},
		},
		include: {
			PostTag: {
				include: { tag: true },
			},
			image: true,
		},
	});

    revalidatePath("/admin/posts");
    revalidatePath("/", "layout");
    revalidatePath("/[postSlug]", "page");


	return updatedPost;
}

// DELETE Post
export async function deletePost(postId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validPostId = z.string().min(1, "PostId must be a string").parse(postId);

	const deletedPost = await db.post.delete({
		where: { id: validPostId },
	});

    revalidatePath("/admin/posts");
    revalidatePath("/", "layout");

	return deletedPost;
}
