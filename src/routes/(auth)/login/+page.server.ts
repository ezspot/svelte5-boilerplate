import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth/permissions';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

const loginSchema = z.object({
	email: z.email('Use a valid email address.'),
	password: z.string().min(8, 'Password must be at least 8 characters.'),
	next: z.string().optional()
});

function safeRedirect(target: string | null | undefined) {
	if (target && target.startsWith('/') && !target.startsWith('//')) {
		return target;
	}

	return '/dashboard';
}

export const load: PageServerLoad = async (event) => {
	redirectIfAuthenticated(event);

	return {
		next: safeRedirect(event.url.searchParams.get('next')),
		notice:
			event.url.searchParams.get('reset') === 'success'
				? 'Your password has been reset. Sign in with the new password.'
				: null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			password: String(formData.get('password') ?? ''),
			next: safeRedirect(String(formData.get('next') ?? ''))
		};

		const parsed = loginSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid credentials.',
				values
			});
		}

		try {
			await auth.api.signInEmail({
				body: {
					email: parsed.data.email,
					password: parsed.data.password,
					rememberMe: true
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to sign in.'),
				values
			});
		}

		redirect(303, safeRedirect(parsed.data.next));
	},
	logout: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});

		redirect(303, '/login');
	}
};
