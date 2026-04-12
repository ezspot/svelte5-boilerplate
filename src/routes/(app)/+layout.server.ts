import type { LayoutServerLoad } from './$types';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import { logError } from '$lib/server/core/errors';

export const load: LayoutServerLoad = async (event) => {
	try {
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
	} catch (err) {
		logError(err, 'App layout load failed');
		throw err;
	}
};
