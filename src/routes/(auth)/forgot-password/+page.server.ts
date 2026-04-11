import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

const forgotPasswordSchema = z.object({
	email: z.email('Use a valid email address.')
});

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? '')
		};

		const parsed = forgotPasswordSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Enter a valid email address.',
				values
			});
		}

		try {
			await auth.api.requestPasswordReset({
				body: {
					email: parsed.data.email,
					redirectTo: `${env.BETTER_AUTH_URL}/reset-password`
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to send the reset link.'),
				values
			});
		}

		return {
			success: true,
			message: 'If the account exists, the password reset link is on its way.',
			values
		};
	}
};
