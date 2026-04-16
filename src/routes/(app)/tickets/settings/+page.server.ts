import { fail } from '@sveltejs/kit';
import { requireAuthenticated, requireRole } from '$lib/server/auth/permissions';
import { ensurePersonalOrganization } from '$lib/server/features/organization/service';
import {
	cannedResponseSchema,
	slaPolicySchema,
	helpdeskSettingsSchema,
	orgTicketSettingsSchema
} from '$lib/server/features/tickets/schema';
import {
	listCannedResponses,
	createCannedResponse,
	deleteCannedResponse,
	listSlaPolicies,
	upsertSlaPolicy,
	deleteSlaPolicy,
	getHelpdeskSettings,
	upsertHelpdeskSettings,
	updateTicketPrefix
} from '$lib/server/features/tickets/service';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { organization } = await parent();

	const [cannedResponses, slaPolicies, helpdeskSettings] = await Promise.all([
		listCannedResponses(organization.id),
		listSlaPolicies(organization.id),
		getHelpdeskSettings(organization.id)
	]);

	return {
		cannedResponses,
		slaPolicies,
		helpdeskSettings,
		ticketPrefix: organization.ticketPrefix
	};
};

export const actions: Actions = {
	createCanned: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({ id: user.id, name: user.name, email: user.email });
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const values = {
			title: String(formData.get('title') ?? ''),
			body: String(formData.get('body') ?? ''),
			shortcut: String(formData.get('shortcut') ?? '')
		};

		const parsed = cannedResponseSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Invalid data.', tab: 'canned' as const });
		}

		try {
			await createCannedResponse({ organizationId: membership.organization.id, input: parsed.data });
		} catch (error) {
			return fail(400, { message: getErrorMessage(error, 'Could not create canned response.'), tab: 'canned' as const });
		}

		return { success: true, message: 'Canned response created.', tab: 'canned' as const };
	},

	deleteCanned: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({ id: user.id, name: user.name, email: user.email });
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const id = String(formData.get('id') ?? '');

		try {
			await deleteCannedResponse({ id, organizationId: membership.organization.id });
		} catch (error) {
			return fail(400, { message: getErrorMessage(error, 'Could not delete.'), tab: 'canned' as const });
		}

		return { success: true, message: 'Canned response deleted.', tab: 'canned' as const };
	},

	upsertSla: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({ id: user.id, name: user.name, email: user.email });
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const values = {
			name: String(formData.get('name') ?? ''),
			priority: String(formData.get('priority') ?? ''),
			firstResponseMinutes: String(formData.get('firstResponseMinutes') ?? ''),
			resolutionMinutes: String(formData.get('resolutionMinutes') ?? ''),
			isDefault: String(formData.get('isDefault') ?? '')
		};

		const parsed = slaPolicySchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Invalid data.', tab: 'sla' as const });
		}

		try {
			await upsertSlaPolicy({ organizationId: membership.organization.id, input: parsed.data });
		} catch (error) {
			return fail(400, { message: getErrorMessage(error, 'Could not save SLA policy.'), tab: 'sla' as const });
		}

		return { success: true, message: 'SLA policy saved.', tab: 'sla' as const };
	},

	deleteSla: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({ id: user.id, name: user.name, email: user.email });
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const id = String(formData.get('id') ?? '');

		try {
			await deleteSlaPolicy({ id, organizationId: membership.organization.id });
		} catch (error) {
			return fail(400, { message: getErrorMessage(error, 'Could not delete.'), tab: 'sla' as const });
		}

		return { success: true, message: 'SLA policy deleted.', tab: 'sla' as const };
	},

	saveHelpdeskSettings: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({ id: user.id, name: user.name, email: user.email });
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const values = {
			fromName: String(formData.get('fromName') ?? ''),
			fromEmail: String(formData.get('fromEmail') ?? ''),
			resendApiKey: String(formData.get('resendApiKey') ?? ''),
			inboundWebhookSecret: String(formData.get('inboundWebhookSecret') ?? '')
		};

		const parsed = helpdeskSettingsSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Invalid data.', tab: 'email' as const });
		}

		try {
			await upsertHelpdeskSettings({ organizationId: membership.organization.id, input: parsed.data });
		} catch (error) {
			return fail(400, { message: getErrorMessage(error, 'Could not save settings.'), tab: 'email' as const });
		}

		return { success: true, message: 'Email settings saved.', tab: 'email' as const };
	},

	saveTicketPrefix: async (event) => {
		const { user } = requireAuthenticated(event);
		const membership = await ensurePersonalOrganization({ id: user.id, name: user.name, email: user.email });
		requireRole(membership.role, 'ADMIN');

		const formData = await event.request.formData();
		const values = {
			ticketPrefix: String(formData.get('ticketPrefix') ?? '').toUpperCase()
		};

		const parsed = orgTicketSettingsSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Invalid prefix.', tab: 'general' as const });
		}

		try {
			await updateTicketPrefix({ organizationId: membership.organization.id, input: parsed.data });
		} catch (error) {
			return fail(400, { message: getErrorMessage(error, 'Could not save prefix.'), tab: 'general' as const });
		}

		return { success: true, message: 'Ticket prefix updated.', tab: 'general' as const };
	}
};
