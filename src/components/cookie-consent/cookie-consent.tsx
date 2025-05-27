"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SiteSettingsForApp } from "@/app/_actions/app-actions";

export default function CookieConsent({siteSettings}: {siteSettings: SiteSettingsForApp}) {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem("cookie-consent");
		if (!consent) {
			setIsOpen(true);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem("cookie-consent", "accepted");
		setIsOpen(false);
	};

	const handleDecline = () => {
		localStorage.setItem("cookie-consent", "declined");
		setIsOpen(false);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-md border bg-muted bg-opacity-70 p-4 shadow-xl sm:flex sm:items-center sm:justify-between animate-slide-in-up duration-500">
			<div className="flex gap-2 items-center">
				<p className="text-xs text-muted-foreground">
					We use cookies to improve your experience. Read our{" "}
					<Link
						href={`/pages/${siteSettings.cookieConsentPage.slug}`}
						className="underline hover:text-primary"
					>
						{siteSettings.cookieConsentPage.title}
					</Link>
					
				</p>
			</div>
			<div className="mt-3 flex gap-2 sm:mt-0 sm:ml-4">
				<Button
					size="sm"
					onClick={handleAccept}
					className="border border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200"
				>
					Accept
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={handleDecline}
					className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition duration-200"
				>
					Decline
				</Button>
			</div>
		</div>
	);
}
