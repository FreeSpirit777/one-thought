"use server";

import db from "@/lib/prisma";
import { categoryFormSchema, CategoryFormValues } from "@/lib/validation";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// GET Categories
export async function getCategories() {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const categories = await db.category.findMany({
		orderBy: { id: "asc" },
	});

	return categories;
}

// GET Category by ID
export async function getCategory(categoryId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (!dbUser?.role || !["OWNER", "SCOUT"].includes(dbUser.role)) {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const category = await db.category.findUnique({
		where: { id: categoryId },
	});

	return category;
}

// CREATE Category
export async function createCategory(input: CategoryFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validated = categoryFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	if (input.isFeatured) {
		const featuredCount = await db.category.count({
			where: { isFeatured: true },
		});

		if (featuredCount > 5) {
			throw new Error("You cannot feature more than five categories.");
		}
	}

	const createdCategory = await db.category.create({
		data: {
			name: input.name,
			slug: input.slug.toLowerCase(),
			isFeatured: input.isFeatured,
		},
	});

    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");

	return createdCategory;
}

// UPDATE Category
export async function updateCategory(input: CategoryFormValues) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	if (!input.id) throw new Error("CategoryId required");
	const validated = categoryFormSchema.safeParse(input);
	if (!validated.success) {
		throw new Error(validated.error.issues.map((issue) => issue.message).join(", "));
	}

	if (input.isFeatured) {
		const featuredCount = await db.category.count({
			where: { isFeatured: true },
		});

		if (featuredCount > 5) {
			throw new Error("You cannot feature more than five categories.");
		}
	}

	const updatedCategory = await db.category.update({
		where: { id: input.id },
		data: {
			name: input.name,
			slug: input.slug.toLowerCase(),
			isFeatured: input.isFeatured,
		},
	});

    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");

	return updatedCategory;
}

// DELETE Category
export async function deleteCategory(categoryId: string) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

    const validCategoryId = z.string().min(1, "CategoryId must be a string").parse(categoryId);

	const deletedCategory = await db.category.delete({
		where: { id: validCategoryId },
	});

    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");

	return deletedCategory;
}



// Toggle IsFeatured
export async function toggleCategoryIsFeatured(categoryId: string, isFeatured: boolean) {
	const user = await currentUser();

	if (!user) throw new Error("User not authenticated");

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: user.id },
	});

	if (dbUser?.role !== "OWNER") {
		throw new Error("Unauthorized");
	}

	// ----------------------------------------------------------------------------------

	const validCategoryId = z.string().min(1, "CategoryId must be a string").parse(categoryId);

	const category = await db.category.findUnique({
		where: { id: validCategoryId },
	});

	if (!category) {
		throw new Error("Category does not exist");
	}

	if (isFeatured) {
		const featuredCount = await db.category.count({
			where: { isFeatured: true },
		});

		if (featuredCount > 5) {
			throw new Error("You cannot feature more than five categories");
		}
	}

	const categoryToFeature = await db.category.update({
		where: { id: validCategoryId },
		data: {
			isFeatured,
		},
	});

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/", "layout");

	return categoryToFeature;
}
