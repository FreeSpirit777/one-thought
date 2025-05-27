import { Category, Tag } from "@prisma/client";

export type BlogPost = {
	id: string;
	title: string;
	subTitle: string | null;
	slug: string;
	excerpt: string | null;
	author: string | null;
	publishedAt: Date;
	htmlContent: string;
	category: {id: string, name: string, slug: string, isFeatured: boolean } | null;
	PostTag: { tag: { id: string, name: string, slug: string } }[] | null;
	image: { imageUrl: string } | null;
};

export type SerializedBlogPost = {
	id: string;
	title: string;
    subTitle: string;
	slug: string;
	excerpt: string;
    author: string;
    publishedAt: string;
	content: string;
	category: Category;
    tags: Tag[];
	imageUrl: string;
};
