import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth/permissions';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import { getInvitationByToken } from '$lib/server/features/organization/service';
import type { Actions, PageServerLoad } from './$types';

const registerSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
	email: z.email('Use a valid email address.'),
	invite: z.string().optional()
});

function buildCallbackURL(invite?: string | null) {
	if (invite) {
		return `${env.BETTER_AUTH_URL}/complete?invite=${encodeURIComponent(invite)}`;
	}

	return `${env.BETTER_AUTH_URL}/dashboard`;
}

export const load: PageServerLoad = async (event) => {
	redirectIfAuthenticated(event);

	const inviteToken = event.url.searchParams.get('invite');
	const invitation = inviteToken ? await getInvitationByToken(inviteToken) : null;

	return {
		inviteToken,
		invitation: invitation
			? {
					email: invitation.email,
					role: invitation.role,
					organizationName: invitation.organization.name
				}
			: null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			name: String(formData.get('name') ?? ''),
			email: String(formData.get('email') ?? ''),
			invite: String(formData.get('invite') ?? '')
		};

		const parsed = registerSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Unable to create the account.',
				values
			});
		}

		try {
			await auth.api.signInMagicLink({
				body: {
					name: parsed.data.name,
					email: parsed.data.email,
					callbackURL: buildCallbackURL(parsed.data.invite),
					newUserCallbackURL: buildCallbackURL(parsed.data.invite),
					metadata: {
						intent: 'signup',
						name: parsed.data.name
					}
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to create the account.'),
				values
			});
		}

		redirect(
			303,
			`/verify-email?flow=magic-link&intent=signup&email=${encodeURIComponent(parsed.data.email)}&name=${encodeURIComponent(parsed.data.name)}${parsed.data.invite ? `&invite=${encodeURIComponent(parsed.data.invite)}` : ''}`
		);
	}
};
