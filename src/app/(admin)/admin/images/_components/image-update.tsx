"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { imageUpdateFormSchema, ImageUpdateFormValues } from "@/lib/validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteImage, updateImage } from "../_actions/images-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import NextImage from "next/image";
import { Image as PrismaImage } from "@prisma/client";
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
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

export default function ImageForm({ image }: { image: PrismaImage }) {
	const router = useRouter();
	const [isUpdateSubmitted, setIsUpdateSubmitted] = useState(false);
	const [isDeleteSubmitted, setIsDeleteSubmitted] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const form = useForm<ImageUpdateFormValues>({
		resolver: zodResolver(imageUpdateFormSchema),
		defaultValues: {
			title: image.title || "",
			alt: image.alt || "",
			description: image.description || "",
		},
		mode: "onChange",
	});

	const { isSubmitting } = form.formState;

	const onSubmit = async (data: ImageUpdateFormValues) => {
		try {
			await updateImage({
				id: image.id,
				...data,
			});
			setIsUpdateSubmitted(true);
			toast.success("Image updated");
			router.push("/admin/images");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		}
	};

	const handleDelete = async (ImageId: string) => {
		try {
			await deleteImage(ImageId);
			setIsDeleteSubmitted(true);
			toast.success("Image deleted");
			router.push("/admin/images");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error deleting Image");
            setIsDeleteSubmitted(false);
        } finally {
            setIsDeleting(false);
        }
	};

	return (
		<div className="w-full p-4">
			<div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold">Update image</h1>
							<div className="flex items-center justify-end gap-3">
								<Button asChild variant="ghost">
									<Link href="/admin/images">Back</Link>
								</Button>
								<LoadingButton
									type="submit"
									isLoading={isSubmitting}
									isLoadingText={"Updating"}
									isSubmitted={isUpdateSubmitted}
									isSubmittedText={"Updated"}
								>
									Update
								</LoadingButton>
								{image?.id && (
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
												<AlertDialogDescription>
													This action cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => {
														handleDelete(image.id!);
														setIsDeleting(true);
													}}
												>
													Delete Image
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}
							</div>
						</div>

						<Separator />

						<div className="flex flex-col md:flex-row gap-4">
							<div className="wfull- md:w-1/2">
								<AspectRatio ratio={16 / 9}>
									<NextImage
										src={image.imageUrl}
										alt={image.alt || `Image: ${image.title}`}
										fill
										className="object-cover w-full h-full rounded-lg"
									/>
								</AspectRatio>
							</div>
							<div className="w-full md:w-1/2">
								<div className="flex flex-col gap-4 ">
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl>
													<Input placeholder="Image title" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="alt"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Alt Text</FormLabel>
												<FormControl>
													<Input
														placeholder="Alternative text for accessibility"
														{...field}
														value={field.value || ""}
														
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Describe the image"
														{...field}
														value={field.value || ""}
														rows={3}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>
					</form>
				</Form>
			</div>
			<div className="text-sm text-muted-foreground mt-6">
				<span className="font-medium">Image URL:</span>{" "}
				<a href={image.imageUrl} target="_blank" rel="noopener noreferrer" className="underline break-all">
					{image.imageUrl}
				</a>
			</div>
		</div>
	);
}
