import ImageList from "./_components/image-list";
import { getImages } from "./_actions/images-actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Page() {
	const images = await getImages();

	return (
		<div>
			<div className="flex justify-between">
				<h1 className="text-2xl font-bold mb-4">Images</h1>
				<Button asChild>
					<Link href="/admin/images/upload">
						<Plus className="h-4 w-4" />
						Upload Image
					</Link>
				</Button>
			</div>
			<ImageList images={images} />
		</div>
	);
}
