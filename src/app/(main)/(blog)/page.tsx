import PostList from "./_components/post-list";
import Paging from "./_components/paging";
import { getPostsForBlog, searchPostsForBlog } from "./_actions/blog-actions";
import { getSiteSettingsForApp } from "@/app/_actions/app-actions";

interface HomeProps {
	searchParams: Promise<{ page?: string; search?: string }>;
}

export async function generateMetadata({ searchParams }: HomeProps) {
	const { search } = await searchParams;
	const siteSettings = await getSiteSettingsForApp();

	return {
		title: search
			? `Search results for "${search}" | ${siteSettings?.siteName}`
			: `Latest Posts | ${siteSettings?.siteName}`,
		description: search ? `Find posts related to ${search}` : "Explore the latest blog posts.",
	};
}

export default async function Home({ searchParams }: HomeProps) {
	const resolvedSearchParams = await searchParams;
	const page = parseInt(resolvedSearchParams.page || "1") || 1;
	const search = resolvedSearchParams.search;

	const promise = search ? searchPostsForBlog(page, search) : getPostsForBlog(page);
	const { posts, totalPages, visiblePages } = await promise;

	return (
		<>
			{!posts.length ? (
				<p className="text-muted-foreground">{search ? "No search results found." : "No posts found."}</p>
			) : (
				<>
					<PostList posts={posts} />
					{totalPages && totalPages > 1 && (
						<Paging
							currentPage={page}
							totalPages={totalPages}
							visiblePages={visiblePages}
							pathName={"/"}
							searchParams={resolvedSearchParams}
						/>
					)}
				</>
			)}
		</>
	);
}
