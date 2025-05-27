import PostList from "../../_components/post-list";
import Paging from "../../_components/paging";
import { getPostsForBlog, getTagBySlugForBlog, searchPostsForBlog } from "../../_actions/blog-actions";
import { getSiteSettingsForApp } from "@/app/_actions/app-actions";

interface PageProps {
	params: Promise<{ tagSlug?: string }>;
	searchParams: Promise<{ page?: string; search?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
	const { tagSlug } = await params;
	const { search } = await searchParams;
	const siteSettings = await getSiteSettingsForApp();
	const tag = await getTagBySlugForBlog(tagSlug);

	return {
		title: search
			? `Search results for "${search}" in ${tag?.name} | ${siteSettings?.siteName}`
			: `Latest Posts in ${tag?.name} | ${siteSettings?.siteName}`,
		description: search
			? `Find posts related to ${search} in ${tag?.name}`
			: `Explore the latest blog posts in ${tag?.name}`,
	};
}

export default async function Page({ params, searchParams }: PageProps) {
	const resolvedSearchParams = await searchParams;
	const page = parseInt(resolvedSearchParams.page || "1") || 1;
	const search = resolvedSearchParams.search;

	const resolvedParams = await params;
	const tagSlug = resolvedParams.tagSlug;
	const tag = await getTagBySlugForBlog(tagSlug);

	const promise = search
		? searchPostsForBlog(page, search, undefined, tagSlug)
		: getPostsForBlog(page, undefined, tagSlug);
	const { posts, totalPages, visiblePages } = await promise;

	return (
		<>
			<h2 className="text-xl md:text-2xl font-semibold pb-6">{tag?.name}</h2>
			{!posts.length ? (
				<p className="text-muted-foreground">
					{search
						? `No search results found in tag ${tag?.name}.`
						: `No posts found in tag ${tag?.name}.`}
				</p>
			) : (
				<>
					<PostList posts={posts} />
					{totalPages && totalPages > 1 && (
						<Paging
							currentPage={page}
							totalPages={totalPages}
							visiblePages={visiblePages}
							pathName={`/tags/${tagSlug}`}
							searchParams={resolvedSearchParams}
						/>
					)}
				</>
			)}
		</>
	);
}
