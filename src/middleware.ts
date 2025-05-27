import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// Define the structure of public_metadata
interface PublicMetadata {
	role?: UserRole;
}

// Define public routes
const isPublicRoute = createRouteMatcher([
	"/",
	"/:postSlug",
	"/categories/:categorySlug",
	"/tags/:tagSlug",
	"/contact",
	"/pages(.*)",
	"/api/webhooks(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
	// Protect non public routes
	if (!isPublicRoute(request)) {
		await auth.protect();
	}

	// Get sessionClaims und extract public_metadata
	const { sessionClaims } = await auth();

	const publicMetadata = sessionClaims?.public_metadata as PublicMetadata;

	// Validate userRole
	const validRoles = ["OWNER", "SCOUT", "MEMBER"];
	const userRole = publicMetadata?.role && validRoles.includes(publicMetadata.role) ? publicMetadata.role : "MEMBER";


	// Admin access control
	if (isAdminRoute(request) && !["OWNER", "SCOUT"].includes(userRole)) {
		const url = new URL("/", request.url);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
