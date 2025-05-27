import { Separator } from "@/components/ui/separator";
import Sidebar from "./_components/sidebar";
import {
	getCategoriesForSidebar,
	getTagsForSidebar,
} from "./_actions/blog-actions";

export default async function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [categoriesForSidebar, tagsForSidebar] = await Promise.all([
		getCategoriesForSidebar(),
		getTagsForSidebar(),
	]);

	return (
        <main className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <div className="md:w-3/4 flex flex-col">
                {children}
            </div>

            {/* Separator */}
            <div className="hidden md:flex items-stretch">
                <Separator orientation="vertical" className="h-full" />
            </div>

            {/* Sidebar */}
            <div className="md:w-1/4">
                <div className="sticky top-32">
                    <Sidebar
                        categoriesForSidebar={categoriesForSidebar}
                        tagsForSidebar={tagsForSidebar}
                    />
                </div>
            </div>
        </main>
	);
}