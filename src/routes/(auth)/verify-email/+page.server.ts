import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

const resendSchema = z.object({
	email: z.email('Use a valid email address.')
});

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user?.emailVerified) {
		redirect(303, '/dashboard');
	}

	return {
		email: url.searchParams.get('email') ?? locals.user?.email ?? ''
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? '')
		};

		const parsed = resendSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Use a valid email address.',
				values
			});
		}

		try {
			await auth.api.sendVerificationEmail({
				body: {
					email: parsed.data.email,
					callbackURL: `${env.BETTER_AUTH_URL}/dashboard`
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to resend the verification email.'),
				values
			});
		}

		return {
			success: true,
			message: 'A fresh verification email has been sent.',
			values
		};
	}
};
