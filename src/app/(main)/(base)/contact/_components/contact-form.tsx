"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { VariantProps } from "class-variance-authority";
import { LoadingButton } from "@/components/custom-ui/loading-button";
import { contactFormSchema, ContactFormValues } from "@/lib/validation";

type AlertVariant = VariantProps<typeof Alert>["variant"];

export default function ContactForm() {
	const [alert, setAlert] = useState<{
		status: string;
		variant: AlertVariant;
	} | null>(null);
	const [visible, setVisible] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
		mode: "onChange",
	});

	// Auto-Hide for status messages
	useEffect(() => {
		if (!alert) return;

		setVisible(true);
		const timer = setTimeout(() => {
			setVisible(false);
			setTimeout(() => setAlert(null), 300);
		}, 5000);

		return () => clearTimeout(timer);
	}, [alert]);

	const onSubmit = async (data: ContactFormValues) => {
		setAlert({ status: "Sending...", variant: "warning" });

		try {
			const res = await fetch("/api/send-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const resData = await res.json();

			if (!res.ok) {
				setAlert({
					status: resData.error,
					variant: "error",
				});
			} else {
				setAlert({
					status: resData.message,
					variant: "success",
				});
				reset();
			}
		} catch {
			setAlert({
				status: "Error sending the email",
				variant: "error",
			});
		}

		return;
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col gap-4 max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 items-center justify-center">Contact</h1>
				<div>
					<Label className="py-2" htmlFor="name">Name</Label>
					<Input id="name" {...register("name")} />
					{errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
				</div>

				<div>
					<Label className="py-2" htmlFor="email">Email</Label>
					<Input id="email" {...register("email")} />
					{errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
				</div>

				<div>
					<Label className="py-2" htmlFor="message">Message</Label>
					<Textarea id="message" {...register("message")} />
					{errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
				</div>
				<LoadingButton
					isLoading={isSubmitting}
					isLoadingText="Sending"
					isSubmitted={alert?.variant === "success"}
					isSubmittedText="Sent"
					className="w-full"
				>
					Send
				</LoadingButton>

				<div className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"} pt-6`}>
					{alert && (
						<Alert variant={alert.variant}>
							<AlertDescription>{alert.status}</AlertDescription>
						</Alert>
					)}
				</div>
			</div>
		</form>
	);
}
