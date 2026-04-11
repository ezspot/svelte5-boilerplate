import type { PageServerLoad } from './$types';
import { getDashboardData } from '$lib/server/features/dashboard/service';

export const load: PageServerLoad = async ({ parent }) => {
	const { organization, user } = await parent();

	try {
		return {
			dashboard: await getDashboardData(user.id, organization.id),
			loadError: null
		};
	} catch {
		return {
			dashboard: null,
			loadError: 'The dashboard data could not be loaded right now.'
		};
	}
};
