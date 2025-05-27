"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, Loader2, MoreVertical, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { togglePageVisibility } from "../_actions/pages-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Page } from "@prisma/client";
import { useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PageList({ pages }: { pages: Page[] }) {
	if (pages.length === 0) {
		return <div>No Pages found.</div>;
	}

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[50px] text-center">
							Visibility
						</TableHead>
                        <TableHead className="w-[50px]">
							Label
						</TableHead>
						<TableHead>Title</TableHead>

						<TableHead className="w-[50px] text-center">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{pages.map((page) => (
						<PageRow key={page.id} page={page} />
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function PageRow({ page }: { page: Partial<Page> }) {
	const router = useRouter();
	const [isPendingToggleVisibility, startTransitionToggleVisibility] =
		useTransition();
	const [isPendingDeletePage] = useTransition();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleToggleVisibility = async (
		pageId: string,
		isVisible: boolean
	) => {
		startTransitionToggleVisibility(async () => {
			try {
				await togglePageVisibility(pageId, !isVisible);
				toast.success("Visibility toggled");
				router.refresh();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "An error occurred"
				);
			}
		});
	};

	return (
		<TableRow>
			
			<TableCell>
				<div className="flex items-center justify-center">
					{isPendingDeletePage ? (
						<Skeleton className="w-5 h-5 rounded-full" />
					) : isPendingToggleVisibility ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : page.isVisible ? (
						<>
							<span className="sr-only">Visible</span>
							<CheckCircle2 className="w-5 h-5 stroke-green-600" />
						</>
					) : (
						<>
							<span className="sr-only">Hidden</span>
							<XCircle className="w-5 h-5 stroke-destructive" />
						</>
					)}
				</div>
			</TableCell>
            <TableCell>{page.label}</TableCell>
			<TableCell className="align-middle">
				{isPendingDeletePage ? (
					<Skeleton className="w-[100px] h-6 rounded-full" />
				) : (
					page.title
				)}
			</TableCell>
			<TableCell className="text-center align-middle">
				<DropdownMenu
					open={isDropdownOpen}
					onOpenChange={(open) => setIsDropdownOpen(open)}
				>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							aria-label="Actions"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Link href={`/admin/settings/pages/upsert/${page.id}`}>
								Update Page
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={isPendingToggleVisibility}
							onClick={() =>
								handleToggleVisibility(
									page.id!,
									page.isVisible!
								)
							}
						>
							{page.isVisible ? "Hide Page" : "Show Page"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
