import { fail } from '@sveltejs/kit';
import { requireAuthenticated, requireRole } from '$lib/server/auth/permissions';
import { invitationSchema, organizationNameSchema } from '$lib/server/features/organization/schema';
import {
	ensurePersonalOrganization,
	getOrganizationSettings,
	inviteMember,
	updateOrganizationName
} from '$lib/server/features/organization/service';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { organization } = await parent();

	return {
		organization: await getOrganizationSettings(organization.id)
	};
};

export const actions: Actions = {
	rename: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});
		const organization = membership.organization;
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const values = {
			name: String(formData.get('name') ?? '')
		};

		const parsed = organizationNameSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Enter a workspace name.',
				values
			});
		}

		try {
			await updateOrganizationName({
				organizationId: organization.id,
				actorUserId: user.id,
				input: parsed.data,
				ipAddress: event.getClientAddress(),
				userAgent: event.request.headers.get('user-agent')
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to update the workspace.'),
				values
			});
		}

		return {
			success: true,
			message: 'Workspace updated.',
			values
		};
	},
	invite: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({
			id: user.id,
			name: user.name,
			email: user.email
		});
		const organization = membership.organization;
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			role: String(formData.get('role') ?? 'MEMBER')
		};

		const parsed = invitationSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Unable to send the invitation.',
				values
			});
		}

		try {
			await inviteMember({
				organizationId: organization.id,
				actorUserId: user.id,
				actorName: user.name,
				input: parsed.data,
				appUrl: event.url.origin,
				ipAddress: event.getClientAddress(),
				userAgent: event.request.headers.get('user-agent')
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to send the invitation.'),
				values
			});
		}

		return {
			success: true,
			message: 'Invitation sent.',
			values
		};
	}
};
