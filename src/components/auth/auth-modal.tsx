"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function AuthModal() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const modal = searchParams.get("modal");
	const isOpen = modal === "sign-in" || modal === "sign-up";

	const handleClose = () => {
		router.push("/");
	};

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="p-0 w-[400px] flex justify-center items-center">
				<DialogTitle className="sr-only" aria-hidden="true">
					{modal === "sign-in" ? "Sign In" : "Sign Up"}
				</DialogTitle>
				{modal === "sign-in" ? (
					<SignIn routing="virtual" signUpUrl="/?modal=sign-up" />
				) : (
					<SignUp routing="virtual" signInUrl="/?modal=sign-in" />
				)}
			</DialogContent>
		</Dialog>
	);
}
