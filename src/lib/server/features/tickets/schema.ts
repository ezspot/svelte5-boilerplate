import { z } from 'zod';

// --- Contacts ---

export const createContactSchema = z.object({
	email: z.string().trim().email('Valid email is required.').max(320),
	name: z.string().trim().min(1, 'Name is required.').max(200),
	phone: z.string().trim().max(50).optional().or(z.literal('')),
	company: z.string().trim().max(200).optional().or(z.literal(''))
});

export const updateContactSchema = z.object({
	name: z.string().trim().min(1, 'Name is required.').max(200).optional(),
	phone: z.string().trim().max(50).optional().or(z.literal('')),
	company: z.string().trim().max(200).optional().or(z.literal(''))
});

// --- Tickets ---

export const createTicketSchema = z.object({
	title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200),
	description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(5000),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
	channel: z.enum(['PORTAL', 'EMAIL', 'PHONE', 'MANUAL']).default('MANUAL'),
	contactId: z.string().min(1, 'Contact is required.'),
	assignedToId: z.string().optional().or(z.literal(''))
});

export const portalTicketSchema = z.object({
	title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200),
	description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(5000),
	contactEmail: z.string().trim().email('Valid email is required.').max(320),
	contactName: z.string().trim().min(1, 'Name is required.').max(200)
});

export const updateTicketSchema = z.object({
	status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
	assignedToId: z.string().optional().or(z.literal(''))
});

export const ticketCommentSchema = z.object({
	body: z.string().trim().min(1, 'Comment cannot be empty.').max(5000),
	internal: z
		.string()
		.optional()
		.transform((v) => v === 'on')
});

// --- Canned responses ---

export const cannedResponseSchema = z.object({
	title: z.string().trim().min(1, 'Title is required.').max(200),
	body: z.string().trim().min(1, 'Body is required.').max(5000),
	shortcut: z.string().trim().max(50).optional().or(z.literal(''))
});

// --- SLA policies ---

export const slaPolicySchema = z.object({
	name: z.string().trim().min(1, 'Name is required.').max(100),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
	firstResponseMinutes: z.coerce.number().int().min(1, 'Must be at least 1 minute.'),
	resolutionMinutes: z.coerce.number().int().min(1, 'Must be at least 1 minute.'),
	isDefault: z
		.string()
		.optional()
		.transform((v) => v === 'on')
});

// --- Tags ---

export const ticketTagSchema = z.object({
	name: z.string().trim().min(1, 'Tag name is required.').max(50),
	color: z
		.string()
		.trim()
		.regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color.')
		.default('#6b7280')
});

// --- Helpdesk settings ---

export const helpdeskSettingsSchema = z.object({
	fromName: z.string().trim().max(200).optional().or(z.literal('')),
	fromEmail: z.string().trim().email('Must be a valid email.').max(320).optional().or(z.literal('')),
	resendApiKey: z.string().trim().max(200).optional().or(z.literal('')),
	inboundWebhookSecret: z.string().trim().max(200).optional().or(z.literal(''))
});

// --- Organization settings ---

export const orgTicketSettingsSchema = z.object({
	ticketPrefix: z
		.string()
		.trim()
		.min(2, 'Prefix must be at least 2 characters.')
		.max(10, 'Prefix must be at most 10 characters.')
		.regex(/^[A-Z0-9]+$/, 'Prefix must be uppercase alphanumeric.')
});

// --- Types ---

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type PortalTicketInput = z.infer<typeof portalTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type TicketCommentInput = z.infer<typeof ticketCommentSchema>;
export type CannedResponseInput = z.infer<typeof cannedResponseSchema>;
export type SlaPolicyInput = z.infer<typeof slaPolicySchema>;
export type TicketTagInput = z.infer<typeof ticketTagSchema>;
export type HelpdeskSettingsInput = z.infer<typeof helpdeskSettingsSchema>;
export type OrgTicketSettingsInput = z.infer<typeof orgTicketSettingsSchema>;
