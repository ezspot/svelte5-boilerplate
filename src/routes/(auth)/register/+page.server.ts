import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth/permissions';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import {
	acceptInvitationForUser,
	getInvitationByToken
} from '$lib/server/features/organization/service';
import type { Actions, PageServerLoad } from './$types';

const registerSchema = z
	.object({
		name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
		email: z.email('Use a valid email address.'),
		password: z.string().min(8, 'Password must be at least 8 characters.'),
		confirmPassword: z.string().min(8, 'Confirm your password.'),
		invite: z.string().optional()
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	});

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
			password: String(formData.get('password') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? ''),
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
			const result = await auth.api.signUpEmail({
				body: {
					name: parsed.data.name,
					email: parsed.data.email,
					password: parsed.data.password,
					callbackURL: `${env.BETTER_AUTH_URL}/dashboard`
				},
				headers: event.request.headers
			});

			if (parsed.data.invite && result.user) {
				await acceptInvitationForUser({
					token: parsed.data.invite,
					userId: result.user.id,
					email: parsed.data.email,
					ipAddress: event.getClientAddress(),
					userAgent: event.request.headers.get('user-agent')
				});
			}
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to create the account.'),
				values
			});
		}

		redirect(303, `/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
	}
};
