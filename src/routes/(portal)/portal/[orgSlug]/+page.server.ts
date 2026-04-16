import { error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/client';
import { checkRateLimit } from '$lib/server/core/rate-limit';
import { portalTicketSchema } from '$lib/server/features/tickets/schema';
import { createPortalTicket } from '$lib/server/features/tickets/service';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { organization } = await parent();
	return { organization };
};

export const actions: Actions = {
	submit: async (event) => {
		const rl = checkRateLimit(`portal:submit:${event.getClientAddress()}`, 5, 15 * 60_000);
		if (rl.limited) {
			return fail(429, {
				message: 'Too many requests. Please try again later.',
				values: { title: '', description: '', contactEmail: '', contactName: '' }
			});
		}

		const organization = await prisma.organization.findUnique({
			where: { slug: event.params.orgSlug },
			select: { id: true }
		});
		if (!organization) throw error(404, 'Organization not found.');

		const formData = await event.request.formData();
		const values = {
			title: String(formData.get('title') ?? ''),
			description: String(formData.get('description') ?? ''),
			contactEmail: String(formData.get('contactEmail') ?? ''),
			contactName: String(formData.get('contactName') ?? '')
		};

		const parsed = portalTicketSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid data.',
				values
			});
		}

		try {
			const ticket = await createPortalTicket({
				organizationId: organization.id,
				input: parsed.data,
				audit: {
					ipAddress: event.getClientAddress(),
					userAgent: event.request.headers.get('user-agent')
				}
			});

			return { success: true, message: 'Ticket submitted successfully.', publicId: ticket.publicId };
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Could not submit the ticket.'),
				values
			});
		}
	}
};
