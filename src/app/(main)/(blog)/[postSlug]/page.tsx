import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Article, WithContext } from "schema-dts";
import { getBaseUrl, getPostForBlog } from "../_actions/blog-actions";
import { getSiteSettings } from "@/app/(admin)/admin/settings/_actions/settings-actions";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PostPageProps {
	params: Promise<{ postSlug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
	const { postSlug } = await params;

	const [baseUrl, siteSettings, post] = await Promise.all([
		getBaseUrl(),
		getSiteSettings(),
		getPostForBlog(postSlug),
	]);

	if (!post) {
		return {
			title: `Post not found | ${siteSettings?.siteName}`,
			description: `The requested blog post could not be found. | ${siteSettings?.siteName}`,
		};
	}

	const basePageUrl = `${baseUrl}/${post.slug}`;
	const baseImageUrl = post.imageUrl;

	const description = post.excerpt.length > 200 ? post.excerpt.substring(0, 197) + "..." : post.excerpt;

	return {
		title: post.title,
		description,
		alternates: {
			canonical: basePageUrl,
		},
		openGraph: {
			title: post.title,
			description,
			url: basePageUrl,
			type: "article",
			images: [
				{
					url: baseImageUrl,
					width: 1200,
					height: 630,
					alt: `${post.title} - ${siteSettings?.siteName}`,
				},
			],
			siteName: siteSettings?.siteName,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description,
			images: baseImageUrl,
			//site:
			//creator:
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}

export function generateViewport() {
	return {
		viewport: "width=device-width, initial-scale=1",
	};
}

export default async function Page({ params }: PostPageProps) {
	const { postSlug } = await params;

	const [baseUrl, siteSettings, post] = await Promise.all([
		getBaseUrl(),
		getSiteSettings(),
		getPostForBlog(postSlug),
	]);

	if (!post) {
		return <div>Post not found.</div>;
	}

	const basePageUrl = `${baseUrl}/${post.slug}`;
	const baseImageUrl = post.imageUrl;

	const description = post.excerpt.length > 200 ? post.excerpt.substring(0, 200) + "..." : post.excerpt;

	const articleJsonLd: WithContext<Article> = {
		"@context": "https://schema.org",
		"@type": "Article",
		url: basePageUrl,
		headline: `${post.title} - ${siteSettings?.siteName}`,
		description,
		image: baseImageUrl,
		author: {
			"@type": "Organization",
			name: siteSettings?.siteName,
			url: `${baseUrl}`,
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(articleJsonLd),
				}}
			/>

			<article >
				<div className="pb-2 sm:pb-6">
					<div className="flex">
						<div className="flex h-9 items-center shrink-0">
							<h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">{post.title}</h1>
							{(post.author || post.publishedAt) && 
                                <Separator orientation="vertical" className="mx-3" />
                            }
						</div>
						<div className="flex items-center w-full">
							<span className="line-clamp-1">
								<span className="text-sm sm:text-base lg:text-lg tracking-wide font-medium">
									{post.author}
								</span>
								<span className="text-xs sm:text-sm lg:text-base">
									{post.author && post.publishedAt && <> - </>}
									{post.publishedAt}
								</span>
							</span>
						</div>
					</div>
				</div>

				<div className="pb-2 sm:pb-6">
					{post.imageUrl && (
						<div className="w-full">
							<AspectRatio ratio={16 / 9}>
								<Image
									src={post.imageUrl}
									alt={post.title}
									fill
									className="object-cover w-full h-full rounded-lg"
								/>
							</AspectRatio>
						</div>
					)}
				</div>

				<div className="pb-2 sm:pb-6">
					<div className="flex h-9 w-full items-center justify-end">
                    
                        <div className="line-clamp-1">
                        <Link
							href={`/categories/${post.category.slug}`}
							className="text-muted-foreground text-sm lg:text-base hover:text-primary transition-colors duration-200"
							prefetch={true}
						>
							{post.category.name}
						</Link>
                        </div>
						
                        {post.tags.length > 0 && 
                        
                        <Separator orientation="vertical" className="mx-3" />
                        
                        }
                        
                        
						{post.tags.map((tag) => (
							<Badge
								key={tag.id}
								variant="secondary"
								className="py-1 px-2 mr-2 text-xs lg:text-sm hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors duration-200"
							>
								<Link href={`/tags/${tag.slug}`} prefetch={true}>
									{tag.name}
								</Link>
							</Badge>
						))}
                        

					</div>
				</div>

				<div className="pb-2 sm:pb-6">
					<h2 className="text-lg md:text-xl lg:text-2xl text-muted-foreground italic">{post.subTitle}</h2>
				</div>

				<div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
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
			</article>
		</>
	);
}
