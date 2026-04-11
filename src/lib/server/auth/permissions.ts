import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import type { MembershipRole } from '../../../../generated/prisma/client';

const roleRank: Record<MembershipRole, number> = {
	OWNER: 3,
	ADMIN: 2,
	MEMBER: 1
};

export function requireAuthenticated(event: RequestEvent) {
	if (!event.locals.user || !event.locals.session) {
		redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	}

	return {
		user: event.locals.user,
		session: event.locals.session
	};
}

export function redirectIfAuthenticated(event: RequestEvent) {
	if (event.locals.user && event.locals.session) {
		redirect(303, '/dashboard');
	}
}

export function hasRequiredRole(role: MembershipRole, minimumRole: MembershipRole) {
	return roleRank[role] >= roleRank[minimumRole];
}

export function requireRole(role: MembershipRole, minimumRole: MembershipRole) {
	if (!hasRequiredRole(role, minimumRole)) {
		throw error(403, {
			message: 'You do not have permission to perform this action.',
			code: 'INSUFFICIENT_ROLE'
		});
	}
}
