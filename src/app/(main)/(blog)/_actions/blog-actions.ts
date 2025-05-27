"use server";

import { serializePostData } from "@/lib/helpers";
import db from "@/lib/prisma";
import { Category, Prisma, Tag } from "@prisma/client";
import { headers } from "next/headers";

// // -----------------------------------------------------------------------------------------------------------------
// // Categories
// // -----------------------------------------------------------------------------------------------------------------

// Get Categories for Sidebar
export type CategoryForSidebar = Category & {
	postCount: number;
};

export async function getCategoriesForSidebar() {
	const categories = await db.category.findMany({
		where: {
			posts: {
				some: {
					postStatus: "PUBLISHED",
				},
			},
		},
		orderBy: { id: "asc" },
		include: {
			posts: {
				select: {
					id: true,
				},
			},
		},
	});

	const categoriesForSideBar = categories.map((category) => ({
		...category,
		postCount: category.posts.length,
	}));

	return categoriesForSideBar;
}

export async function getCategoryBySlugForBlog(categorySlug?: string) {
	const category = await db.category.findUnique({
		where: {
			slug: categorySlug,
		},
	});

	return category;
}

// // -----------------------------------------------------------------------------------------------------------------
// // Tags
// // -----------------------------------------------------------------------------------------------------------------

// Get Tags for Sidebar
export type TagForSidebar = Tag & {
	postCount: number;
};

export async function getTagsForSidebar() {
	const tags = await db.tag.findMany({
		orderBy: { id: "asc" },
		include: {
			postTags: {
				select: {
					postId: true,
				},
				where: {
					post: {
						postStatus: "PUBLISHED",
					},
				},
			},
		},
	});

	const tagsForSideBar = tags
		.filter((tag) => tag.postTags.length > 0) // Show only tags with at least one post
		.map((tag) => ({
			...tag,
			postCount: tag.postTags.length,
		}));

	return tagsForSideBar;
}

export async function getTagBySlugForBlog(tagSlug?: string) {
	const category = await db.tag.findUnique({
		where: {
			slug: tagSlug,
		},
	});

	return category;
}

// -----------------------------------------------------------------------------------------------------------------
// Posts
// -----------------------------------------------------------------------------------------------------------------

export async function getBaseUrl() {
	const headersList = await headers();
	const protocol = headersList.get("x-forwarded-proto") || "http";
	const host = headersList.get("host")!;
	const baseUrl = `${protocol}://${host}`;
	return baseUrl;
}

// Get Post for Blog
export async function getPostForBlog(postSlug: string) {
	const blogPost = await db.post.findUnique({
		where: { slug: postSlug },
		select: {
			id: true,
			title: true,
			subTitle: true,
			slug: true,
			excerpt: true,
			author: true,
			publishedAt: true,
			htmlContent: true,
			category: { select: { id: true, name: true, slug: true, isFeatured: true } },
			PostTag: { select: { tag: { select: { id: true, name: true, slug: true } } } },
			image: { select: { imageUrl: true } },
		},
	});

	if (!blogPost) {
		throw new Error("Blogpost not found");
	}

	const serializedBlogPost = serializePostData(blogPost);

	return serializedBlogPost;
}

// Get Posts for Blog
export async function getPostsForBlog(page: number, categorySlug?: string, tagSlug?: string) {
	if (page < 1) {
		throw new Error("Page number must be at least 1");
	}

	const blogSettings = await db.blogSettings.findUnique({
		where: { id: "blog-settings" },
	});

	if (!blogSettings) {
		throw new Error("BlogSettings not found. Ensure the database has been seeded.");
	}

	const postWhere: any = { postStatus: "PUBLISHED" };

	if (categorySlug) {
		postWhere.category = { slug: categorySlug };
	}

	if (tagSlug) {
		postWhere.PostTag = { some: { tag: { slug: tagSlug } } };
	}

	const [blogPosts, totalPosts] = await Promise.all([
		db.post.findMany({
			where: postWhere,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * blogSettings.postsPerPage,
			take: blogSettings.postsPerPage,
			select: {
				id: true,
				title: true,
				subTitle: true,
				slug: true,
				excerpt: true,
				author: true,
				publishedAt: true,
				htmlContent: true,
				category: { select: { id: true, name: true, slug: true, isFeatured: true } },
				PostTag: { select: { tag: { select: { id: true, name: true, slug: true } } } },
				image: { select: { imageUrl: true } },
			},
		}),
		db.post.count({ where: postWhere }),
	]);

	const totalPages = Math.ceil(totalPosts / blogSettings.postsPerPage) || 1;
	const visiblePages = blogSettings.visiblePages;

	const serializedBlogPosts = blogPosts.map(serializePostData);

	return {
		posts: serializedBlogPosts,
		totalPages,
		visiblePages,
	};
}

// Search Posts for Blog
export async function searchPostsForBlog(page: number, searchTerm: string, categorySlug?: string, tagSlug?: string) {
	if (page < 1) {
		throw new Error("Page number must be at least 1");
	}
	if (!searchTerm) {
		throw new Error("Search term cannot be empty");
	}

	const lowerSearchTerm = searchTerm.toLowerCase();

	const blogSettings = await db.blogSettings.findUnique({
		where: { id: "blog-settings" },
	});

	if (!blogSettings) {
		throw new Error("BlogSettings not found. Ensure the database has been seeded.");
	}

	const postsPerPage = blogSettings.postsPerPage;
	const visiblePages = blogSettings.visiblePages;

	// Query for published posts with full-text search and optional filters
	const where: Prisma.PostWhereInput = {
		postStatus: "PUBLISHED",
		OR: [
			{ title: { contains: lowerSearchTerm, mode: "insensitive" } },
			{ excerpt: { contains: lowerSearchTerm, mode: "insensitive" } },
			{ htmlContent: { contains: lowerSearchTerm, mode: "insensitive" } },
		],
	};

	if (categorySlug) {
		where.category = { slug: categorySlug };
	}

	if (tagSlug) {
		where.PostTag = { some: { tag: { slug: tagSlug } } };
	}

	// Retrieve posts with pagination and full-text search
	const [posts, totalFiltered] = await Promise.all([
		db.post.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * postsPerPage,
			take: postsPerPage,
			select: {
				id: true,
				title: true,
				subTitle: true,
				slug: true,
				excerpt: true,
				author: true,
				publishedAt: true,
				htmlContent: true,
				category: { select: { id: true, name: true, slug: true, isFeatured: true } },
				PostTag: { select: { tag: { select: { id: true, name: true, slug: true } } } },
				image: { select: { imageUrl: true } },
			},
		}),
		db.post.count({ where }),
	]);

	// Count total pages
	const totalPages = Math.ceil(totalFiltered / postsPerPage) || 1;

	const serializedBlogPosts = posts.map(serializePostData);

	return {
		posts: serializedBlogPosts,
		totalPages,
		visiblePages,
	};
}
