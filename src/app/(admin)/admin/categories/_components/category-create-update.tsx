"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema, CategoryFormValues } from "@/lib/validation";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory, updateCategory } from "../_actions/categories-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateSlug } from "@/lib/helpers";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import { Separator } from "@/components/ui/separator";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@prisma/client";

interface CategoryCreateUpdateProps {
	category?: Category;
}

export default function CategoryForm({ category }: CategoryCreateUpdateProps) {
	const router = useRouter();
	const [isUpdateSubmitted, setIsUpdateSubmitted] = useState(false);
	const [isDeleteSubmitted, setIsDeleteSubmitted] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: {
			name: category?.name || "",
			slug: category?.slug || "",
			isFeatured: category?.isFeatured || false,
		},
	});

	const { setValue } = form;
	const { isSubmitting } = form.formState;

	const onSubmit = async (data: CategoryFormValues) => {
		try {
			const input = { ...data, id: category?.id };
			const action = category?.id ? updateCategory : createCategory;
			await action(input);
			setIsUpdateSubmitted(true);
			toast.success(category?.id ? "Category updated" : "Category created");
			router.push("/admin/categories");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occured");
		}
	};

	const handleDelete = async (categoryId: string) => {
		try {
			await deleteCategory(categoryId);
			setIsDeleteSubmitted(true);
			toast.success("Category deleted");
			router.push("/admin/categories");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error deleting category");
			setIsDeleteSubmitted(false);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">{category?.id ? "Update Category" : "Create Category"}</h1>
					<div className="flex items-center justify-end gap-3">
						<Button asChild variant="ghost">
							<Link href="/admin/categories">Back</Link>
						</Button>
						<LoadingButton
							type="submit"
							isLoading={isSubmitting}
							isLoadingText={category?.id ? "Updating..." : "Creating..."}
							isSubmitted={isUpdateSubmitted}
							isSubmittedText={category?.id ? "Updated" : "Created"}
						>
							{category?.id ? "Update" : "Create"}
						</LoadingButton>
						{category?.id && (
							<AlertDialog>
								<AlertDialogTrigger asChild type="button">
									<LoadingButton
										type="button"
										variant="outline"
										isLoading={isDeleting}
										isLoadingText="Deleting..."
										isSubmitted={isDeleteSubmitted}
										isSubmittedText="Deleted"
									>
										Delete
									</LoadingButton>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
										<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => {
												handleDelete(category.id!);
												setIsDeleting(true);
											}}
										>
											Delete Category
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</div>

				<Separator />

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<FormControl>
								<Input
									className="max-w-md"
									placeholder="Category name"
									{...field}
									onChange={(e) => {
										field.onChange(e); // Reset standard handler
										if (!category?.id) {
											setValue("slug", generateSlug(e.target.value), { shouldValidate: false });
										}
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="slug"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Slug</FormLabel>
							<FormControl>
								<Input className="max-w-md" placeholder="Category slug" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="isFeatured"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Is Featured</FormLabel>
							<div className="flex gap-2 items-center">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<FormDescription>Feature this category in navigation.</FormDescription>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
