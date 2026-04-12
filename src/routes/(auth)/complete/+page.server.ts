import { redirect } from '@sveltejs/kit';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { acceptInvitationForUser } from '$lib/server/features/organization/service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = requireAuthenticated(event);
	const invite = event.url.searchParams.get('invite');

	if (invite) {
		await acceptInvitationForUser({
			token: invite,
			userId: user.id,
			email: user.email,
			ipAddress: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent')
		});
	}

	redirect(303, '/dashboard');
};
