"use client";

import {
	ColumnDef,
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowUpDown, Loader2, MoreVertical, Search } from "lucide-react";
import Link from "next/link";
import { deleteImage } from "../_actions/images-actions";
import { toast } from "sonner";
import NextImage from "next/image";
import { Image as PrismaImage } from "@prisma/client";
import { useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface ImageListProps {
	images: PrismaImage[];
}

export default function ImageList({ images: initialImages }: ImageListProps) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [images, setImages] = useState(initialImages);

	// Definition of Data Table
	const columns: ColumnDef<PrismaImage>[] = [
		{
			accessorKey: "title",
			header: ({ column }) => (
				<Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => <div className="text-sm">{row.original.title}</div>,
		},
	];

	// Tanstack Table Hook
	const table = useReactTable({
		data: images,
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

	const handleDelete = (imageId: string) => {
		const newImages = images.filter((image) => image.id !== imageId);
		setImages(newImages);
	};

	if (images.length === 0) {
		return <div className="text-center text-muted-foreground">No images found.</div>;
	}

	return (
		<div className="space-y-6">
			{/* Search */}
			<div className="flex justify-center">
				<div className="relative max-w-md w-full">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						type="text"
						placeholder="Search images by title, description, or alt text..."
						value={globalFilter}
						onChange={(e) => {
							setGlobalFilter(e.target.value);
							table.setPageIndex(0);
						}}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Image Gallery */}
			{table.getRowModel().rows?.length ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
					{table.getRowModel().rows.map((row) => (
						<ImageCard key={row.id} image={row.original} onDelete={handleDelete} />
					))}
				</div>
			) : (
				<div className="text-center text-muted-foreground">No images match your search.</div>
			)}

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} image(s) total
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

interface ImageCardProps {
	image: PrismaImage;
	onDelete: (imageId: string) => void;
}

function ImageCard({ image, onDelete }: ImageCardProps) {
	const [isPendingDeleteImage, startTransitionDeleteImage] = useTransition();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const handleDelete = async (imageId: string) => {
		startTransitionDeleteImage(async () => {
			try {
				await deleteImage(imageId);
				onDelete(imageId);
				toast.success("Image deleted");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Error deleting image");
			}
		});
	};

	return (
		<>
			<Card className="border-1 rounded-none shadow-none gap-2">
				<CardHeader className="flex items-center justify-between">
					<CardTitle>
						{isPendingDeleteImage ? <Skeleton className="w-30 h-5 rounded-lg" /> : image.title}
					</CardTitle>
					<DropdownMenu open={isPendingDeleteImage ? false : isDropdownOpen} onOpenChange={setIsDropdownOpen}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								aria-label={`Actions for ${image.title}`}
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>
								<Link href={`/admin/images/edit/${image.id}`}>Update Image</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:bg-destructive/10"
								onClick={() => {
									setIsDropdownOpen(false);
									setIsAlertOpen(true);
								}}
							>
								Delete Image
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardHeader>
				<CardContent>
					<div>
						<AspectRatio ratio={16 / 9}>
							{isPendingDeleteImage ? (
								<Skeleton className="w-full h-full rounded-lg" />
							) : (
								<NextImage
									src={image.imageUrl}
									alt={image.alt || ""}
									fill
									className="object-cover w-full h-full rounded-lg"
								/>
							)}
						</AspectRatio>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the image.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => handleDelete(image.id)}>
							{isPendingDeleteImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Image"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
