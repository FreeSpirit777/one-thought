
import { getCategories } from "../../categories/_actions/categories-actions";
import { getTags } from "../../tags/_actions/tags-actions";
import PostCreateUpdate from "../_components/post-create-update";

export default async function Page() {

    const [categories, tags] = await Promise.all([getCategories(), getTags()]);

	return (
		<div>
			<PostCreateUpdate categories={categories} tags={tags} />
		</div>
	);
}
