import { prisma } from '$lib/server/db/client';
import { AppError } from '$lib/server/core/errors';
import type { ProfileInput } from './schema';

export async function updateProfile({
	userId,
	input,
	ipAddress,
	userAgent
}: {
	userId: string;
	input: ProfileInput;
	ipAddress: string | null;
	userAgent: string | null;
}) {
	const name = input.name.trim();
	const image = input.image?.trim() ? input.image.trim() : null;

	const user = await prisma.user.update({
		where: { id: userId },
		data: {
			name,
			image
		}
	});

	await prisma.auditEvent.create({
		data: {
			actorUserId: userId,
			type: 'account.profile.updated',
			targetType: 'user',
			targetId: userId,
			ipAddress,
			userAgent,
			payload: {
				nameChanged: true,
				imageChanged: true
			}
		}
	});

	return user;
}

export async function getProfile(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			emailVerified: true,
			createdAt: true
		}
	});

	if (!user) {
		throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
	}

	return user;
}
