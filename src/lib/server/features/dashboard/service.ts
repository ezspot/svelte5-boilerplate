import { prisma } from '$lib/server/db/client';

export async function getDashboardData(userId: string, organizationId: string) {
	const [membershipCount, pendingInvitationCount, recentEvents] = await Promise.all([
		prisma.membership.count({
			where: { organizationId }
		}),
		prisma.invitation.count({
			where: {
				organizationId,
				status: 'PENDING',
				expiresAt: {
					gt: new Date()
				}
			}
		}),
		prisma.auditEvent.findMany({
			where: { organizationId },
			orderBy: { createdAt: 'desc' },
			take: 6
		})
	]);

	const memberships = await prisma.membership.findMany({
		where: { userId },
		select: { organizationId: true }
	});

	return {
		stats: [
			{
				label: 'Team members',
				value: membershipCount.toString(),
				description: 'Active workspace memberships'
			},
			{
				label: 'Pending invites',
				value: pendingInvitationCount.toString(),
				description: 'Outstanding invitations awaiting a response'
			},
			{
				label: 'Workspaces',
				value: memberships.length.toString(),
				description: 'Organizations connected to this account'
			}
		],
		recentEvents
	};
}
