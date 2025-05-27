import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import SearchBar from "./search";
import { CategoryForSidebar, TagForSidebar } from "../_actions/blog-actions";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
	categoriesForSidebar: CategoryForSidebar[];
	tagsForSidebar: TagForSidebar[];
}

export default function Sidebar({ categoriesForSidebar, tagsForSidebar }: SidebarProps) {
	return (
		<div className="space-y-6">
			<SearchBar />

			{categoriesForSidebar.length > 0 && (
				<>
					<Separator className="my-3" />
					<div>
						<h3 className="text-xl font-semibold pb-2">Categories</h3>
						<ul className="space-y-2">
							{categoriesForSidebar.map((category) => (
								<li key={category.id}>
									<Link
										href={`/categories/${category.slug}`}
										className="text-muted-foreground text-sm lg:text-base hover:text-primary transition-colors duration-200"
										prefetch={true}
									>
										{`${category.name} (${category.postCount})`}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</>
			)}

			{categoriesForSidebar.length > 0 && (
				<>
					<Separator className="my-3" />
					<div>
						<h3 className="text-xl font-semibold pb-2">Tags</h3>

						{tagsForSidebar.map((tag) => (
							<Badge
								key={tag.id}
								variant="secondary"
								className="mr-2 mb-2 py-1 px-2 text-xs lg:text-sm hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors duration-200"
							>
								<Link href={`/tags/${tag.slug}`} prefetch={true}>
									{`${tag.name} (${tag.postCount})`}
								</Link>
							</Badge>
						))}
					</div>
				</>
			)}
		</div>
	);
}
