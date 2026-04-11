import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

const resetSchema = z
	.object({
		token: z.string().min(1, 'Reset token is missing.'),
		password: z.string().min(8, 'Password must be at least 8 characters.'),
		confirmPassword: z.string().min(8, 'Confirm your password.')
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ url }) => {
	return {
		token: url.searchParams.get('token'),
		error:
			url.searchParams.get('error') === 'INVALID_TOKEN'
				? 'That reset link has expired or is invalid.'
				: null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			token: String(formData.get('token') ?? ''),
			password: String(formData.get('password') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? '')
		};

		const parsed = resetSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Unable to reset the password.',
				values
			});
		}

		try {
			await auth.api.resetPassword({
				body: {
					newPassword: parsed.data.password,
					token: parsed.data.token
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to reset the password.'),
				values
			});
		}

		redirect(303, '/login?reset=success');
	}
};
