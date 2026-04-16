import { error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/client';
import { checkRateLimit } from '$lib/server/core/rate-limit';
import { getTicketByPublicId, addContactComment } from '$lib/server/features/tickets/service';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { organization } = await parent();

	// Lightweight ownership check before full load — always scope by org
	const meta = await prisma.ticket.findFirst({
		where: { publicId: params.publicId, organizationId: organization.id },
		select: { contactId: true }
	});

	if (!meta) {
		throw error(404, 'Ticket not found.');
	}

	const ticket = await getTicketByPublicId({
		publicId: params.publicId,
		organizationId: organization.id,
		contactId: meta.contactId
	});

	return { ticket };
};

export const actions: Actions = {
	reply: async (event) => {
		const rl = checkRateLimit(`portal:reply:${event.getClientAddress()}`, 20, 15 * 60_000);
		if (rl.limited) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const org = await prisma.organization.findUnique({
			where: { slug: event.params.orgSlug },
			select: { id: true }
		});
		if (!org) throw error(404, 'Organization not found.');

		const ticket = await prisma.ticket.findFirst({
			where: { publicId: event.params.publicId, organizationId: org.id },
			select: { id: true, contactId: true }
		});
		if (!ticket) {
			throw error(404, 'Ticket not found.');
		}

		const formData = await event.request.formData();
		const body = String(formData.get('body') ?? '').trim();

		if (!body || body.length < 1) {
			return fail(400, { message: 'Reply cannot be empty.' });
		}
		if (body.length > 5000) {
			return fail(400, { message: 'Reply is too long (max 5000 characters).' });
		}

		try {
			await addContactComment({
				ticketId: ticket.id,
				organizationId: org.id,
				contactId: ticket.contactId,
				body
			});
		} catch (err) {
			return fail(400, { message: getErrorMessage(err, 'Could not add reply.') });
		}

		return { success: true, message: 'Reply added.' };
	}
};
