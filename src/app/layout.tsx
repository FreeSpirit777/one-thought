import { Lato } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import AuthModal from "@/components/auth/auth-modal";
import CookieConsent from "../components/cookie-consent/cookie-consent";
import Analytics from "../components/cookie-consent/analytics";
import { getSiteSettingsForApp } from "./_actions/app-actions";


const lato = Lato({
	//variable: "--font-lato",
	subsets: ["latin"],
	weight: ["400", "700", "900"],
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

    const siteSettings = await getSiteSettingsForApp();


    const clerkAppearance = {
		elements: {
			cardBox: { boxShadow: "none", maxHeight: "90vh", },
			formButtonPrimary: {
				backgroundColor: "var(--primary)",
				color: "var(--primary-foreground)",
				"&:hover": { backgroundColor: "var(--primary-hover)" },
			},
			button: { boxShadow: "none !important" },
            userButtonPopoverFooter: {
                display: "none",
            },
            userButtonPopoverCard: {
                fontFamily: "Lato",
            },
            userButtonPopoverActionButton: {
                font: "Lato",
                fontSize: "14px",
                fontWeight: "400",
                color: "#919191", // text-muted-foreground
                "&:hover": {
                    color: "#000",
                },
            },
            modalBackdrop: {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            
		},
	};


	return (
		<ClerkProvider appearance={clerkAppearance}>
			<html lang="en">
				<body
					className={`${lato.className} antialiased`}>
					{children}
					<AuthModal />
					<CookieConsent siteSettings={siteSettings} />
                    <Analytics siteSettings={siteSettings} />
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	);
}
