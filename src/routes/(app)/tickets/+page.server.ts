import type { TicketStatus } from '../../../../generated/prisma/client';
import { listTickets, getTicketStats, getSlaBreach } from '$lib/server/features/tickets/service';
import { logError } from '$lib/server/core/errors';
import type { PageServerLoad } from './$types';

const validStatuses = new Set<string>(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']);

export const load: PageServerLoad = async ({ parent, url }) => {
	const { organization } = await parent();

	const statusParam = url.searchParams.get('status')?.toUpperCase();
	const status = statusParam && validStatuses.has(statusParam)
		? (statusParam as TicketStatus)
		: undefined;

	const assignedToId = url.searchParams.get('assignee') || undefined;
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	try {
		const [result, stats, slaBreach] = await Promise.all([
			listTickets({ organizationId: organization.id, status, assignedToId, page }),
			getTicketStats(organization.id),
			getSlaBreach(organization.id)
		]);

		return { ...result, stats, slaBreach, loadError: null };
	} catch (err) {
		logError(err, 'Tickets list load failed');
		return {
			tickets: [],
			total: 0,
			page: 1,
			perPage: 25,
			totalPages: 0,
			stats: { open: 0, inProgress: 0, waiting: 0, resolved: 0, total: 0 },
			slaBreach: { responseBreached: 0, resolutionBreached: 0 },
			loadError: 'Could not load tickets.'
		};
	}
};
