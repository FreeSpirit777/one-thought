import CategoryCreateUpdate from "../../_components/category-create-update";
import { getCategory } from "../../_actions/categories-actions";

export default async function Page ({params}: {params: Promise<{ categoryId: string }>}) {

    const { categoryId } = await params;

    const category =  await getCategory(categoryId);

    if (!category) return;

    return (
        <div>
            <CategoryCreateUpdate category={category} />
        </div>
    )
}