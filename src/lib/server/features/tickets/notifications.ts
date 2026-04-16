import { prisma } from '$lib/server/db/client';
import { logError } from '$lib/server/core/errors';
import { decryptField } from '$lib/server/core/crypto';
import { sendTicketCreatedEmail, sendTicketReplyEmail, type OrgEmailConfig } from '$lib/server/email/resend';

/** Resolve org slug + name + email config for email context. */
async function getOrgContext(organizationId: string) {
	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			name: true,
			slug: true,
			helpdeskSettings: {
				select: { fromName: true, fromEmail: true, resendApiKey: true }
			}
		}
	});
	if (!org) return { name: 'Support', slug: 'unknown', orgConfig: null as OrgEmailConfig | null };

	const hs = org.helpdeskSettings;
	const orgConfig: OrgEmailConfig | null = hs
		? {
				fromName: hs.fromName,
				fromEmail: hs.fromEmail,
				resendApiKey: hs.resendApiKey ? decryptField(hs.resendApiKey) : null
			}
		: null;

	return { name: org.name, slug: org.slug, orgConfig };
}

/**
 * Send confirmation email to the contact when a ticket is created.
 * Fire-and-forget — failures are logged but never block the caller.
 */
export async function notifyTicketCreated({
	organizationId,
	contactEmail,
	displayId,
	title,
	publicId
}: {
	organizationId: string;
	contactEmail: string;
	displayId: string;
	title: string;
	publicId: string;
}) {
	try {
		const org = await getOrgContext(organizationId);
		await sendTicketCreatedEmail({
			to: contactEmail,
			orgName: org.name,
			orgSlug: org.slug,
			displayId,
			title,
			publicId,
			orgConfig: org.orgConfig
		});
	} catch (err) {
		logError(err, 'Failed to send ticket-created email');
	}
}

/**
 * Notify the contact when an agent replies (non-internal).
 * Fire-and-forget.
 */
export async function notifyAgentReply({
	organizationId,
	ticketId,
	agentName,
	body
}: {
	organizationId: string;
	ticketId: string;
	agentName: string;
	body: string;
}) {
	try {
		const ticket = await prisma.ticket.findFirst({
			where: { id: ticketId, organizationId },
			select: {
				displayId: true,
				title: true,
				publicId: true,
				contact: { select: { email: true } }
			}
		});
		if (!ticket) return;

		const org = await getOrgContext(organizationId);
		await sendTicketReplyEmail({
			to: ticket.contact.email,
			orgName: org.name,
			orgSlug: org.slug,
			displayId: ticket.displayId,
			title: ticket.title,
			publicId: ticket.publicId,
			replierName: agentName,
			bodyPreview: body,
			orgConfig: org.orgConfig
		});
	} catch (err) {
		logError(err, 'Failed to send agent-reply email');
	}
}

/**
 * Notify assigned agent when a contact replies via portal.
 * Fire-and-forget.
 */
export async function notifyContactReply({
	organizationId,
	ticketId,
	contactName,
	body
}: {
	organizationId: string;
	ticketId: string;
	contactName: string;
	body: string;
}) {
	try {
		const ticket = await prisma.ticket.findFirst({
			where: { id: ticketId, organizationId },
			select: {
				displayId: true,
				title: true,
				publicId: true,
				assignedTo: { select: { email: true, name: true } }
			}
		});
		if (!ticket?.assignedTo) return;

		const org = await getOrgContext(organizationId);
		await sendTicketReplyEmail({
			to: ticket.assignedTo.email,
			orgName: org.name,
			orgSlug: org.slug,
			displayId: ticket.displayId,
			title: ticket.title,
			publicId: ticket.publicId,
			replierName: contactName,
			bodyPreview: body,
			orgConfig: org.orgConfig
		});
	} catch (err) {
		logError(err, 'Failed to send contact-reply email');
	}
}
