"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table";
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { deleteTag } from "../_actions/tags-actions";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@prisma/client";

interface TagListProps {
	tags: Tag[];
}

export default function TagList({ tags: initialTags }: TagListProps) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [tags, setTags] = useState(initialTags);

	// Definition of Data Table
	const columns: ColumnDef<Tag>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
		},
	];

	// Tanstack Table Hook
	const table = useReactTable({
		data: tags,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		initialState: {
			pagination: {
				pageSize: 8,
			},
		},
		autoResetPageIndex: false,
	});

	const handleDelete = (tagId: string) => {
		const newTags = tags.filter((tag) => tag.id !== tagId);
		setTags(newTags);
	};

	if (tags.length === 0) {
		return <div>No tags found.</div>;
	}

	return (
		<div className="space-y-6">
			{/* Search */}
			<div className="flex items-center">
				<Input
					placeholder="Search tags..."
					value={globalFilter}
					onChange={(e) => {
                        setGlobalFilter(e.target.value);
                        table.setPageIndex(0);
                      }}
					className="max-w-sm"
				/>
			</div>

			{/* Table */}
			<div>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={
											header.id === "actions"
												? "w-[50px] text-center"
												: "pl-1"
										}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext()
											  )}
									</TableHead>
								))}
								<TableHead className="w-[50px] text-center">
									Actions
								</TableHead>
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<TagRow
										key={row.id}
										tag={row.original}
										onDelete={handleDelete}
									/>
								))
						) : (
							<TableRow>
								<TableCell colSpan={2} className="text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} tag(s) total
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

interface TagRowProps {
	tag: Tag;
	onDelete: (tagId: string) => void;
}

function TagRow({ tag, onDelete }: TagRowProps) {
	const [isPendingDeleteTag, startTransitionDeleteTag] = useTransition();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const handleDelete = async (tagId: string) => {
		startTransitionDeleteTag(async () => {
			try {
				await deleteTag(tagId);
				onDelete(tagId);
				toast.success("Tag deleted");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Error deleting tag"
				);
			}
		});
	};

	return (
		<>
			<TableRow key={tag.id}>
				<TableCell className="pl-4">
					{isPendingDeleteTag ? (
						<Skeleton className="w-30 h-5 rounded-lg" />
					) : (
						tag.name
					)}
				</TableCell>
				<TableCell className="text-center">
					<DropdownMenu
						open={isPendingDeleteTag ? false : isDropdownOpen}
						onOpenChange={setIsDropdownOpen}
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
								<Link href={`/admin/tags/edit/${tag.id}`}>
									Update Tag
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:bg-destructive/10"
								onClick={() => {
									setIsDropdownOpen(false);
									setIsAlertOpen(true);
								}}
							>
								Delete Tag
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</TableCell>
			</TableRow>

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete the tag.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => handleDelete(tag.id!)}
						>
							{isPendingDeleteTag ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Delete Tag"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
