import { fail, redirect } from '@sveltejs/kit';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import { createTicketSchema } from '$lib/server/features/tickets/schema';
import { createTicket, listContacts } from '$lib/server/features/tickets/service';
import { getErrorMessage } from '$lib/server/core/errors';
import { prisma } from '$lib/server/db/client';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { organization } = await parent();

	const [memberships, contactResult] = await Promise.all([
		prisma.membership.findMany({
			where: { organizationId: organization.id },
			include: { user: { select: { id: true, name: true } } },
			orderBy: { user: { name: 'asc' } }
		}),
		listContacts({ organizationId: organization.id, perPage: 200 })
	]);

	return {
		members: memberships.map((m) => ({ id: m.user.id, name: m.user.name })),
		contacts: contactResult.contacts.map((c) => ({
			id: c.id,
			name: c.name,
			email: c.email,
			company: c.company
		}))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});
		const organization = membership.organization;

		const formData = await event.request.formData();
		const values = {
			title: String(formData.get('title') ?? ''),
			description: String(formData.get('description') ?? ''),
			priority: String(formData.get('priority') ?? 'MEDIUM'),
			channel: String(formData.get('channel') ?? 'MANUAL'),
			contactId: String(formData.get('contactId') ?? ''),
			assignedToId: String(formData.get('assignedToId') ?? '')
		};

		const parsed = createTicketSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid ticket data.',
				values
			});
		}

		try {
			const ticket = await createTicket({
				organizationId: organization.id,
				createdById: user.id,
				input: parsed.data,
				audit: {
					ipAddress: event.getClientAddress(),
					userAgent: event.request.headers.get('user-agent')
				}
			});

			redirect(303, `/tickets/${ticket.id}`);
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				throw error;
			}
			return fail(400, {
				message: getErrorMessage(error, 'Could not create the ticket.'),
				values
			});
		}
	}
};
