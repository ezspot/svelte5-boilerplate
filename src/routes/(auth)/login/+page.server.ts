import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth/permissions';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import { prisma } from '$lib/server/db/client';
import type { Actions, PageServerLoad } from './$types';

const magicLinkSchema = z.object({
	email: z.email('Use a valid email address.'),
	next: z.string().optional(),
	invite: z.string().optional()
});

const passwordLoginSchema = z.object({
	email: z.email('Use a valid email address.'),
	password: z.string().min(8, 'Password must be at least 8 characters.'),
	next: z.string().optional(),
	invite: z.string().optional()
});

function safeRedirect(target: string | null | undefined) {
	if (target && target.startsWith('/') && !target.startsWith('//')) {
		return target;
	}

	return '/dashboard';
}

function buildCallbackURL(invite?: string | null, next?: string | null) {
	if (invite) {
		return `${env.BETTER_AUTH_URL}/complete?invite=${encodeURIComponent(invite)}`;
	}

	return `${env.BETTER_AUTH_URL}${safeRedirect(next)}`;
}

export const load: PageServerLoad = async (event) => {
	redirectIfAuthenticated(event);

	return {
		invite: event.url.searchParams.get('invite') ?? '',
		next: safeRedirect(event.url.searchParams.get('next')),
		notice:
			event.url.searchParams.get('reset') === 'success'
				? 'Your password has been updated. Request a fresh sign-in link or use the password sign-in form.'
				: null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			next: safeRedirect(String(formData.get('next') ?? '')),
			invite: String(formData.get('invite') ?? '')
		};

		const parsed = magicLinkSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Use a valid email address.',
				values
			});
		}

		const existingUser = await prisma.user.findUnique({
			where: { email: parsed.data.email },
			select: { id: true }
		});

		if (!existingUser) {
			return fail(400, {
				message: 'No account was found for that email. Create an account first.',
				values
			});
		}

		try {
			await auth.api.signInMagicLink({
				body: {
					email: parsed.data.email,
					callbackURL: buildCallbackURL(parsed.data.invite, parsed.data.next),
					metadata: {
						intent: 'signin'
					}
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to send the sign-in link.'),
				values
			});
		}

		redirect(
			303,
			`/verify-email?flow=magic-link&intent=signin&email=${encodeURIComponent(parsed.data.email)}${parsed.data.invite ? `&invite=${encodeURIComponent(parsed.data.invite)}` : ''}${parsed.data.next ? `&next=${encodeURIComponent(parsed.data.next)}` : ''}`
		);
	},
	password: async (event) => {
		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			password: String(formData.get('password') ?? ''),
			next: safeRedirect(String(formData.get('next') ?? '')),
			invite: String(formData.get('invite') ?? '')
		};

		const parsed = passwordLoginSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid credentials.',
				values: {
					email: values.email,
					next: values.next,
					invite: values.invite
				}
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
				message: getErrorMessage(error, 'Unable to sign in with a password.'),
				values: {
					email: values.email,
					next: values.next,
					invite: values.invite
				}
			});
		}

		redirect(
			303,
			safeRedirect(
				parsed.data.invite
					? `/complete?invite=${encodeURIComponent(parsed.data.invite)}`
					: parsed.data.next
			)
		);
	},
	logout: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});

		redirect(303, '/login');
	}
};
