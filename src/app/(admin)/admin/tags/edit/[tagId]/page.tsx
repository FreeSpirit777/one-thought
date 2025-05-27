import TagCreateUpdate from "../../_components/tag-create-update";
import { getTag } from "../../_actions/tags-actions";

export default async function Page ({params}: {params: Promise<{ tagId: string }>}) {

    const { tagId } = await params;

    const tag =  await getTag(tagId);

    if (!tag) return;

    return (
        <div>
            <TagCreateUpdate tag={tag} />
        </div>
    )
}