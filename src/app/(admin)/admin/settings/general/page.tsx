import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getBlogSettings, getSiteSettings } from "../_actions/settings-actions";

import BlogSettingsUpsert from "../_components/blog-settings-upsert";
import SiteSettingsUpsert from "../_components/site-settings-upsert";
import { getPages } from "../pages/_actions/pages-actions";
import { Card, CardContent } from "@/components/ui/card";

export default async function Page() {
	const siteSettings = await getSiteSettings();
	const pages = await getPages();

	const blogSettings = await getBlogSettings();

	return (
		<div>
			<h1 className="text-2xl font-bold mb-4">General Settings</h1>
			<Tabs defaultValue="site-settings" className="w-full">
				<TabsList>
					<TabsTrigger value="site-settings">
						Site Settings
					</TabsTrigger>
					<TabsTrigger value="blog-settings">
						Blog Settings
					</TabsTrigger>
				</TabsList>
				<TabsContent value="site-settings" className="pt-3">
					<Card className="border rounded-none shadow-none">
						<CardContent className="space-y-2">
							<SiteSettingsUpsert
								siteSettings={siteSettings}
								pages={pages}
							/>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="blog-settings" className="pt-3">
					<Card className="border rounded-none shadow-none">
						<CardContent className="space-y-2">
							<BlogSettingsUpsert blogSettings={blogSettings} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
