import { PrismaClient } from "@prisma/client";
import { siteSettingsSeedData, blogSettingsSeedData, pagesSeedData } from "../lib/seedData";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
	try {
		console.log("Start seeding...");

		// Seed Pages
		for (const page of pagesSeedData) {
			await prisma.page.upsert({
				where: { id: page.id },
				update: page,
				create: page,
			});
		}
		console.log("Pages seeded successfully");

		// Seed BlogSettings
		for (const blogSetting of blogSettingsSeedData) {
			await prisma.blogSettings.upsert({
				where: { id: blogSetting.id },
				update: blogSetting,
				create: blogSetting,
			});
		}
		console.log("BlogSettings seeded successfully");

		// Seed SiteSettings
		for (const siteSetting of siteSettingsSeedData) {
			await prisma.siteSettings.upsert({
				where: { id: siteSetting.id },
				update: siteSetting,
				create: siteSetting,
			});
		}
		console.log("SiteSettings seeded successfully");

		console.log("Seeding completed!");
	} catch (error) {
		console.error("Error during seeding:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

(async () => {
    await seed();
})();
