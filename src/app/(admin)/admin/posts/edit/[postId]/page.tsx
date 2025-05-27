import PostCreateUpdate from "../../_components/post-create-update";
import { getPost } from "../../_actions/posts-actions";
import { getCategories } from "../../../categories/_actions/categories-actions";
import { getTags } from "../../../tags/_actions/tags-actions";


export default async function Page({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;

	const [post, categories, tags] = await Promise.all([
        getPost(postId),
        getCategories(),
        getTags()
    ]);

	if (!post) return;

	return (
		<div>
			<PostCreateUpdate post={post} categories={categories} tags={tags} />
		</div>
	);
}
