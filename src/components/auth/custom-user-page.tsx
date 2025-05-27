"use client";

import { useUser } from "@clerk/clerk-react";
import { Separator } from "../ui/separator";


export default function CustomUserPage() {
	const { user } = useUser();


	const role = user?.publicMetadata?.role;


	return (
		<div className="p-0">
			<h1 className="text-base font-bold mb-4">Your Membership</h1>
            <Separator className="bg-gray-200 mb-4" />
			<p className="text-sm">
				User Role:&nbsp;&nbsp;<span className="font-semibold">{role as string}</span>
			</p>
		</div>
	);
}
