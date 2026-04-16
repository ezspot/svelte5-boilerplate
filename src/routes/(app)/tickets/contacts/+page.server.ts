import { fail } from '@sveltejs/kit';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import { createContactSchema } from '$lib/server/features/tickets/schema';
import { listContacts, createContact } from '$lib/server/features/tickets/service';
import { getErrorMessage, logError } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { organization } = await parent();

	const search = url.searchParams.get('q') || undefined;
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	try {
		const result = await listContacts({ organizationId: organization.id, search, page });
		return { ...result, search: search ?? '', loadError: null };
	} catch (err) {
		logError(err, 'Contacts list load failed');
		return {
			contacts: [],
			total: 0,
			page: 1,
			perPage: 25,
			totalPages: 0,
			search: search ?? '',
			loadError: 'Could not load contacts.'
		};
	}
};

export const actions: Actions = {
	create: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});

		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			name: String(formData.get('name') ?? ''),
			phone: String(formData.get('phone') ?? ''),
			company: String(formData.get('company') ?? '')
		};

		const parsed = createContactSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid contact data.',
				values
			});
		}

		try {
			await createContact({
				organizationId: membership.organization.id,
				input: parsed.data
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Could not create the contact.'),
				values
			});
		}

		return { success: true, message: 'Contact created.' };
	}
};
