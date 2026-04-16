import { fail } from '@sveltejs/kit';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import { updateTicketSchema, ticketCommentSchema } from '$lib/server/features/tickets/schema';
import {
	getTicketById,
	updateTicket,
	addAgentComment,
	listCannedResponses
} from '$lib/server/features/tickets/service';
import { getErrorMessage } from '$lib/server/core/errors';
import { prisma } from '$lib/server/db/client';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { organization } = await parent();

	const [ticket, memberships, cannedResponses] = await Promise.all([
		getTicketById({ ticketId: params.id, organizationId: organization.id }),
		prisma.membership.findMany({
			where: { organizationId: organization.id },
			include: { user: { select: { id: true, name: true } } },
			orderBy: { user: { name: 'asc' } }
		}),
		listCannedResponses(organization.id)
	]);

	return {
		ticket,
		members: memberships.map((m) => ({ id: m.user.id, name: m.user.name })),
		cannedResponses: cannedResponses.map((cr) => ({
			id: cr.id,
			title: cr.title,
			body: cr.body,
			shortcut: cr.shortcut
		}))
	};
};

export const actions: Actions = {
	update: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});

		const formData = await event.request.formData();
		const values: Record<string, string> = {};

		const status = formData.get('status');
		const priority = formData.get('priority');
		const assignedToId = formData.get('assignedToId');

		if (status) values.status = String(status);
		if (priority) values.priority = String(priority);
		if (assignedToId !== null) values.assignedToId = String(assignedToId);

		const parsed = updateTicketSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid update.',
				action: 'update' as const
			});
		}

		try {
			await updateTicket({
				ticketId: event.params.id,
				organizationId: membership.organization.id,
				actorUserId: user.id,
				input: parsed.data,
				audit: {
					ipAddress: event.getClientAddress(),
					userAgent: event.request.headers.get('user-agent')
				}
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Could not update the ticket.'),
				action: 'update' as const
			});
		}

		return { success: true, message: 'Ticket updated.', action: 'update' as const };
	},

	comment: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});

		const formData = await event.request.formData();
		const values = {
			body: String(formData.get('body') ?? ''),
			internal: String(formData.get('internal') ?? '')
		};

		const parsed = ticketCommentSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid comment.',
				action: 'comment' as const
			});
		}

		try {
			await addAgentComment({
				ticketId: event.params.id,
				organizationId: membership.organization.id,
				authorId: user.id,
				input: parsed.data,
				audit: {
					ipAddress: event.getClientAddress(),
					userAgent: event.request.headers.get('user-agent')
				}
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Could not add the comment.'),
				action: 'comment' as const
			});
		}

		return { success: true, message: 'Comment added.', action: 'comment' as const };
	}
};
