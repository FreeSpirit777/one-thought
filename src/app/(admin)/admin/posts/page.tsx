import PostList from "./_components/post-list";
import { getPosts } from "./_actions/posts-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Page() {
	const posts = await getPosts();

	return (
		<div>
			<div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Posts</h1>
				<Button asChild>
					<Link href="/admin/posts/create">
						<Plus className="h-4 w-4" />
						Create Post
					</Link>
				</Button>
			</div>
			<PostList posts={posts} />
		</div>
	);
}
