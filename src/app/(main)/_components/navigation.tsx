"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import CustomUserButton from "@/components/auth/custom-user-button";
import { Menu, X } from "lucide-react";
import NavLink from "@/components/custom-ui/nav-link";
import { useState } from "react";

import NextImage from "next/image";
import { SiteSettingsForApp } from "@/app/_actions/app-actions";

interface Category {
	id: string;
	name: string;
	slug: string;
}

interface NavigationProps {
	siteSettings: SiteSettingsForApp;
	categories: Category[];
}

export default function Navigation({ siteSettings, categories }: NavigationProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<section className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur-sm">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between py-4">
					<div className="flex items-center gap-2">
						<Link href="/">
							{siteSettings.siteSettingImageUrl && (
								<NextImage
									width={32}
									height={32}
									src={siteSettings.siteSettingImageUrl || ""}
									alt="Home"
								/>
							)}
						</Link>
						<div className="flex items-baseline gap-1.5">
                        <Link
							href="/"
							className="text-xl md:text-2xl font-semibold text-foreground"
						>
							<span>{siteSettings.siteName}</span>
						</Link>

						{siteSettings.siteDescription && (
							<span className="hidden lg:block text-base text-muted-foreground">
								{siteSettings.siteDescription}
							</span>
						)}
                        </div>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center">
						<div className="flex gap-5">
							{categories.map((category) => (
								<NavLink key={category.id} href={`/categories/${category.slug}`}>
									{category.name}
								</NavLink>
							))}
						</div>
						<div className="flex gap-2 pl-6">
							<SignedOut>
								<Button
									variant="secondary"
									asChild
									className="text-sm lg:text-base text-muted-foreground hover:text-primary h-9"
								>
									<Link href="/?modal=sign-in">Sign In</Link>
								</Button>
							</SignedOut>
							<SignedIn>
								<CustomUserButton />
							</SignedIn>
						</div>
					</nav>

					{/* Mobile Navigation */}
					<div className="flex items-center gap-3 md:hidden">
						<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
							<DropdownMenuTrigger className="focus:outline-none">
								{isOpen ? (
									<X className="h-6 w-6 text-muted-foreground" />
								) : (
									<Menu className="h-6 w-6 text-muted-foreground" />
								)}
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="p-0 bg-white border-0 shadow-[0_5px_15px_0_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2),0_0_0_1px_rgba(0,0,0,0.07)] rounded-lg min-w-[200px]"
							>
								{categories.map((category, index) => (
									<div key={category.id}>
										<DropdownMenuItem
											className="px-0 focus:bg-gray-100/60 focus:text-black rounded-none"
											onSelect={() => setIsOpen(false)}
										>
											<NavLink
												href={`/categories/${category.slug}`}
												className="w-full pl-10 pr-40 py-2 text-[14px] text-[#919191] hover:text-black"
											>
												{category.name}
											</NavLink>
										</DropdownMenuItem>
										{index < categories.length - 1 && (
											<DropdownMenuSeparator className="bg-gray-200/70 p-0 m-0" />
										)}
									</div>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<SignedOut>
							<Button
								variant="secondary"
								size="sm"
								asChild
								className="text-sm text-muted-foreground hover:text-primary"
							>
								<Link href="/?modal=sign-in">Sign In</Link>
							</Button>
						</SignedOut>
						<SignedIn>
							<CustomUserButton />
						</SignedIn>
					</div>
				</div>
			</div>
		</section>
	);
}
