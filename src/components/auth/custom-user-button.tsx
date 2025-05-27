"use client";

import { UserProfile, useUser } from "@clerk/clerk-react";
import { UserButton } from "@clerk/nextjs";
import { ShieldUser, Ticket } from "lucide-react";
import CustomUserPage from "./custom-user-page";

export default function CutomUserButton() {

    const { user } = useUser();
	const role = user?.publicMetadata?.role;

	return (
		<>
			<UserButton>
				<UserProfile.Page label="account" />
				<UserProfile.Page label="security" />
				<UserProfile.Page
					url="membership"
					label="Membership"
					labelIcon={<Ticket className="h-5 w-5" />}
				>
					<CustomUserPage />
				</UserProfile.Page>
				<UserButton.MenuItems>
					{(role === "OWNER" || role === "SCOUT") && (
						<UserButton.Link
							label="Admin"
							labelIcon={<ShieldUser className="h-5 w-5" />}
							href="/admin"
						/>
					)}
				</UserButton.MenuItems>
			</UserButton>
		</>
	);
}
