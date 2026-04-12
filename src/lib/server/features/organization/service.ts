import { randomUUID } from 'node:crypto';
import type { MembershipRole } from '../../../../../generated/prisma/client';
import { prisma } from '$lib/server/db/client';
import { sendOrganizationInviteEmail } from '$lib/server/email/resend';
import { AppError } from '$lib/server/core/errors';
import { allowsTeamInvites } from '$lib/server/features/billing/plans';
import type { InvitationInput, OrganizationNameInput } from './schema';

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 48);
}

async function createUniqueSlug(name: string) {
	const base = slugify(name) || 'workspace';

	for (let index = 0; index < 10; index += 1) {
		const slug = index === 0 ? base : `${base}-${index + 1}`;
		const existing = await prisma.organization.findUnique({
			where: { slug },
			select: { id: true }
		});

		if (!existing) {
			return slug;
		}
	}

	return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function ensurePersonalOrganization(user: {
	id: string;
	name: string;
	email: string;
}) {
	const existingUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: {
			currentOrganizationId: true
		}
	});

	if (!existingUser) {
		throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
	}

	if (!existingUser.currentOrganizationId) {
		await prisma.$transaction(async (tx) => {
			const organization = await tx.organization.create({
				data: {
					name: `${user.name.split(' ')[0]}'s workspace`,
					slug: await createUniqueSlug(user.name),
					ownerId: user.id,
					billingEmail: user.email
				}
			});

			await tx.membership.create({
				data: {
					organizationId: organization.id,
					userId: user.id,
					role: 'OWNER'
				}
			});

			await tx.user.update({
				where: { id: user.id },
				data: {
					currentOrganizationId: organization.id
				}
			});

			await tx.auditEvent.create({
				data: {
					organizationId: organization.id,
					actorUserId: user.id,
					type: 'organization.created',
					targetType: 'organization',
					targetId: organization.id,
					payload: {
						source: 'baseline-provisioning'
					}
				}
			});
		});
	}

	const refreshedUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: {
			currentOrganizationId: true
		}
	});

	const membership = await prisma.membership.findFirst({
		where: {
			userId: user.id,
			organizationId: refreshedUser?.currentOrganizationId ?? undefined
		},
		include: {
			organization: true
		}
	});

	if (membership) {
		return membership;
	}

	const fallbackMembership = await prisma.membership.findFirst({
		where: { userId: user.id },
		include: { organization: true },
		orderBy: { createdAt: 'asc' }
	});

	if (!fallbackMembership) {
		throw new AppError('No workspace membership found for this account.', 404, 'ORG_NOT_FOUND');
	}

	if (fallbackMembership.organizationId !== refreshedUser?.currentOrganizationId) {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				currentOrganizationId: fallbackMembership.organizationId
			}
		});
	}

	return fallbackMembership;
}

export async function getOrganizationSettings(organizationId: string) {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		include: {
			memberships: {
				orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true
						}
					}
				}
			},
			invitations: {
				orderBy: { createdAt: 'desc' }
			}
		}
	});

	if (!organization) {
		throw new AppError('Workspace not found.', 404, 'ORG_NOT_FOUND');
	}

	return organization;
}

export async function getInvitationByToken(token: string) {
	return prisma.invitation.findFirst({
		where: {
			token,
			status: 'PENDING',
			expiresAt: {
				gt: new Date()
			}
		},
		include: {
			organization: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});
}

export async function updateOrganizationName({
	organizationId,
	actorUserId,
	input,
	ipAddress,
	userAgent
}: {
	organizationId: string;
	actorUserId: string;
	input: OrganizationNameInput;
	ipAddress: string | null;
	userAgent: string | null;
}) {
	const organization = await prisma.organization.update({
		where: { id: organizationId },
		data: { name: input.name.trim() }
	});

	await prisma.auditEvent.create({
		data: {
			organizationId,
			actorUserId,
			type: 'organization.updated',
			targetType: 'organization',
			targetId: organizationId,
			ipAddress,
			userAgent,
			payload: {
				field: 'name'
			}
		}
	});

	return organization;
}

export async function inviteMember({
	organizationId,
	actorUserId,
	actorName,
	input,
	appUrl,
	ipAddress,
	userAgent
}: {
	organizationId: string;
	actorUserId: string;
	actorName: string;
	input: InvitationInput;
	appUrl: string;
	ipAddress: string | null;
	userAgent: string | null;
}) {
	const existingMembership = await prisma.membership.findFirst({
		where: {
			organizationId,
			user: {
				email: input.email
			}
		},
		select: { id: true }
	});

	if (existingMembership) {
		throw new AppError('That user is already a member of this workspace.', 409, 'MEMBER_EXISTS');
	}

	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			name: true,
			planKey: true
		}
	});

	if (!organization) {
		throw new AppError('Workspace not found.', 404, 'ORG_NOT_FOUND');
	}

	if (!allowsTeamInvites(organization.planKey)) {
		throw new AppError(
			'Team invitations are available on paid plans. Upgrade billing to invite teammates.',
			403,
			'PLAN_UPGRADE_REQUIRED'
		);
	}

	const token = randomUUID();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

	const invitation = await prisma.invitation.upsert({
		where: {
			organizationId_email: {
				organizationId,
				email: input.email
			}
		},
		update: {
			role: input.role as MembershipRole,
			token,
			status: 'PENDING',
			expiresAt,
			lastSentAt: new Date(),
			invitedByUserId: actorUserId
		},
		create: {
			organizationId,
			email: input.email,
			role: input.role as MembershipRole,
			token,
			status: 'PENDING',
			expiresAt,
			lastSentAt: new Date(),
			invitedByUserId: actorUserId
		}
	});

	await sendOrganizationInviteEmail({
		to: input.email,
		inviterName: actorName,
		organizationName: organization.name,
		url: `${appUrl}/register?invite=${token}`,
		token
	});

	await prisma.auditEvent.create({
		data: {
			organizationId,
			actorUserId,
			type: 'organization.invitation.sent',
			targetType: 'invitation',
			targetId: invitation.id,
			ipAddress,
			userAgent,
			payload: {
				email: input.email,
				role: input.role
			}
		}
	});

	return invitation;
}

export async function acceptInvitationForUser({
	token,
	userId,
	email,
	ipAddress,
	userAgent
}: {
	token: string;
	userId: string;
	email: string;
	ipAddress: string | null;
	userAgent: string | null;
}) {
	const invitation = await getInvitationByToken(token);

	if (!invitation) {
		return null;
	}

	if (invitation.email.toLowerCase() !== email.toLowerCase()) {
		throw new AppError(
			'The invitation email does not match this account.',
			400,
			'INVITE_EMAIL_MISMATCH'
		);
	}

	await prisma.$transaction(async (tx) => {
		await tx.membership.upsert({
			where: {
				organizationId_userId: {
					organizationId: invitation.organizationId,
					userId
				}
			},
			update: {
				role: invitation.role
			},
			create: {
				organizationId: invitation.organizationId,
				userId,
				role: invitation.role
			}
		});

		await tx.user.update({
			where: { id: userId },
			data: {
				currentOrganizationId: invitation.organizationId
			}
		});

		await tx.invitation.update({
			where: { id: invitation.id },
			data: {
				status: 'ACCEPTED'
			}
		});

		await tx.auditEvent.create({
			data: {
				organizationId: invitation.organizationId,
				actorUserId: userId,
				type: 'organization.invitation.accepted',
				targetType: 'invitation',
				targetId: invitation.id,
				ipAddress,
				userAgent,
				payload: {
					email
				}
			}
		});
	});

	return invitation;
}
