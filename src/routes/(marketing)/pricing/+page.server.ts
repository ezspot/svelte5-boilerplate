import { getBillingPlans } from '$lib/server/features/billing/plans';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		plans: getBillingPlans()
	};
};
