import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NextImage from "next/image";
import Link from "next/link";
import { SerializedBlogPost } from "@/lib/types";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

type PostListProps = {
	posts: SerializedBlogPost[];
};

export default function PostList({ posts }: PostListProps) {
	return (
		<div className="space-y-6">
			{posts.map((post, index) => (
				<div key={post.id}>
					<div className="flex flex-col gap-3">
						{post.imageUrl && (
							<div className="w-full rounded-lg overflow-hidden">
								<AspectRatio ratio={16 / 9}>
									<Link href={`/${post.slug}`}>
										<NextImage
											src={post.imageUrl}
											alt={post.title}
											fill
											className="object-cover w-full h-full rounded-lg hover:scale-105 transform duration-300"
										/>
									</Link>
								</AspectRatio>
							</div>
						)}
						<div className="flex flex-col">
							<div className="flex h-9 items-center shrink-0">
								<Link
									href={`/${post.slug}`}
									className="text-primary text-lg md:text-xl lg:text-2xl font-semibold hover:text-muted-foreground transition-colors duration-200"
								>
									<h2>{post.title}</h2>
								</Link>
							</div>
							<div className="flex  items-center w-full">
								<span className="text-sm sm:text-base tracking-wide font-medium">{post.author}</span>
								<span className="text-xs sm:text-sm">
									{post.author && post.publishedAt && <>&nbsp;&nbsp;-&nbsp;&nbsp;</>}
									{post.publishedAt}
								</span>
							</div>
						</div>
						<p className="text-muted-foreground text-sm lg:text-base">{post.excerpt}</p>
						<Button asChild size="sm" className="max-w-fit">
							<Link href={`/${post.slug}`} prefetch={true} className="text-xs lg:text-sm">
								Read more...
							</Link>
						</Button>
					</div>
					{index < posts.length - 1 && <Separator className="my-6" />}
				</div>
			))}
		</div>
	);
}
