import { fail, redirect } from '@sveltejs/kit';
import { requireAuthenticated, requireRole } from '$lib/server/auth/permissions';
import { getErrorMessage } from '$lib/server/core/errors';
import { billingCheckoutSchema } from '$lib/server/features/billing/schema';
import { createCustomerPortalLink, getBillingOverview } from '$lib/server/features/billing/service';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { organization } = await parent();

	return {
		billing: await getBillingOverview(organization.id),
		notice:
			url.searchParams.get('checkout') === 'success'
				? 'Checkout completed. Billing status will refresh as soon as Paddle confirms the subscription.'
				: null
	};
};

export const actions: Actions = {
	checkout: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const parsed = billingCheckoutSchema.safeParse({
			planKey: String(formData.get('planKey') ?? '')
		});

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Choose a valid plan before checkout.'
			});
		}

		redirect(303, `/checkout/paddle?plan=${parsed.data.planKey}`);
	},
	portal: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});
		requireRole(membership.role, 'ADMIN');

		try {
			const url = await createCustomerPortalLink({
				organizationId: membership.organizationId,
				actorUserId: user.id
			});

			redirect(303, url);
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to open the billing portal right now.')
			});
		}
	}
};
