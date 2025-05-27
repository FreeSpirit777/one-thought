import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getPageForBase } from "../_actions/page-actions";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PostPageProps {
	params: Promise<{ pageSlug: string }>;
}

export default async function Page({ params }: PostPageProps) {
	const { pageSlug } = await params;
	const page = await getPageForBase(pageSlug);

	if (!page) {
		return <div>Seite nicht gefunden.</div>;
	}

	return (
		<div>
			<h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>

			{page.image?.imageUrl && (
				<div className="w-full md:max-w-lg md:float-left md:mr-6 mb-6">
                <AspectRatio ratio={16 / 9}>
                <Image
                    src={page.image.imageUrl}
                    alt={page.title}
                    fill
                    className="object-cover w-full h-full rounded-lg"
                    
                />
                </AspectRatio>
            </div>
			)}

			<div className="editor-content w-full" dangerouslySetInnerHTML={{ __html: page.htmlContent }} />

			<div className="clear-both">
				<Separator className="my-6 bg-gray-200" />
				<Button
					variant="link"
					className="p-0 h-auto text-muted-foreground hover:text-foreground hover:no-underline"
					asChild
				>
					<Link href="/" prefetch={true}>
						Back to Home
					</Link>
				</Button>
			</div>
		</div>
	);
}
