"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import { upsertBlogSettings } from "../_actions/settings-actions";
import {
	updateBlogSettingsFormSchema,
	UpdateBlogSettingsFormValues,
} from "@/lib/validation";
import { Separator } from "@/components/ui/separator";

interface BlogSettingsUpsertProps {
	blogSettings: UpdateBlogSettingsFormValues | null;
}

export default function BlogSettingsUpsert({
	blogSettings,
}: BlogSettingsUpsertProps) {
	const form = useForm({
		resolver: zodResolver(updateBlogSettingsFormSchema),
		defaultValues: {
			visiblePages: blogSettings?.visiblePages || 0,
			postsPerPage: blogSettings?.postsPerPage || 0,
		},
	});

	const { isSubmitting } = form.formState;

	const onSubmit = async (data: UpdateBlogSettingsFormValues) => {
		try {
			await upsertBlogSettings(data);
			toast.success("Settings updated");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An error occured"
			);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Blog Settings</h1>
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
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 w-full md:max-w-md"
				>
					<FormField
						control={form.control}
						name="postsPerPage"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Posts Per Page</FormLabel>
								<FormControl>
									<Input
										placeholder="Posts per page"
										{...field}
									/>
								</FormControl>
                                <FormDescription>
                                    Sets the number of blog posts displayed per page.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="visiblePages"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Visible Pages</FormLabel>
								<FormControl>
									<Input
										placeholder="Visible pages in pagination"
										{...field}
									/>
								</FormControl>
								<FormDescription>
                                    Determines how many page numbers are shown in the pagination component.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</>
	);
}
