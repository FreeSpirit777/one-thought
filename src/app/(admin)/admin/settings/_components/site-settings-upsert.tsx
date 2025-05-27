"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import {
	SiteSettingsToEdit,
	upsertSiteSettings,
} from "../_actions/settings-actions";
import {
	updateSiteSettingsFormSchema,
	UpdateSiteSettingsFormValues,
} from "@/lib/validation";
import { Image, Page } from "@prisma/client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import NextImage from "next/image";
import { ImageSelectionModal } from "../../_components/image-selection-modal";
import { ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SiteSettingsUpsertProps {
	siteSettings: SiteSettingsToEdit;
	pages: Page[];
}

export default function SiteSettingsUpsert({
	siteSettings,
	pages,
}: SiteSettingsUpsertProps) {
	const [selectedImage, setSelectedImage] = useState<Image | null>(
		siteSettings?.image || null
	);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(updateSiteSettingsFormSchema),
		defaultValues: {
			siteName: siteSettings?.siteName || "",
			siteDescription: siteSettings?.siteDescription || "",
			imageId: siteSettings?.imageId || null,
			isCookieConsentEnabled:
				siteSettings.isCookieConsentEnabled || false,
			cookieConsentPageId: siteSettings.cookieConsentPageId || "",
			googleAnalyticsId: siteSettings.googleAnalyticsId || "",
		},
	});

	const {
		setValue,
		formState: { isSubmitting },
	} = form;

	const handleSelectImage = (image: Image | null) => {
		setValue("imageId", image?.id ?? null, { shouldValidate: true });
		setSelectedImage(image);
	};

	const onSubmit = async (data: UpdateSiteSettingsFormValues) => {
		try {
			await upsertSiteSettings(data);
			toast.success("Settings updated");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An error occurred"
			);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Site Settings</h1>
				<div className="flex items-center justify-end gap-3">
					<LoadingButton
						isLoading={isSubmitting}
						isSubmitted={false}
						onClick={form.handleSubmit(onSubmit)}
					>
						Update
					</LoadingButton>
				</div>
			</div>

			<Separator className="mt-4 mb-6" />

			<Form {...form}>
				<form className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 w-full">
					{/* Left Column */}
					<div className="space-y-6 w-full md:max-w-md">
						<FormField
							control={form.control}
							name="siteName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Site Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter site name"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The name displayed across your website.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="siteDescription"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Site Description</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter site description"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										A very short description for your site.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="imageId"
							render={() => (
								<FormItem>
									<FormLabel>Site Logo</FormLabel>
									<FormControl>
										<div className="flex items-start gap-4">
											<div className="flex flex-col items-center">
												<Dialog
													open={isImageModalOpen}
													onOpenChange={
														setIsImageModalOpen
													}
												>
													<DialogTrigger asChild>
														<div className="relative w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
															{selectedImage ? (
																<NextImage
																	src={
																		selectedImage.imageUrl
																	}
																	alt={
																		selectedImage.alt ||
																		"Selected logo"
																	}
																	fill
																	className="object-cover rounded-md"
																/>
															) : (
																<span className="flex flex-col items-center text-gray-400">
																	<ImageIcon className="w-8 h-8" />
																	<p className="text-xs mt-1">
																		Select
																		logo
																	</p>
																</span>
															)}
														</div>
													</DialogTrigger>
													<ImageSelectionModal
														onSelectImage={(
															image
														) =>
															handleSelectImage(
																image
															)
														}
														selectedImageId={
															selectedImage?.id
														}
													/>
												</Dialog>
												{selectedImage && (
													<button
														type="button"
														className="text-xs text-red-600 hover:underline mt-2"
														onClick={() =>
															handleSelectImage(
																null
															)
														}
													>
														Remove Logo
													</button>
												)}
											</div>
											<FormDescription className="text-sm">
												Choose a square logo to represent your site.
											</FormDescription>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Separator orientation="vertical" className="h-auto" />

					{/* Right Column */}
					<div className="space-y-6 w-full md:max-w-md">
						<FormField
							control={form.control}
							name="isCookieConsentEnabled"
							render={({ field }) => (
								<div className="pt-3">
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											className="h-5 w-5"
										/>
									</FormControl>
									<div className="space-y-1">
										<FormLabel>
											Enable Cookie Consent
										</FormLabel>
										<FormDescription>
											Show a cookie consent popup to
											visitors.
										</FormDescription>
									</div>
									<FormMessage />
								</FormItem>
                                </div>
							)}
						/>

						<FormField
							control={form.control}
							name="cookieConsentPageId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cookie Consent Page</FormLabel>
									<FormControl>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a page" />
											</SelectTrigger>
											<SelectContent>
												{pages
													.filter(
														(page) =>
															page.isVisible ===
															true
													)
													.map((page) => (
														<SelectItem
															key={page.id}
															value={page.id}
														>
															{page.title}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormDescription>
										Select the page with your cookie policy.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="googleAnalyticsId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Google Analytics ID</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter your Google Analytics ID (e.g., G-XXXXXXXXXX)"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enable analytics tracking with your Google Analytics ID.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</>
	);
}
