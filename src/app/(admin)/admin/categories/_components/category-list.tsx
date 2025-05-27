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
import {
	ArrowUpDown,
	CheckCircle2,
	Loader2,
	MoreVertical,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import {
	deleteCategory,
	toggleCategoryIsFeatured,
} from "../_actions/categories-actions";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@prisma/client";

interface CategoryListProps {
	categories: Category[];
}

export default function CategoryList({
	categories: initialCategories,
}: CategoryListProps) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [categories, setCategories] = useState(initialCategories);

	// Definition of Data Table
	const columns: ColumnDef<Category>[] = [
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
		data: categories,
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

	const handleDelete = (categoryId: string) => {
		const newCategories = categories.filter(
			(category) => category.id !== categoryId
		);
		setCategories(newCategories);
	};

	if (categories.length === 0) {
		return <div>No categories found.</div>;
	}

	return (
		<div className="space-y-6">
			{/* Search */}
			<div className="flex items-center">
				<Input
					placeholder="Search categories..."
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
								<TableHead className="w-[50px] text-center">
									Is Featured
								</TableHead>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={
											header.id === "actions" ||
											header.id === "visibility"
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
									<CategoryRow
										key={row.id}
										category={row.original}
										onDelete={handleDelete}
									/>
								))
						) : (
							<TableRow>
								<TableCell colSpan={3} className="text-center">
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
					{table.getFilteredRowModel().rows.length} category(s) total
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

interface CategoryRowProps {
	category: Category;
	onDelete: (categoryId: string) => void;
}

function CategoryRow({ category, onDelete }: CategoryRowProps) {
	const [isPendingToggleIsFeatured, startTransitionToggleIsFeatured] =
		useTransition();
	const [isPendingDeleteCategory, startTransitionDeleteCategory] =
		useTransition();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isFeatured, setIsFeatured] = useState(category.isFeatured);

	const handleToggleIsFeatured = async (
		categoryId: string,
		currentIsFeatured: boolean
	) => {
		setIsFeatured(!currentIsFeatured);

		startTransitionToggleIsFeatured(async () => {
			try {
				await toggleCategoryIsFeatured(categoryId, !currentIsFeatured);
				toast.success("IsFeatured toggled");
			} catch (error) {
				setIsFeatured(currentIsFeatured);
				toast.error(
					error instanceof Error ? error.message : "An error occurred"
				);
			}
		});
	};

	const handleDelete = async (categoryId: string) => {
		startTransitionDeleteCategory(async () => {
			try {
				await deleteCategory(categoryId);
				onDelete(categoryId);
				toast.success("Category deleted");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Error deleting category"
				);
			}
		});
	};

	return (
		<>
			<TableRow key={category.id}>
				<TableCell>
					<div className="flex items-center justify-center">
						{isPendingDeleteCategory ? (
							<Skeleton className="w-5 h-5 rounded-full" />
						) : isPendingToggleIsFeatured ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : isFeatured ? (
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
				<TableCell className="pl-4">
					{isPendingDeleteCategory ? (
						<Skeleton className="w-30 h-5 rounded-lg" />
					) : (
						category.name
					)}
				</TableCell>
				<TableCell className="text-center">
					<DropdownMenu
						open={isDropdownOpen}
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
								<Link
									href={`/admin/categories/edit/${category.id}`}
								>
									Update Category
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={isPendingToggleIsFeatured}
								onClick={() =>
									handleToggleIsFeatured(
										category.id!,
										isFeatured!
									)
								}
							>
								{isFeatured
									? "Unfeature Category"
									: "Feature Category"}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:bg-destructive/10"
								onClick={() => {
									setIsDropdownOpen(false);
									setIsAlertOpen(true);
								}}
							>
								Delete Category
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
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => handleDelete(category.id!)}
						>
							{isPendingDeleteCategory ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Delete Category"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
