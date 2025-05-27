import { Button } from "@/components/ui/button";
import { getCategories } from "./_actions/categories-actions";
import CategoryList from "./_components/category-list";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Page() {
	const categories = await getCategories();

	return (
		<div>
			<div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Categories</h1>
				<Button asChild>
					<Link href="/admin/categories/create">
						<Plus className="h-4 w-4" />
						Create Category
					</Link>
				</Button>
			</div>
			<CategoryList categories={categories} />
		</div>
	);
}
