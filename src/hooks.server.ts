import { building } from '$app/environment';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';
import { logError } from '$lib/server/core/errors';

const authHandle: Handle = async ({ event, resolve }) => {
	if (building) {
		event.locals.session = null;
		event.locals.user = null;
		return resolve(event);
	}

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	return svelteKitHandler({
		event,
		resolve,
		building,
		auth
	});
};

const securityHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-dns-prefetch-control', 'off');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('cross-origin-opener-policy', 'same-origin');
	response.headers.set('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set(
		'permissions-policy',
		'camera=(), geolocation=(), microphone=(), payment=(), usb=()'
	);
	response.headers.set(
		'content-security-policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
	);

	return response;
};

export const handle = sequence(authHandle, securityHandle);

export const handleError: HandleServerError = ({ error }) => {
	logError(error, 'Unhandled server error');
	return {
		message: 'An unexpected error occurred. Please try again later.'
	};
};
