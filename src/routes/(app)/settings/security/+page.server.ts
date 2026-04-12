import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, request }) => {
	const { user } = await parent();
	const accounts = await auth.api.listUserAccounts({
		headers: request.headers
	});

	return {
		emailVerified: user.emailVerified,
		hasPassword: accounts.some((account) => account.providerId === 'credential'),
		sessions: await auth.api.listSessions({
			headers: request.headers
		})
	};
};

const setPasswordSchema = z
	.object({
		newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
		confirmPassword: z.string().min(8, 'Confirm the password.')
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	});

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
	setPassword: async (event) => {
		const formData = await event.request.formData();
		const values = {
			newPassword: String(formData.get('newPassword') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? '')
		};

		const parsed = setPasswordSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Unable to set the password.'
			});
		}

		try {
			await auth.api.setPassword({
				body: {
					newPassword: parsed.data.newPassword
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to set the password.')
			});
		}

		return {
			success: true,
			message: 'Password added successfully.'
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
