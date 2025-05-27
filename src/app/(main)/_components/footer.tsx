import Link from "next/link";
import { getPagesForMain } from "../_actions/main-actions";
import React from "react";

interface FooterProps {
	siteName?: string;
}

export default async function Footer({ siteName }: FooterProps) {
	const pages = await getPagesForMain();

	return (
		<footer className="border-t bg-secondary">
			<div className="container mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 pt-6 pb-3">
					{pages.map((page) => (
						<React.Fragment key={page.id}>
							<div  className="flex items-center">
								<Link
									href={`/pages/${page.slug}`}
									className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
								>
									{page.title}
								</Link>
							</div>
							<div className="hidden md:block text-muted-foreground">
								|
							</div>
						</React.Fragment>
					))}
					<div className="flex items-center">
						<Link
							href={"/contact"}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							Contact
						</Link>
					</div>
				</div>

				<div className="text-center text-sm text-muted-foreground pt-3 pb-6">
					&copy;{new Date().getFullYear()} {siteName}. All rights
					reserved.
				</div>
			</div>
		</footer>
	);
}
