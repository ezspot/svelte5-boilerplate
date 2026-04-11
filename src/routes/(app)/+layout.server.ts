import type { LayoutServerLoad } from './$types';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';

export const load: LayoutServerLoad = async (event) => {
	const { user, session } = requireAuthenticated(event);
	const membership = await ensurePersonalOrganization({
		id: user.id,
		name: user.name,
		email: user.email
	});

	return {
		session,
		user,
		organization: membership.organization,
		membership: {
			id: membership.id,
			role: membership.role,
			createdAt: membership.createdAt
		}
	};
};
