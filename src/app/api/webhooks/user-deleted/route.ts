import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { deleteUser } from "@/app/(admin)/admin/_actions/users-actions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const secret = process.env.CLERK_USER_DELETE_SIGNING_SECRET;
	if (!secret) {
		console.error("Missing CLERK_USER_DELETE_SIGNING_SECRET");
		return new NextResponse("Server configuration error", { status: 500 });
	}

	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new NextResponse("Error: Missing Svix headers", { status: 400 });
	}

	const payload = await req.json();
	const body = JSON.stringify(payload);

	const wh = new Webhook(secret);
	let evt: WebhookEvent;

	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Webhook verification failed:", err);
		return new NextResponse("Verification error", { status: 400 });
	}

	if (evt.type === "user.deleted") {
		const { id } = evt.data;

		if (!id) {
			return new NextResponse("No id", { status: 400 });
		}

		try {
			if (id) await deleteUser(id);
			console.log(`User deleted: ${id}`);
			return new NextResponse("User deleted", { status: 200 });
		} catch (error) {
			console.error("Error deleting user:", error);
			return new NextResponse("Error deleting user", { status: 500 });
		}
	}

	return new NextResponse("Unhandled event type", { status: 400 });
}
