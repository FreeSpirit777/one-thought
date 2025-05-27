"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tagFormSchema, TagFormValues } from "@/lib/validation";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createTag, deleteTag, updateTag } from "../_actions/tags-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateSlug } from "@/lib/helpers";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import { Tag } from "@prisma/client";
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

interface TagCreateUpdateProps {
	tag?: Tag;
}

export default function TagForm({ tag }: TagCreateUpdateProps) {
	const router = useRouter();
	const [isUpdateSubmitted, setIsUpdateSubmitted] = useState(false);
	const [isDeleteSubmitted, setIsDeleteSubmitted] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const form = useForm<TagFormValues>({
		resolver: zodResolver(tagFormSchema),
		defaultValues: {
			name: tag?.name || "",
			slug: tag?.slug || "",
		},
	});

	const { setValue } = form;
	const { isSubmitting } = form.formState;

	const onSubmit = async (data: TagFormValues) => {
		try {
			const input = { ...data, id: tag?.id };
			const action = tag?.id ? updateTag : createTag;
			await action(input);
			setIsUpdateSubmitted(true);
			toast.success(tag?.id ? "Tag updated" : "Tag created");
			router.push("/admin/tags");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An error occured"
			);
		}
	};

	const handleDelete = async (tagId: string) => {
		try {
			await deleteTag(tagId);
			setIsDeleteSubmitted(true);
			toast.success("Tag deleted");
			router.push("/admin/tags");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Error deleting tag"
			);
            setIsDeleteSubmitted(false);
		} finally {
            setIsDeleting(false);
        }
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6 w-full"
			>
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">
						{tag?.id ? "Update Tag" : "Create Tag"}
					</h1>
					<div className="flex items-center justify-end gap-3">
						<Button asChild variant="ghost">
							<Link href="/admin/tags">Back</Link>
						</Button>
						<LoadingButton
							type="submit"
							isLoading={isSubmitting}
							isLoadingText={
								tag?.id ? "Updating..." : "Creating..."
							}
							isSubmitted={isUpdateSubmitted}
							isSubmittedText={
								tag?.id ? "Updated" : "Created"
							}
						>
							{tag?.id ? "Update" : "Create"}
						</LoadingButton>
						{tag?.id && (
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
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => {
												handleDelete(tag.id!);
												setIsDeleting(true);
											}}
										>
											Delete Tag
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
							<FormLabel>Tag</FormLabel>
							<FormControl>
								<Input
                                    className="max-w-md"
									placeholder="Tag name"
									{...field}
									onChange={(e) => {
										field.onChange(e);
										if (!tag?.id) {
											setValue(
												"slug",
												generateSlug(e.target.value),
												{ shouldValidate: false }
											);
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
								<Input className="max-w-md" placeholder="Tag slug" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
