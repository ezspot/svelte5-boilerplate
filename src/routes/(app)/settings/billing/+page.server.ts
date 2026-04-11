import type { PageServerLoad } from './$types';
import { getBillingOverview } from '$lib/server/features/billing/service';

export const load: PageServerLoad = async ({ parent }) => {
	const { organization } = await parent();

	return {
		billing: await getBillingOverview(organization.name)
	};
};
