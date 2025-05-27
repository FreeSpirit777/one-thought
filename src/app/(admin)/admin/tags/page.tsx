import { Button } from "@/components/ui/button";
import { getTags } from "./_actions/tags-actions";
import TagList from "./_components/tag-list";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Page() {
	const tags = await getTags();

	return (
		<div>
			<div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Tags</h1>
				<Button asChild>
					<Link href="/admin/tags/create">
						<Plus className="h-4 w-4" />
						Create Tag
					</Link>
				</Button>
			</div>
			<TagList tags={tags} />
		</div>
	);
}
