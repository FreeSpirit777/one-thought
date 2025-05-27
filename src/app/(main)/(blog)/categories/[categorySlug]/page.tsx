import PostList from "../../_components/post-list";
import Paging from "../../_components/paging";
import { getCategoryBySlugForBlog, getPostsForBlog, searchPostsForBlog } from "../../_actions/blog-actions";
import { getSiteSettingsForApp } from "@/app/_actions/app-actions";

interface PageProps {
	params: Promise<{ categorySlug?: string }>;
	searchParams: Promise<{ page?: string; search?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
	const { categorySlug } = await params;
	const { search } = await searchParams;
	const siteSettings = await getSiteSettingsForApp();
	const category = await getCategoryBySlugForBlog(categorySlug);

	return {
		title: search
			? `Search results for "${search}" in ${category?.name} | ${siteSettings?.siteName}`
			: `Latest Posts in ${category?.name} | ${siteSettings?.siteName}`,
		description: search
			? `Find posts related to ${search} in ${category?.name}`
			: `Explore the latest blog posts in ${category?.name}`,
	};
}

export default async function Page({ params, searchParams }: PageProps) {
	const resolvedSearchParams = await searchParams;
	const page = parseInt(resolvedSearchParams.page || "1") || 1;
	const search = resolvedSearchParams.search;

	const resolvedParams = await params;
	const categorySlug = resolvedParams.categorySlug;
	const category = await getCategoryBySlugForBlog(categorySlug);

	const promise = search
		? searchPostsForBlog(page, search, categorySlug, undefined)
		: getPostsForBlog(page, categorySlug);
	const { posts, totalPages, visiblePages } = await promise;

	return (
		<>
			<h2 className="text-xl md:text-2xl font-semibold pb-6">{category?.name}</h2>
			{!posts.length ? (
				<p className="text-muted-foreground">
					{search
						? `No search results found in category ${category?.name}.`
						: `No posts found in category ${category?.name}.`}
				</p>
			) : (
				<>
					<PostList posts={posts} />
					{totalPages && totalPages > 1 && (
						<Paging
							currentPage={page}
							totalPages={totalPages}
							visiblePages={visiblePages}
							pathName={`/categories/${categorySlug}`}
							searchParams={resolvedSearchParams}
						/>
					)}
				</>
			)}
		</>
	);
}
