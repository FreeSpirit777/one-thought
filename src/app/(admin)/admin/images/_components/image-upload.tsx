"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { imageUploadFormSchema, ImageUploadFormValues } from "@/lib/validation";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadImage } from "../_actions/images-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import { ImageIcon } from "lucide-react";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ImageUpload() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm<ImageUploadFormValues>({
		resolver: zodResolver(imageUploadFormSchema),
		defaultValues: { image: undefined },
	});

	const { isSubmitting } = form.formState;
	const imageFile = form.watch("image");

	// Handle file selection and create a preview URL for the selected image
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			form.setValue("image", file);
			setPreview(URL.createObjectURL(file)); // Create a temporary URL for the selected file to display a preview
		}
	};

	// Reset the form field, clear the preview URL, and reset the file input
	const handleRemove = () => {
		form.resetField("image");
		if (preview) URL.revokeObjectURL(preview); // Revoke the temporary URL to free memory
		setPreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const onSubmit = async (data: ImageUploadFormValues) => {
		try {
			await uploadImage(data.image!);
			setIsSubmitted(true);
			toast.success("Image uploaded");
			router.push("/admin/images");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		}
	};

	// Cleanup the preview URL when the component unmounts or preview changes
	useEffect(() => {
		return () => {
			// Revoke the temporary URL to prevent memory leaks when the component is unmounted or preview is updated
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Upload Image</h1>
					<div className="flex items-center justify-end gap-3">
						<Button asChild variant="ghost">
							<Link href="/admin/images">Back</Link>
						</Button>
						<LoadingButton
							isLoading={isSubmitting}
							isSubmitted={isSubmitted}
							isLoadingText="Uploading..."
							isSubmittedText="Uploaded"
						>
							Upload
						</LoadingButton>
					</div>
				</div>

				<Separator />

				<FormField
					control={form.control}
					name="image"
					render={({ field: { value, ...fieldValues } }) => (
						<FormItem>
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex w-1/2 h-full items-center justify-center rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
							>
								<AspectRatio ratio={16 / 9} className="">
									{preview ? (
										<img
											src={preview}
											alt="Preview"
											className="object-cover w-full h-full rounded-lg"
										/>
									) : (
										<div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
											<ImageIcon className="w-12 h-12" />
											<p className="text-sm">Click to select an image</p>
										</div>
									)}
								</AspectRatio>
							</div>

							<div className="flex items-center gap-1 text-sm text-gray-500">
								{imageFile && <p>Selected File:</p>}

								<FormControl>
									<Input
										{...fieldValues}
										type="file"
										accept="image/*"
										ref={fileInputRef}
										className="hidden"
										onChange={handleFileChange}
									/>
								</FormControl>

								{imageFile && (
									<>
										<p className="">{(imageFile as File).name}</p>
										<button
											type="button"
											className="pl-2 text-sm text-destructive hover:underline"
											onClick={handleRemove}
										>
											Remove
										</button>
									</>
								)}
							</div>

							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
