import AuthModal from "@/components/auth/auth-modal";
import { getSiteSettingsForApp } from "../_actions/app-actions";
import { getCategoriesForNavigation } from "./_actions/main-actions";
import Footer from "./_components/footer";
import Navigation from "./_components/navigation";
import CookieConsent from "@/components/cookie-consent/cookie-consent";
import Analytics from "@/components/cookie-consent/analytics";
import { Suspense } from "react";

export async function generateMetadata() {
	const siteSettings = await getSiteSettingsForApp();

	return {
		title: siteSettings?.siteName || "",
		description: siteSettings?.siteDescription || "",
		icons: {
			icon: siteSettings?.siteSettingImageUrl || null,
		},
	};
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const siteSettings = await getSiteSettingsForApp();
	const categories = await getCategoriesForNavigation();

	return (
		<div className="flex flex-col min-h-screen">
			<Navigation siteSettings={siteSettings!} categories={categories} />
			<div className="container mx-auto xl:max-w-5xl px-4 py-8 flex-1">{children}</div>
			<Footer siteName={siteSettings!.siteName} />
			<Suspense><AuthModal /></Suspense>
			<CookieConsent siteSettings={siteSettings} />
			<Analytics siteSettings={siteSettings} />
		</div>
	);
}
