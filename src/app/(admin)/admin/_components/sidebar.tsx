"use client";

import CustomUserButton from "@/components/auth/custom-user-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    ArrowUp,
	Images,
	LayoutPanelLeft,
	List,
	LucideIcon,
	Mails,
	NotebookText,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const postItems = [
	{
		title: "Posts",
		links: [
			{
				icon: List,
				label: "List",
				href: "/admin/posts",
			},
			{
				icon: Plus,
				label: "Create",
				href: "/admin/posts/create",
			},
		],
	},
];

const categoryItems = [
	{
		title: "Categories",
		links: [
			{
				icon: List,
				label: "List",
				href: "/admin/categories",
			},
			{
				icon: Plus,
				label: "Create",
				href: "/admin/categories/create",
			},
		],
	},
];

const tagItems = [
	{
		title: "Tags",
		links: [
			{
				icon: List,
				label: "List",
				href: "/admin/tags",
			},
			{
				icon: Plus,
				label: "Create",
				href: "/admin/tags/create",
			},
		],
	},
];

const imageItems = [
	{
		title: "Images",
		links: [
			{
				icon: Images,
				label: "Gallery",
				href: "/admin/images",
			},
			{
				icon: ArrowUp,
				label: "Upload",
				href: "/admin/images/upload",
			},
		],
	},
];

const settingsItems = [
	{
		title: "Settings",
		links: [
			{
				icon: LayoutPanelLeft,
				label: "General",
				href: "/admin/settings/general",
			},
			{
				icon: NotebookText,
				label: "Static Pages",
				href: "/admin/settings/pages",
			},
			{
				icon: Mails,
				label: "Email",
				href: "/admin/settings/email",
			},
		],
	},
];

export default function Sidebar() {
	return (
		<div className="flex flex-col w-full min-h-full flex-grow bg-secondary overflow-y-auto">
			<div className="flex gap-6 items-center justify-center py-6">
				<Button
					asChild
					variant="default"
					className="bg-gray-200 text-muted-foreground hover:bg-gray-300"
				>
					<Link href="/">Back to Home</Link>
				</Button>
				<CustomUserButton />
			</div>

			<Separator className="mb-3" />

			{postItems.map((item) => (
				<SidebarItem
					key={item.title}
					title={item.title}
					links={item.links}
				/>
			))}
            
            <Separator className="my-3" />

			{categoryItems.map((item) => (
				<SidebarItem key={item.title} {...item} />
			))}

            <Separator className="my-3" />

			{tagItems.map((item) => (
				<SidebarItem key={item.title} {...item} />
			))}

            <Separator className="my-3" />

			{imageItems.map((item) => (
				<SidebarItem key={item.title} {...item} />
			))}

            <Separator className="my-3" />

			{settingsItems.map((item) => (
				<SidebarItem key={item.title} {...item} />
			))}
		</div>
	);
}

interface SidebarItemProps {
	title: string;
	links: {
		icon: LucideIcon;
		label: string;
		href: string;
	}[];
}

function SidebarItem({ title, links }: SidebarItemProps) {
	const pathname = usePathname();

	return (
		<div className="text-muted-foreground">

			<div className="flex items-center px-6">
				<h4 className="font-semibold text-sm uppercase">{title}</h4>
			</div>

			<div className="mt-2 flex flex-col">
				{links.map((link) => {
					const isActive = pathname === link.href;
					return (
						<Link
							key={link.label}
							href={link.href}
							className={cn(
								"flex items-center w-full transition-colors",
								isActive ? "bg-gray-200 hover:bg-gray-300" : "hover:bg-gray-200"
							)}
						>
							<div className="flex items-center gap-2 px-9 py-1">
								<link.icon size={16} />
								<span className="text-sm">{link.label}</span>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
