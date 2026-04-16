import { fail } from '@sveltejs/kit';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import { updateContactSchema } from '$lib/server/features/tickets/schema';
import { getContact, updateContact } from '$lib/server/features/tickets/service';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { organization } = await parent();
	const contact = await getContact({ contactId: params.id, organizationId: organization.id });
	return { contact };
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
		const values = {
			name: String(formData.get('name') ?? ''),
			phone: String(formData.get('phone') ?? ''),
			company: String(formData.get('company') ?? '')
		};

		const parsed = updateContactSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid data.',
				values
			});
		}

		try {
			await updateContact({
				contactId: event.params.id,
				organizationId: membership.organization.id,
				input: parsed.data
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Could not update the contact.'),
				values
			});
		}

		return { success: true, message: 'Contact updated.' };
	}
};
