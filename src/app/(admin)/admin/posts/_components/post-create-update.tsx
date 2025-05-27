"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postFormSchema, PostFormValues } from "@/lib/validation";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	createPost,
	deletePost,
	PostToEdit,
	updatePost,
} from "../_actions/posts-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatEnumLabel, generateSlug } from "@/lib/helpers";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Category, Tag, Image } from "@prisma/client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import NextImage from "next/image";
import { ImageSelectionModal } from "../../_components/image-selection-modal";
import { CalendarIcon, ImageIcon } from "lucide-react";
import { MultiSelect } from "@/components/custom-ui/multi-select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";
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
import { AspectRatio } from "@/components/ui/aspect-ratio";

const postStatusOptions = ["DRAFT", "PUBLISHED", "TRASH"] as const;

interface PostCreateUpdateProps {
	post?: PostToEdit;
	categories: Category[];
	tags: Tag[];
}

export default function PostCreateUpdate({
	post,
	categories,
	tags,
}: PostCreateUpdateProps) {
	const [selectedImage, setSelectedImage] = useState<Image | null>(
		post?.image || null
	);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [isUpdateSubmitted, setIsUpdateSubmitted] = useState(false);
	const [isDeleteSubmitted, setIsDeleteSubmitted] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const router = useRouter();
	const { user } = useUser();

	const defaultAuthor = user
		? `${user.firstName || ""} ${user.lastName || ""}`.trim()
		: "";

	const form = useForm<PostFormValues>({
		resolver: zodResolver(postFormSchema),
		defaultValues: {
			id: post?.id,
			title: post?.title || "",
			subTitle: post?.subTitle || "",
			slug: post?.slug || "",
			excerpt: post?.excerpt || "",
			author: post?.id ? post.author ?? "" : defaultAuthor,
			publishedAt: post?.publishedAt || new Date(),
			jsonContent: post?.jsonContent || "",
			categoryId: post?.categoryId ?? null,
			imageId: post?.imageId ?? null,
			postStatus: post?.postStatus || "DRAFT",
			tagIds: post?.PostTag.map((pt) => pt.tag.id) || [],
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

	const onSubmit = async (data: PostFormValues) => {
		try {
			const action = post?.id ? updatePost : createPost;
			await action(data);
			setIsUpdateSubmitted(true);
			toast.success(post?.id ? "Post updated" : "Post created");
			router.push("/admin/posts");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An error occurred"
			);
		}
	};

	const handleDelete = async (postId: string) => {
		try {
			await deletePost(postId);
            setIsDeleteSubmitted(true);
			toast.success("Post deleted");
			router.push("/admin/posts");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Error deleting post"
			);
            setIsDeleteSubmitted(false);
		} finally {
            setIsDeleting(false);
        }
	};

	return (
		<div className="">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-6"
				>
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">
							{post?.id ? "Edit Post" : "Create Post"}
						</h1>
						<div className="flex items-center justify-end gap-3">
							<Button asChild variant="ghost">
								<Link href="/admin/posts">Back</Link>
							</Button>
							<LoadingButton
								type="submit"
								isLoading={isSubmitting}
								isLoadingText={
									post?.id ? "Updating..." : "Creating..."
								}
								isSubmitted={isUpdateSubmitted}
								isSubmittedText={
									post?.id ? "Updated" : "Created"
								}
							>
								{post?.id ? "Update" : "Create"}
							</LoadingButton>
							{post?.id && (
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
													handleDelete(post.id!);
													setIsDeleting(true);
												}}
											>
												Delete Post
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
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
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												placeholder="Post title"
												{...field}
												onChange={(e) => {
													field.onChange(e);
													if (!post?.id) {
														const newSlug =
															generateSlug(
																e.target.value
															);
														setValue(
															"slug",
															newSlug,
															{
																shouldValidate:
																	true,
															}
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
											<Input
												placeholder="post-slug"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="subTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Subtitle</FormLabel>
										<FormControl>
											<Input
												placeholder="Subtitle"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="excerpt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Excerpt</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Post excerpt"
												value={field.value ?? ""}
												onChange={(e) =>
													field.onChange(
														e.target.value
													)
												}
												className="min-h-32"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="jsonContent"
								render={({ field }) => {
									console.log(
										"Initial content:",
										field.value
									);
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
												<RichTextEditor
													content={field.value}
													onChange={field.onChange}
												/>
											</div>
											{errors.jsonContent && (
												<p className="text-sm text-destructive">
													{
														errors.jsonContent
															.message as string
													}
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
								name="author"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Author</FormLabel>
										<FormControl>
											<Input
												placeholder="Author"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="publishedAt"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground"
														)}
													>
														{field.value ? (
															format(
																field.value,
																"PPP"
															)
														) : (
															<span>
																Pick a date
															</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() ||
														date <
															new Date(
																"1900-01-01"
															)
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="categoryId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<FormControl>
											<Select
												onValueChange={(value) =>
													field.onChange(
														value === "none"
															? null
															: value
													)
												}
												value={field.value ?? "none"}
											>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">
														&nbsp;
													</SelectItem>
													{categories.map(
														(category) => (
															<SelectItem
																key={
																	category.id
																}
																value={
																	category.id
																}
															>
																{category.name}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="tagIds"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tags</FormLabel>
										<FormControl>
											<MultiSelect
												options={tags.map((tag) => ({
													value: tag.id,
													label: tag.name,
												}))}
												selected={field.value}
												onChange={(newTagIds) =>
													field.onChange(newTagIds)
												}
												placeholder="Select tags..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="imageId"
								render={() => (
									<FormItem>
										<FormLabel>Image</FormLabel>
										<FormControl>
											<Dialog
												open={isImageModalOpen}
												onOpenChange={
													setIsImageModalOpen
												}
											>
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
													onSelectImage={(image) =>
														handleSelectImage(image)
													}
													selectedImageId={
														selectedImage?.id
													}
												/>
											</Dialog>
										</FormControl>
										{selectedImage && (
											<button
												type="button"
												className="text-sm text-destructive mt-2"
												onClick={() =>
													handleSelectImage(null)
												}
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
								name="postStatus"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Post Status</FormLabel>
										<FormControl>
											<Select
												onValueChange={(value) =>
													field.onChange(value)
												}
												value={field.value}
											>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{postStatusOptions.map(
														(
															postStatusOption,
															index
														) => (
															<SelectItem
																key={index}
																value={
																	postStatusOption
																}
															>
																{formatEnumLabel(
																	postStatusOption
																)}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										</FormControl>
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
