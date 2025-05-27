"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { ComponentProps } from "react";
import { Button } from "../ui/button";

interface LoadingButtonProps extends ComponentProps<typeof Button> {
	isSubmitted: boolean;
	isLoading: boolean;
	isLoadingText?: string;
	isSubmittedText?: string;
	children: React.ReactNode;
}

export function LoadingButton({
	isLoading,
	isSubmitted,
	isLoadingText = "Saving...",
	isSubmittedText = "Saved",
	children,
	className,
	variant,
	size,
	asChild,
	...props
}: LoadingButtonProps) {
	return (
		<Button
			type="submit"
			disabled={isLoading || isSubmitted}
			className={cn(className)}
			variant={variant}
			size={size}
			asChild={asChild}
			{...props}
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{isLoadingText}
				</>
			) : isSubmitted ? (
				isSubmittedText
			) : (
				children
			)}
		</Button>
	);
}
