"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageFormSchema, PageFormValues } from "@/lib/validation";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateSlug } from "@/lib/helpers";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { cn } from "@/lib/utils";

import { Image } from "@prisma/client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import NextImage from "next/image";

import { ImageIcon } from "lucide-react";
import { PageToEdit, upsertPage } from "../_actions/pages-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ImageSelectionModal } from "../../../_components/image-selection-modal";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface PageUpsertProps {
	page?: PageToEdit;
}

export default function PageCreateUpdate({ page }: PageUpsertProps) {
	const [selectedImage, setSelectedImage] = useState<Image | null>(page?.image || null);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const router = useRouter();

	const form = useForm<PageFormValues>({
		resolver: zodResolver(pageFormSchema),
		defaultValues: {
			id: page?.id,
			title: page?.title || "",
			slug: page?.slug || "",
			jsonContent: page?.jsonContent || "",
			imageId: page?.imageId ?? null,
			isVisible: page?.isVisible,
		},
	});

	const {
		setValue,
		formState: { isSubmitting, errors },
	} = form;

	const handleSelectImage = (image: Image | null) => {
		setValue("imageId", image?.id ?? null, { shouldValidate: true });
		setSelectedImage(image);
	};

	const onSubmit = async (data: PageFormValues) => {
		try {
			await upsertPage(data);
			setIsSubmitted(true);
			toast.success("Page upserted");
			router.push("/admin/settings/pages");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		}
	};

	return (
		<div className="p-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
					<div className="flex items-center justify-between">
						<div className="flex gap-2 items-baseline"><h1 className="text-2xl font-bold">Upsert</h1><span>{page?.label}</span></div>
						<div className="flex items-center justify-end gap-3">
							<Button asChild variant="ghost">
								<Link href="/admin/settings/pages">Back</Link>
							</Button>
							<LoadingButton type="submit" isLoading={isSubmitting} isSubmitted={isSubmitted}>
								Upsert
							</LoadingButton>
						</div>
					</div>

					<Separator />

					<div className="flex flex-col md:flex-row gap-6">
						<div className="flex-1 md:w-3/4 space-y-6">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Page Title</FormLabel>
										<FormControl>
											<Input
												placeholder="Page title"
												{...field}
												onChange={(e) => {
													field.onChange(e);
													if (!page?.id) {
														const newSlug = generateSlug(e.target.value);
														setValue("slug", newSlug, {
															shouldValidate: true,
														});
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
											<Input placeholder="page-slug" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="jsonContent"
								render={({ field }) => {
									return (
										<FormItem>
											<FormLabel>Content</FormLabel>
											<div
												className={cn(
													"min-h-60 resize-y overflow-y-auto border rounded-md transition-shadow",
													errors.jsonContent
														? "border-red-500 focus-within:ring-destructive/20 focus-within:ring-[3px]"
														: "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]"
												)}
											>
												{}
												<RichTextEditor content={field.value} onChange={field.onChange} />
											</div>
											{errors.jsonContent && (
												<p className="text-sm text-destructive">
													{errors.jsonContent.message as string}
												</p>
											)}
										</FormItem>
									);
								}}
							/>
						</div>

						<div className="md:w-1/4 space-y-6">
							<FormField
								control={form.control}
								name="imageId"
								render={() => (
									<FormItem>
										<FormLabel>Image</FormLabel>
										<FormControl>
											<Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
												<DialogTrigger asChild>
													<div className="flex items-center justify-center cursor-pointer  ">
														<AspectRatio ratio={16 / 9}>
															{selectedImage ? (
																<NextImage
																	src={selectedImage.imageUrl}
																	alt={selectedImage.alt || "Chosen Image"}
																	fill
																	className="object-cover w-full h-full rounded-lg"
																/>
															) : (
																<span className="flex flex-col w-full h-full justify-center items-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors">
																	<ImageIcon className="w-12 h-12" />
																	<p className="text-sm">Click to select an image</p>
																</span>
															)}
														</AspectRatio>
													</div>
												</DialogTrigger>
												<ImageSelectionModal
													onSelectImage={(image) => handleSelectImage(image)}
													selectedImageId={selectedImage?.id}
												/>
											</Dialog>
										</FormControl>
										{selectedImage && (
											<button
												type="button"
												className="text-sm text-destructive mt-2"
												onClick={() => handleSelectImage(null)}
											>
												Remove
											</button>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isVisible"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Is Visible</FormLabel>
                                        <div className="flex gap-2 items-center">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
                                        <FormDescription>Show this page in the footer.</FormDescription>
                                        </div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<div className="mt-6"></div>
				</form>
			</Form>
		</div>
	);
}
