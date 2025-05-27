"use server";

import { generateSlug } from "@/lib/helpers";
import db from "@/lib/prisma";
import { imageUpdateFormSchema, imageUploadFormSchema } from "@/lib/validation";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { put, del } from "@vercel/blob";
import { z } from "zod";

// UPLOAD Image
export async function uploadImage(image: File) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validated = imageUploadFormSchema.safeParse({ image });
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	const folder = process.env.BLOB_IMAGE_FOLDER || "blog";

	// Unique file name
	const fileName = `${generateSlug(image.name)}-${Date.now()}`;
	const filePath = `${folder}/images/${fileName}`;

	// Upload to blob storage
	const blob = await put(filePath, image, {
		access: "public",
		token: process.env.BLOB_READ_WRITE_TOKEN,
	});

	// Save image in the database
	const uploadedImage = await db.image.create({
		data: {
			title: image.name.replace(/\.[\w]+$/, ""),
			imageUrl: blob.url,
		},
	});

	return uploadedImage;
}

// GET Images
export async function getImages() {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const images = await db.image.findMany({
		orderBy: { id: "asc" },
	});

	return images;
}

export async function getImagesForModal(page: number, searchQuery: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const perPage = 6; // Number of images per batch
	const skip = (page - 1) * perPage;

	const where = searchQuery
		? {
				OR: [
					{
						title: {
							contains: searchQuery,
							mode: Prisma.QueryMode.insensitive,
						},
					},
					{
						description: {
							contains: searchQuery,
							mode: Prisma.QueryMode.insensitive,
						},
					},
					{
						alt: {
							contains: searchQuery,
							mode: Prisma.QueryMode.insensitive,
						},
					},
				],
		  }
		: {};

	const images = await db.image.findMany({
		where,
		skip,
		take: perPage,
	});
	return images;
}

// GET Image by ID
export async function getImage(imageId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const image = await db.image.findUnique({
		where: { id: imageId },
	});

	return image;
}

// UPDATE Image
export async function updateImage(input: { id: string; title: string; alt?: string; description?: string }) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------


	// ----------------------------------------------------------------------------------

	const validated = imageUpdateFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	if (!input.id) {
		throw new Error("Image ID is required");
	}

	const updatedImage = await db.image.update({
		where: { id: input.id },
		data: {
			title: input.title,
			alt: input.alt,
			description: input.description,
		},
	});

	return updatedImage;
}

// DELETE Image
export async function deleteImage(imageId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validImageId = z.string().min(1, "ImageId must be a string").parse(imageId);

	const image = await db.image.findUnique({
		where: { id: validImageId },
	});

	if (!image) {
		throw new Error("Image not found");
	}

	const imageInPost = await db.post.findFirst({
		where: { imageId: imageId },
	});

	if (imageInPost) {
		throw new Error("Image is used in a post and cannot be deleted");
	}

	const imageInPage = await db.page.findFirst({
		where: { imageId: imageId },
	});

	if (imageInPage) {
		throw new Error("Image is used in a page and cannot be deleted");
	}

	const imageAsLogo = await db.siteSettings.findFirst({
		where: { imageId: imageId },
	});

	if (imageAsLogo) {
		throw new Error("Image is used as logo and cannot be deleted");
	}

	// Delete image from blob store
	await del(image.imageUrl, {
		token: process.env.BLOB_READ_WRITE_TOKEN,
	});

	// Delete image from database
	const deletedImage = await db.image.delete({
		where: { id: imageId },
	});

	return deletedImage;
}
