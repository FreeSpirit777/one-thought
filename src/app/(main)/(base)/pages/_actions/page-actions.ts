"use server";

import db from "@/lib/prisma";

// Get Page for Base
export async function getPageForBase(pageSlug: string) {
	const page = await db.page.findUnique({
		where: { slug: pageSlug },
        select: {
			id: true,
			title: true,
			slug: true,
			htmlContent: true,
			image: { select: { imageUrl: true } },
		},
	});

	return page;
}
