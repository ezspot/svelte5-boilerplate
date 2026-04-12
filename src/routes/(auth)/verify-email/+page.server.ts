import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { env } from '$lib/server/config/env';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

const resendSchema = z.object({
	email: z.email('Use a valid email address.'),
	flow: z.enum(['verification', 'magic-link']).default('magic-link'),
	intent: z.enum(['signin', 'signup']).default('signin'),
	name: z.string().trim().max(80).optional(),
	invite: z.string().optional(),
	next: z.string().optional()
});

function buildCallbackURL({ invite, next }: { invite?: string | null; next?: string | null }) {
	if (invite) {
		return `${env.BETTER_AUTH_URL}/complete?invite=${encodeURIComponent(invite)}`;
	}

	if (next && next.startsWith('/') && !next.startsWith('//')) {
		return `${env.BETTER_AUTH_URL}${next}`;
	}

	return `${env.BETTER_AUTH_URL}/dashboard`;
}

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user?.emailVerified) {
		redirect(303, '/dashboard');
	}

	return {
		email: url.searchParams.get('email') ?? locals.user?.email ?? '',
		flow: url.searchParams.get('flow') === 'verification' ? 'verification' : 'magic-link',
		intent: url.searchParams.get('intent') === 'signup' ? 'signup' : 'signin',
		name: url.searchParams.get('name') ?? '',
		invite: url.searchParams.get('invite') ?? '',
		next: url.searchParams.get('next') ?? ''
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			flow: String(formData.get('flow') ?? 'magic-link'),
			intent: String(formData.get('intent') ?? 'signin'),
			name: String(formData.get('name') ?? ''),
			invite: String(formData.get('invite') ?? ''),
			next: String(formData.get('next') ?? '')
		};

		const parsed = resendSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Use a valid email address.',
				values
			});
		}

		try {
			if (parsed.data.flow === 'verification') {
				await auth.api.sendVerificationEmail({
					body: {
						email: parsed.data.email,
						callbackURL: `${env.BETTER_AUTH_URL}/dashboard`
					},
					headers: event.request.headers
				});
			} else {
				await auth.api.signInMagicLink({
					body: {
						email: parsed.data.email,
						name: parsed.data.name || undefined,
						callbackURL: buildCallbackURL(parsed.data),
						newUserCallbackURL: buildCallbackURL(parsed.data),
						metadata: {
							intent: parsed.data.intent,
							name: parsed.data.name || undefined
						}
					},
					headers: event.request.headers
				});
			}
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(
					error,
					parsed.data.flow === 'verification'
						? 'Unable to resend the verification email.'
						: 'Unable to resend the sign-in link.'
				),
				values
			});
		}

		return {
			success: true,
			message:
				parsed.data.flow === 'verification'
					? 'A fresh verification email has been sent.'
					: 'A fresh sign-in link has been sent.',
			values
		};
	}
};
