import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, request }) => {
	const { user } = await parent();

	return {
		emailVerified: user.emailVerified,
		sessions: await auth.api.listSessions({
			headers: request.headers
		})
	};
};

export const actions: Actions = {
	resendVerification: async (event) => {
		const { user } = requireAuthenticated(event);

		try {
			await auth.api.sendVerificationEmail({
				body: {
					email: user.email,
					callbackURL: `${env.BETTER_AUTH_URL}/dashboard`
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to resend the verification email.')
			});
		}

		return {
			success: true,
			message: 'Verification email sent.'
		};
	},
	sendReset: async (event) => {
		const { user } = requireAuthenticated(event);

		try {
			await auth.api.requestPasswordReset({
				body: {
					email: user.email,
					redirectTo: `${env.BETTER_AUTH_URL}/reset-password`
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to send the password reset email.')
			});
		}

		return {
			success: true,
			message: 'Password reset email sent.'
		};
	}
};
