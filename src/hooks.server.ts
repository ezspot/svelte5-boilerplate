import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';

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
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('cross-origin-opener-policy', 'same-origin');
	response.headers.set(
		'permissions-policy',
		'camera=(), geolocation=(), microphone=(), payment=(), usb=()'
	);

	return response;
};

export const handle = sequence(authHandle, securityHandle);
