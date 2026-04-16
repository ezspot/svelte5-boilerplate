import { randomBytes } from 'node:crypto';
import type {
	TicketChannel,
	TicketPriority,
	TicketStatus
} from '../../../../../generated/prisma/client';
import { prisma } from '$lib/server/db/client';
import { AppError } from '$lib/server/core/errors';
import { encryptField, decryptField } from '$lib/server/core/crypto';
import { notifyTicketCreated, notifyAgentReply, notifyContactReply } from './notifications';
import type {
	CannedResponseInput,
	CreateContactInput,
	CreateTicketInput,
	HelpdeskSettingsInput,
	OrgTicketSettingsInput,
	PortalTicketInput,
	SlaPolicyInput,
	TicketCommentInput,
	TicketTagInput,
	UpdateContactInput,
	UpdateTicketInput
} from './schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatePublicId(): string {
	return randomBytes(16).toString('base64url');
}

/** Generate a non-guessable display ID like TKT-A7X9K2. */
function generateDisplayId(prefix: string): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
	let suffix = '';
	const bytes = randomBytes(6);
	for (let i = 0; i < 6; i++) {
		suffix += chars[bytes[i] % chars.length];
	}
	return `${prefix}-${suffix}`;
}

async function getOrgTicketConfig(organizationId: string) {
	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { ticketPrefix: true }
	});
	return { prefix: org?.ticketPrefix ?? 'TKT' };
}

async function nextTicketNumber(
	tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
	organizationId: string
): Promise<number> {
	const last = await tx.ticket.findFirst({
		where: { organizationId },
		orderBy: { number: 'desc' },
		select: { number: true }
	});
	return (last?.number ?? 0) + 1;
}

/** Retry a transaction up to `maxRetries` times on unique constraint violations (P2002). */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (err: unknown) {
			const isPrismaUnique =
				err != null && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002';
			if (!isPrismaUnique || attempt === maxRetries) throw err;
		}
	}
	throw new AppError('Could not create ticket after retries.', 500, 'TICKET_CREATE_RETRY_EXHAUSTED');
}

async function applySla(
	organizationId: string,
	priority: TicketPriority
): Promise<{ slaFirstResponseDueAt: Date | null; slaResolutionDueAt: Date | null }> {
	const policy = await prisma.slaPolicy.findUnique({
		where: { organizationId_priority: { organizationId, priority } }
	});
	if (!policy) return { slaFirstResponseDueAt: null, slaResolutionDueAt: null };

	const now = new Date();
	return {
		slaFirstResponseDueAt: new Date(now.getTime() + policy.firstResponseMinutes * 60_000),
		slaResolutionDueAt: new Date(now.getTime() + policy.resolutionMinutes * 60_000)
	};
}

type AuditMeta = {
	ipAddress: string | null;
	userAgent: string | null;
};

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function createContact({
	organizationId,
	input
}: {
	organizationId: string;
	input: CreateContactInput;
}) {
	return prisma.contact.create({
		data: {
			organizationId,
			email: input.email,
			name: input.name,
			phone: input.phone || null,
			company: input.company || null
		}
	});
}

export async function updateContact({
	contactId,
	organizationId,
	input
}: {
	contactId: string;
	organizationId: string;
	input: UpdateContactInput;
}) {
	const existing = await prisma.contact.findFirst({
		where: { id: contactId, organizationId }
	});
	if (!existing) throw new AppError('Contact not found.', 404, 'CONTACT_NOT_FOUND');

	const data: Record<string, unknown> = {};
	if (input.name !== undefined) data.name = input.name;
	if (input.phone !== undefined) data.phone = input.phone || null;
	if (input.company !== undefined) data.company = input.company || null;

	return prisma.contact.update({ where: { id: contactId }, data });
}

export async function getContact({
	contactId,
	organizationId
}: {
	contactId: string;
	organizationId: string;
}) {
	const contact = await prisma.contact.findFirst({
		where: { id: contactId, organizationId },
		include: {
			tickets: {
				orderBy: { createdAt: 'desc' },
				take: 20,
				select: { id: true, displayId: true, title: true, status: true, createdAt: true }
			},
			_count: { select: { tickets: true } }
		}
	});
	if (!contact) throw new AppError('Contact not found.', 404, 'CONTACT_NOT_FOUND');
	return contact;
}

export async function listContacts({
	organizationId,
	search,
	page = 1,
	perPage = 25
}: {
	organizationId: string;
	search?: string;
	page?: number;
	perPage?: number;
}) {
	const where = {
		organizationId,
		...(search
			? {
					OR: [
						{ name: { contains: search, mode: 'insensitive' as const } },
						{ email: { contains: search, mode: 'insensitive' as const } },
						{ company: { contains: search, mode: 'insensitive' as const } }
					]
				}
			: {})
	};

	const [contacts, total] = await Promise.all([
		prisma.contact.findMany({
			where,
			orderBy: { name: 'asc' },
			skip: (page - 1) * perPage,
			take: perPage,
			include: { _count: { select: { tickets: true } } }
		}),
		prisma.contact.count({ where })
	]);

	return { contacts, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function ensureContact({
	organizationId,
	email,
	name
}: {
	organizationId: string;
	email: string;
	name: string;
}) {
	return prisma.contact.upsert({
		where: { organizationId_email: { organizationId, email } },
		update: { name },
		create: { organizationId, email, name }
	});
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export async function createTicket({
	organizationId,
	createdById,
	input,
	audit
}: {
	organizationId: string;
	createdById: string | null;
	input: CreateTicketInput;
	audit: AuditMeta;
}) {
	const { prefix } = await getOrgTicketConfig(organizationId);
	const sla = await applySla(organizationId, input.priority as TicketPriority);

	const ticket = await withRetry(() =>
		prisma.$transaction(async (tx) => {
			const number = await nextTicketNumber(tx, organizationId);
			const created = await tx.ticket.create({
				data: {
					organizationId,
					number,
					displayId: generateDisplayId(prefix),
					publicId: generatePublicId(),
					title: input.title,
					description: input.description,
					priority: input.priority as TicketPriority,
					channel: (input.channel as TicketChannel) ?? 'MANUAL',
					contactId: input.contactId,
					createdById: createdById ?? undefined,
					assignedToId: input.assignedToId || undefined,
					...sla
				}
			});

			await tx.auditEvent.create({
				data: {
					organizationId,
					actorUserId: createdById,
					type: 'ticket.created',
					targetType: 'ticket',
					targetId: created.id,
					...audit,
					payload: { number, title: input.title, priority: input.priority, channel: input.channel }
				}
			});

			return created;
		})
	);

	const contactRecord = await prisma.contact.findUnique({
		where: { id: input.contactId },
		select: { email: true }
	});
	if (contactRecord) {
		void notifyTicketCreated({
			organizationId,
			contactEmail: contactRecord.email,
			displayId: ticket.displayId,
			title: input.title,
			publicId: ticket.publicId
		});
	}

	return ticket;
}

export async function createPortalTicket({
	organizationId,
	input,
	audit
}: {
	organizationId: string;
	input: PortalTicketInput;
	audit: AuditMeta;
}) {
	const contact = await ensureContact({
		organizationId,
		email: input.contactEmail,
		name: input.contactName
	});

	const { prefix } = await getOrgTicketConfig(organizationId);
	const sla = await applySla(organizationId, 'MEDIUM');

	const ticket = await withRetry(() =>
		prisma.$transaction(async (tx) => {
			const number = await nextTicketNumber(tx, organizationId);
			const created = await tx.ticket.create({
				data: {
					organizationId,
					number,
					displayId: generateDisplayId(prefix),
					publicId: generatePublicId(),
					title: input.title,
					description: input.description,
					priority: 'MEDIUM',
					channel: 'PORTAL',
					contactId: contact.id,
					createdById: undefined,
					...sla
				}
			});

			await tx.auditEvent.create({
				data: {
					organizationId,
					type: 'ticket.created',
					targetType: 'ticket',
					targetId: created.id,
					...audit,
					payload: { number, channel: 'PORTAL', contactEmail: input.contactEmail }
				}
			});

			return created;
		})
	);

	void notifyTicketCreated({
		organizationId,
		contactEmail: input.contactEmail,
		displayId: ticket.displayId,
		title: input.title,
		publicId: ticket.publicId
	});

	return ticket;
}

/**
 * Create a ticket from an inbound email.
 * Resolves org from the recipient address prefix (e.g. support+{slug}@...).
 */
export async function createEmailTicket({
	organizationId,
	fromEmail,
	fromName,
	subject,
	body
}: {
	organizationId: string;
	fromEmail: string;
	fromName: string;
	subject: string;
	body: string;
}) {
	const contact = await ensureContact({
		organizationId,
		email: fromEmail,
		name: fromName || fromEmail.split('@')[0]
	});

	const { prefix } = await getOrgTicketConfig(organizationId);
	const sla = await applySla(organizationId, 'MEDIUM');

	const ticket = await withRetry(() =>
		prisma.$transaction(async (tx) => {
			const number = await nextTicketNumber(tx, organizationId);
			const created = await tx.ticket.create({
				data: {
					organizationId,
					number,
					displayId: generateDisplayId(prefix),
					publicId: generatePublicId(),
					title: subject || `Email from ${fromEmail}`,
					description: body,
					priority: 'MEDIUM',
					channel: 'EMAIL',
					contactId: contact.id,
					...sla
				}
			});

			await tx.auditEvent.create({
				data: {
					organizationId,
					type: 'ticket.created',
					targetType: 'ticket',
					targetId: created.id,
					payload: { number, channel: 'EMAIL', contactEmail: fromEmail }
				}
			});

			return created;
		})
	);

	void notifyTicketCreated({
		organizationId,
		contactEmail: fromEmail,
		displayId: ticket.displayId,
		title: ticket.title,
		publicId: ticket.publicId
	});

	return ticket;
}

export async function listTickets({
	organizationId,
	status,
	assignedToId,
	contactId,
	page = 1,
	perPage = 25
}: {
	organizationId: string;
	status?: TicketStatus;
	assignedToId?: string;
	contactId?: string;
	page?: number;
	perPage?: number;
}) {
	const where = {
		organizationId,
		...(status ? { status } : {}),
		...(assignedToId ? { assignedToId } : {}),
		...(contactId ? { contactId } : {})
	};

	const [tickets, total] = await Promise.all([
		prisma.ticket.findMany({
			where,
			orderBy: [{ createdAt: 'desc' }],
			skip: (page - 1) * perPage,
			take: perPage,
			include: {
				contact: { select: { id: true, name: true, email: true, company: true } },
				assignedTo: { select: { id: true, name: true, image: true } },
				_count: { select: { comments: true } }
			}
		}),
		prisma.ticket.count({ where })
	]);

	return { tickets, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getTicketById({
	ticketId,
	organizationId
}: {
	ticketId: string;
	organizationId: string;
}) {
	const ticket = await prisma.ticket.findFirst({
		where: { id: ticketId, organizationId },
		include: {
			contact: { select: { id: true, name: true, email: true, company: true } },
			createdBy: { select: { id: true, name: true, email: true, image: true } },
			assignedTo: { select: { id: true, name: true, email: true, image: true } },
			tags: { select: { id: true, name: true, color: true } },
			comments: {
				orderBy: { createdAt: 'asc' },
				include: {
					author: { select: { id: true, name: true, image: true } },
					contact: { select: { id: true, name: true, email: true } }
				}
			}
		}
	});

	if (!ticket) throw new AppError('Ticket not found.', 404, 'TICKET_NOT_FOUND');
	return ticket;
}

// Portal lookup — uses unguessable publicId, scopes to org + contact, excludes internal notes
export async function getTicketByPublicId({
	publicId,
	organizationId,
	contactId
}: {
	publicId: string;
	organizationId: string;
	contactId: string;
}) {
	const ticket = await prisma.ticket.findFirst({
		where: { publicId, organizationId, contactId },
		include: {
			contact: { select: { id: true, name: true, email: true } },
			comments: {
				where: { internal: false },
				orderBy: { createdAt: 'asc' },
				include: {
					author: { select: { id: true, name: true } },
					contact: { select: { id: true, name: true } }
				}
			}
		}
	});

	if (!ticket) {
		throw new AppError('Ticket not found.', 404, 'TICKET_NOT_FOUND');
	}

	return ticket;
}

export async function updateTicket({
	ticketId,
	organizationId,
	actorUserId,
	input,
	audit
}: {
	ticketId: string;
	organizationId: string;
	actorUserId: string;
	input: UpdateTicketInput;
	audit: AuditMeta;
}) {
	const existing = await prisma.ticket.findFirst({
		where: { id: ticketId, organizationId },
		select: { id: true, status: true }
	});
	if (!existing) throw new AppError('Ticket not found.', 404, 'TICKET_NOT_FOUND');

	const data: Record<string, unknown> = {};
	if (input.status) data.status = input.status;
	if (input.priority) data.priority = input.priority;
	if (input.assignedToId !== undefined) data.assignedToId = input.assignedToId || null;

	if (input.status === 'RESOLVED' || input.status === 'CLOSED') {
		data.closedAt = new Date();
	} else if (input.status === 'OPEN' || input.status === 'IN_PROGRESS') {
		data.closedAt = null;
	}

	return prisma.$transaction(async (tx) => {
		const updated = await tx.ticket.update({ where: { id: ticketId }, data });

		await tx.auditEvent.create({
			data: {
				organizationId,
				actorUserId,
				type: 'ticket.updated',
				targetType: 'ticket',
				targetId: ticketId,
				...audit,
				payload: input
			}
		});

		return updated;
	});
}

// Agent reply (public or internal note)
export async function addAgentComment({
	ticketId,
	organizationId,
	authorId,
	input,
	audit
}: {
	ticketId: string;
	organizationId: string;
	authorId: string;
	input: TicketCommentInput;
	audit: AuditMeta;
}) {
	const ticket = await prisma.ticket.findFirst({
		where: { id: ticketId, organizationId },
		select: { id: true, firstRespondedAt: true }
	});
	if (!ticket) throw new AppError('Ticket not found.', 404, 'TICKET_NOT_FOUND');

	const comment = await prisma.$transaction(async (tx) => {
		const created = await tx.ticketComment.create({
			data: {
				ticketId,
				organizationId,
				authorId,
				body: input.body,
				internal: input.internal
			}
		});

		// Track first agent response for SLA
		if (!ticket.firstRespondedAt && !input.internal) {
			await tx.ticket.update({
				where: { id: ticketId },
				data: { firstRespondedAt: new Date() }
			});
		}

		await tx.auditEvent.create({
			data: {
				organizationId,
				actorUserId: authorId,
				type: 'ticket.comment.added',
				targetType: 'ticket',
				targetId: ticketId,
				...audit,
				payload: { commentId: created.id, internal: input.internal }
			}
		});

		return created;
	});

	// Notify contact of public agent replies
	if (!input.internal) {
		const agent = await prisma.user.findUnique({
			where: { id: authorId },
			select: { name: true }
		});
		void notifyAgentReply({
			organizationId,
			ticketId,
			agentName: agent?.name ?? 'Support',
			body: input.body
		});
	}

	return comment;
}

// Contact reply (from portal)
export async function addContactComment({
	ticketId,
	organizationId,
	contactId,
	body
}: {
	ticketId: string;
	organizationId: string;
	contactId: string;
	body: string;
}) {
	const ticket = await prisma.ticket.findFirst({
		where: { id: ticketId, organizationId, contactId },
		select: { id: true }
	});
	if (!ticket) throw new AppError('Ticket not found.', 404, 'TICKET_NOT_FOUND');

	const comment = await prisma.ticketComment.create({
		data: {
			ticketId,
			organizationId,
			contactId,
			body,
			internal: false
		}
	});

	const contactRecord = await prisma.contact.findUnique({
		where: { id: contactId },
		select: { name: true }
	});
	void notifyContactReply({
		organizationId,
		ticketId,
		contactName: contactRecord?.name ?? 'Contact',
		body
	});

	return comment;
}

export async function getTicketStats(organizationId: string) {
	const [open, inProgress, waiting, resolved] = await Promise.all([
		prisma.ticket.count({ where: { organizationId, status: 'OPEN' } }),
		prisma.ticket.count({ where: { organizationId, status: 'IN_PROGRESS' } }),
		prisma.ticket.count({ where: { organizationId, status: 'WAITING' } }),
		prisma.ticket.count({ where: { organizationId, status: 'RESOLVED' } })
	]);
	return { open, inProgress, waiting, resolved, total: open + inProgress + waiting + resolved };
}

// Tickets with SLA breach info for agent dashboard
export async function getSlaBreach(organizationId: string) {
	const now = new Date();
	const [responseBreached, resolutionBreached] = await Promise.all([
		prisma.ticket.count({
			where: {
				organizationId,
				status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING'] },
				firstRespondedAt: null,
				slaFirstResponseDueAt: { lt: now }
			}
		}),
		prisma.ticket.count({
			where: {
				organizationId,
				status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING'] },
				closedAt: null,
				slaResolutionDueAt: { lt: now }
			}
		})
	]);
	return { responseBreached, resolutionBreached };
}

// ---------------------------------------------------------------------------
// Canned responses
// ---------------------------------------------------------------------------

export async function listCannedResponses(organizationId: string) {
	return prisma.cannedResponse.findMany({
		where: { organizationId },
		orderBy: { title: 'asc' }
	});
}

export async function createCannedResponse({
	organizationId,
	input
}: {
	organizationId: string;
	input: CannedResponseInput;
}) {
	return prisma.cannedResponse.create({
		data: {
			organizationId,
			title: input.title,
			body: input.body,
			shortcut: input.shortcut || null
		}
	});
}

export async function updateCannedResponse({
	id,
	organizationId,
	input
}: {
	id: string;
	organizationId: string;
	input: CannedResponseInput;
}) {
	const existing = await prisma.cannedResponse.findFirst({ where: { id, organizationId } });
	if (!existing) throw new AppError('Canned response not found.', 404, 'CANNED_NOT_FOUND');

	return prisma.cannedResponse.update({
		where: { id },
		data: { title: input.title, body: input.body, shortcut: input.shortcut || null }
	});
}

export async function deleteCannedResponse({
	id,
	organizationId
}: {
	id: string;
	organizationId: string;
}) {
	const existing = await prisma.cannedResponse.findFirst({ where: { id, organizationId } });
	if (!existing) throw new AppError('Canned response not found.', 404, 'CANNED_NOT_FOUND');

	return prisma.cannedResponse.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// SLA policies
// ---------------------------------------------------------------------------

export async function listSlaPolicies(organizationId: string) {
	return prisma.slaPolicy.findMany({
		where: { organizationId },
		orderBy: { priority: 'asc' }
	});
}

export async function upsertSlaPolicy({
	organizationId,
	input
}: {
	organizationId: string;
	input: SlaPolicyInput;
}) {
	return prisma.slaPolicy.upsert({
		where: { organizationId_priority: { organizationId, priority: input.priority as TicketPriority } },
		update: {
			name: input.name,
			firstResponseMinutes: input.firstResponseMinutes,
			resolutionMinutes: input.resolutionMinutes,
			isDefault: input.isDefault
		},
		create: {
			organizationId,
			name: input.name,
			priority: input.priority as TicketPriority,
			firstResponseMinutes: input.firstResponseMinutes,
			resolutionMinutes: input.resolutionMinutes,
			isDefault: input.isDefault
		}
	});
}

export async function deleteSlaPolicy({
	id,
	organizationId
}: {
	id: string;
	organizationId: string;
}) {
	const existing = await prisma.slaPolicy.findFirst({ where: { id, organizationId } });
	if (!existing) throw new AppError('SLA policy not found.', 404, 'SLA_NOT_FOUND');

	return prisma.slaPolicy.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function listTicketTags(organizationId: string) {
	return prisma.ticketTag.findMany({
		where: { organizationId },
		orderBy: { name: 'asc' }
	});
}

export async function createTicketTag({
	organizationId,
	input
}: {
	organizationId: string;
	input: TicketTagInput;
}) {
	return prisma.ticketTag.create({
		data: { organizationId, name: input.name, color: input.color }
	});
}

export async function deleteTicketTag({
	id,
	organizationId
}: {
	id: string;
	organizationId: string;
}) {
	const existing = await prisma.ticketTag.findFirst({ where: { id, organizationId } });
	if (!existing) throw new AppError('Tag not found.', 404, 'TAG_NOT_FOUND');

	return prisma.ticketTag.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Helpdesk settings (per-org email config)
// ---------------------------------------------------------------------------

export async function getHelpdeskSettings(organizationId: string) {
	const settings = await prisma.helpdeskSettings.findUnique({ where: { organizationId } });
	if (!settings) return null;

	return {
		...settings,
		resendApiKey: settings.resendApiKey ? '••••••••' : null,
		inboundWebhookSecret: settings.inboundWebhookSecret ? '••••••••' : null
	};
}

/** Get raw (decrypted) settings for internal use — never expose to the client. */
export async function getHelpdeskSettingsDecrypted(organizationId: string) {
	const settings = await prisma.helpdeskSettings.findUnique({ where: { organizationId } });
	if (!settings) return null;

	return {
		...settings,
		resendApiKey: settings.resendApiKey ? decryptField(settings.resendApiKey) : null,
		inboundWebhookSecret: settings.inboundWebhookSecret ? decryptField(settings.inboundWebhookSecret) : null
	};
}

export async function upsertHelpdeskSettings({
	organizationId,
	input
}: {
	organizationId: string;
	input: HelpdeskSettingsInput;
}) {
	// Preserve existing encrypted values if the UI sends the mask placeholder
	const existing = await prisma.helpdeskSettings.findUnique({
		where: { organizationId },
		select: { resendApiKey: true, inboundWebhookSecret: true }
	});

	const isMasked = (v: string | undefined) => !v || v === '••••••••';

	const data = {
		fromName: input.fromName || null,
		fromEmail: input.fromEmail || null,
		resendApiKey: isMasked(input.resendApiKey)
			? (existing?.resendApiKey ?? null)
			: encryptField(input.resendApiKey!),
		inboundWebhookSecret: isMasked(input.inboundWebhookSecret)
			? (existing?.inboundWebhookSecret ?? null)
			: encryptField(input.inboundWebhookSecret!)
	};

	return prisma.helpdeskSettings.upsert({
		where: { organizationId },
		update: data,
		create: { organizationId, ...data }
	});
}

export async function updateTicketPrefix({
	organizationId,
	input
}: {
	organizationId: string;
	input: OrgTicketSettingsInput;
}) {
	return prisma.organization.update({
		where: { id: organizationId },
		data: { ticketPrefix: input.ticketPrefix }
	});
}
