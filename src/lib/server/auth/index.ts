import { getRequestEvent } from '$app/server';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$lib/server/config/env';
import { prisma } from '$lib/server/db/client';
import {
	sendMagicLinkEmail,
	sendPasswordResetEmail,
	sendVerificationEmail
} from '$lib/server/email/resend';

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	basePath: '/api/auth',
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: env.TRUSTED_ORIGINS,
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
		usePlural: false
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		resetPasswordTokenExpiresIn: 60 * 60,
		sendResetPassword: async ({ user, url, token }) => {
			await sendPasswordResetEmail({
				to: user.email,
				name: user.name,
				url,
				token
			});
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		expiresIn: 60 * 60 * 24,
		sendVerificationEmail: async ({ user, url, token }) => {
			await sendVerificationEmail({
				to: user.email,
				name: user.name,
				url,
				token
			});
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5
		}
	},
	advanced: {
		useSecureCookies: env.NODE_ENV === 'production',
		cookies: {
			sessionToken: {
				name: 'saas.session_token'
			}
		}
	},
	rateLimit: {
		enabled: true
	},
	plugins: [
		magicLink({
			expiresIn: 60 * 15,
			allowedAttempts: 1,
			storeToken: 'hashed',
			sendMagicLink: async ({ email, url, token, metadata }) => {
				await sendMagicLinkEmail({
					to: email,
					name: typeof metadata?.name === 'string' ? metadata.name : null,
					url,
					token,
					intent: metadata?.intent === 'signup' ? 'signup' : 'signin'
				});
			}
		}),
		sveltekitCookies(getRequestEvent)
	]
});
