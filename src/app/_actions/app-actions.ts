"use server"

import db from "@/lib/prisma";

export type SiteSettingsForApp = {
	id: string;
	siteName: string;
	siteDescription: string;
	siteSettingImageUrl?: string;
    isCookieConsentEnabled: boolean;
	cookieConsentPage: {
		title?: string;
		slug?: string;
	};
	googleAnalyticsId?: string;
};

export async function getSiteSettingsForApp(): Promise<SiteSettingsForApp> {
	const siteSettings = await db.siteSettings.findUnique({
		where: { id: "site-settings" },
		select: {
			id: true,
			siteName: true,
			siteDescription: true,
			siteSettingImage: { select: { imageUrl: true } },
            isCookieConsentEnabled: true,
			cookieConsentPage: { select: { title: true, slug: true } },
			googleAnalyticsId: true,
		},
	});

	if (!siteSettings) {
		throw new Error(
			"SiteSettings not found. Please initialize site settings in the database."
		);
	}

	return {
		id: siteSettings.id,
		siteName: siteSettings.siteName,
		siteDescription: siteSettings.siteDescription,
		siteSettingImageUrl: siteSettings.siteSettingImage?.imageUrl,
        isCookieConsentEnabled: siteSettings.isCookieConsentEnabled,
		cookieConsentPage: {
			title: siteSettings.cookieConsentPage?.title,
			slug: siteSettings.cookieConsentPage?.slug,
		},
		googleAnalyticsId: siteSettings.googleAnalyticsId || undefined,
	};
}