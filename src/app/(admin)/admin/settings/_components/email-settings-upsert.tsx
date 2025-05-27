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
import { upsertEmailSettings } from "../_actions/settings-actions";
import {
	updateEmailSettingsFormSchema,
	UpdateEmailSettingsFormValues,
} from "@/lib/validation";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailSettings } from "@prisma/client";

interface EmailSettingsUpsertProps {
	emailSettings: EmailSettings | null;
}

export default function EmailSettingsUpsert({
	emailSettings,
}: EmailSettingsUpsertProps) {
	const form = useForm({
		resolver: zodResolver(updateEmailSettingsFormSchema),
		defaultValues: {
			emailHostSmtp: emailSettings?.emailHostSmtp || "",
			emailPortSmtp: emailSettings?.emailPortSmtp || "",
			isEmailSecureSmtp: emailSettings?.isEmailSecureSmtp || false,
			emailUser: emailSettings?.emailUser || "",
			emailPass: "",
		},
	});

	const { isSubmitting } = form.formState;

	const onSubmit = async (data: UpdateEmailSettingsFormValues) => {
		try {
			await upsertEmailSettings(data);
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
				<h1 className="text-2xl font-bold mb-4">Email Settings</h1>
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
						name="emailHostSmtp"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SMTP Host</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter SMTP host"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									The hostname of the SMTP server for sending
									emails.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="emailPortSmtp"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SMTP Port</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter SMTP port"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									The port number used by the SMTP server
									(e.g., 587 for TLS).
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isEmailSecureSmtp"
						render={({ field }) => (
							<div className="pt-3">
								<FormItem>
									<FormLabel>Secure SMTP</FormLabel>
									<div className="flex gap-2">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className="h-5 w-5"
											/>
										</FormControl>

										<FormDescription>
											Enable secure connection (SSL/TLS)
											for the SMTP server.
										</FormDescription>
									</div>

									<FormMessage />
								</FormItem>
							</div>
						)}
					/>

					<FormField
						control={form.control}
						name="emailUser"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SMTP Username</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter SMTP username"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									The username for authenticating with the
									SMTP server.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="emailPass"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SMTP Password</FormLabel>
								<FormControl>
									<Input
										placeholder={
											emailSettings?.emailPass
												? "••••••••"
												: "Enter SMTP password"
										}
										type="password"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									{emailSettings?.emailPass
										? "Enter a new password to update the existing one, or leave blank to keep it unchanged."
										: "The password for authenticating with the SMTP server."}
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
