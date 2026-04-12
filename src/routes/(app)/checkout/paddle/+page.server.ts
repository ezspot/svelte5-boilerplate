import { error } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth/permissions';
import { env } from '$lib/server/config/env';
import { billingCheckoutSchema } from '$lib/server/features/billing/schema';
import { createCheckoutSession } from '$lib/server/features/billing/service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { organization, user, membership } = await parent();
	requireRole(membership.role, 'ADMIN');

	const parsed = billingCheckoutSchema.safeParse({
		planKey: url.searchParams.get('plan') ?? ''
	});

	if (!parsed.success) {
		error(404, {
			message: 'That billing plan was not found.',
			code: 'PLAN_NOT_FOUND'
		});
	}

	const checkout = await createCheckoutSession({
		organizationId: organization.id,
		actorUserId: user.id,
		actorEmail: user.email,
		organizationName: organization.name,
		planKey: parsed.data.planKey
	});

	return {
		plan: checkout.plan,
		transactionId: checkout.transactionId,
		checkoutUrl: checkout.checkoutUrl,
		clientToken: env.PUBLIC_PADDLE_CLIENT_TOKEN,
		environment: env.PADDLE_ENVIRONMENT,
		successUrl: `${url.origin}/settings/billing?checkout=success`
	};
};
