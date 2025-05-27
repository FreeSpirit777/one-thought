"use server";

import db from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";

export async function createUser(clerkUserId: string, email: string) {
	const validClerkUserId = z.string().min(1, "clerkUserId cannot be empty").parse(clerkUserId);

	const existingUsers = await db.user.count();
	const role: UserRole = existingUsers === 0 ? UserRole.OWNER : UserRole.MEMBER;

	const createdUser = await db.user.create({
		data: {
			clerkUserId: validClerkUserId,
            email: email,
			role: role,
		},
	});

	const client = await clerkClient();

	await client.users.updateUserMetadata(clerkUserId, {
		publicMetadata: {
			role: createdUser.role,
		},
	});

	return createdUser;
}



export async function deleteUser(clerkUserId: string) {
	const validClerkUserId = z.string().min(1, "clerkUserId cannot be empty").parse(clerkUserId);

	
	const deletedUser = await db.user.delete({
		where: {
			clerkUserId: validClerkUserId,
		},
	});

	return deletedUser;
}
