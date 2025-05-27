"use server";

import db from "@/lib/prisma";

// -----------------------------------------------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------------------------------------------

// Get Categories for Navigation
export async function getCategoriesForNavigation() {
	const categories = await db.category.findMany({
        where: {isFeatured: true},
		orderBy: { id: "asc" },
	});

	return categories;
}

// -----------------------------------------------------------------------------------------------------------------
// Pages
// -----------------------------------------------------------------------------------------------------------------

export async function getPagesForMain() {
	const pages = await db.page.findMany({
		where: { isVisible: true },
		orderBy: { id: "asc" },
	});

	return pages;
}
