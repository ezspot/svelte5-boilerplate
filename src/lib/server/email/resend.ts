import { createHash } from 'node:crypto';
import { Resend, type WebhookEventPayload } from 'resend';
import { env } from '$lib/server/config/env';
import { AppError } from '$lib/server/core/errors';
import { buildInvitationEmail } from './templates/invitation';
import { buildMagicLinkEmail } from './templates/magic-link';
import { buildPasswordResetEmail } from './templates/password-reset';
import { buildTicketCreatedEmail } from './templates/ticket-created';
import { buildTicketReplyEmail } from './templates/ticket-reply';
import { buildVerificationEmail } from './templates/verification';

const platformResend = new Resend(env.RESEND_API_KEY);

function createIdempotencyKey(namespace: string, fingerprint: string) {
	const digest = createHash('sha256').update(fingerprint).digest('hex');
	return `${namespace}:${digest.slice(0, 48)}`;
}

export interface OrgEmailConfig {
	resendApiKey?: string | null;
	fromEmail?: string | null;
	fromName?: string | null;
}

function getResendClient(orgConfig?: OrgEmailConfig | null): Resend {
	if (orgConfig?.resendApiKey) {
		return new Resend(orgConfig.resendApiKey);
	}
	return platformResend;
}

function getFromAddress(orgConfig?: OrgEmailConfig | null): string {
	if (orgConfig?.fromEmail) {
		return orgConfig.fromName
			? `${orgConfig.fromName} <${orgConfig.fromEmail}>`
			: orgConfig.fromEmail;
	}
	return env.EMAIL_FROM;
}

async function sendTransactionalEmail({
	to,
	subject,
	html,
	text,
	namespace,
	fingerprint,
	tags,
	orgConfig
}: {
	to: string;
	subject: string;
	html: string;
	text: string;
	namespace: string;
	fingerprint: string;
	tags: { name: string; value: string }[];
	orgConfig?: OrgEmailConfig | null;
}) {
	const client = getResendClient(orgConfig);
	const from = getFromAddress(orgConfig);

	const response = await client.emails.send(
		{
			from,
			to,
			subject,
			html,
			text,
			tags
		},
		{
			idempotencyKey: createIdempotencyKey(namespace, fingerprint)
		}
	);

	if (response.error) {
		throw new AppError(
			response.error.message,
			response.error.statusCode ?? 500,
			response.error.name
		);
	}

	return response.data.id;
}

export async function sendVerificationEmail({
	to,
	name,
	url,
	token
}: {
	to: string;
	name: string;
	url: string;
	token: string;
}) {
	const message = buildVerificationEmail({
		appName: env.APP_NAME,
		name,
		url
	});

	return sendTransactionalEmail({
		to,
		subject: message.subject,
		html: message.html,
		text: message.text,
		namespace: 'verify',
		fingerprint: `${to}:${token}`,
		tags: [{ name: 'flow', value: 'verification' }]
	});
}

export async function sendMagicLinkEmail({
	to,
	name,
	url,
	token,
	intent
}: {
	to: string;
	name?: string | null;
	url: string;
	token: string;
	intent: 'signin' | 'signup';
}) {
	const message = buildMagicLinkEmail({
		appName: env.APP_NAME,
		name,
		url,
		intent
	});

	return sendTransactionalEmail({
		to,
		subject: message.subject,
		html: message.html,
		text: message.text,
		namespace: 'magic-link',
		fingerprint: `${to}:${intent}:${token}`,
		tags: [{ name: 'flow', value: 'magic-link' }]
	});
}

export async function sendPasswordResetEmail({
	to,
	name,
	url,
	token
}: {
	to: string;
	name: string;
	url: string;
	token: string;
}) {
	const message = buildPasswordResetEmail({
		appName: env.APP_NAME,
		name,
		url
	});

	return sendTransactionalEmail({
		to,
		subject: message.subject,
		html: message.html,
		text: message.text,
		namespace: 'reset',
		fingerprint: `${to}:${token}`,
		tags: [{ name: 'flow', value: 'password-reset' }]
	});
}

export async function sendOrganizationInviteEmail({
	to,
	inviterName,
	organizationName,
	url,
	token
}: {
	to: string;
	inviterName: string;
	organizationName: string;
	url: string;
	token: string;
}) {
	const message = buildInvitationEmail({
		appName: env.APP_NAME,
		organizationName,
		inviterName,
		url
	});

	return sendTransactionalEmail({
		to,
		subject: message.subject,
		html: message.html,
		text: message.text,
		namespace: 'invite',
		fingerprint: `${organizationName}:${to}:${token}`,
		tags: [{ name: 'flow', value: 'organization-invite' }]
	});
}

export async function sendTicketCreatedEmail({
	to,
	orgName,
	orgSlug,
	displayId,
	title,
	publicId,
	orgConfig
}: {
	to: string;
	orgName: string;
	orgSlug: string;
	displayId: string;
	title: string;
	publicId: string;
	orgConfig?: OrgEmailConfig | null;
}) {
	const portalUrl = `${env.BETTER_AUTH_URL}/portal/${orgSlug}/ticket/${publicId}`;
	const message = buildTicketCreatedEmail({
		appName: env.APP_NAME,
		orgName,
		displayId,
		title,
		portalUrl
	});

	return sendTransactionalEmail({
		to,
		subject: message.subject,
		html: message.html,
		text: message.text,
		namespace: 'ticket-created',
		fingerprint: `${orgSlug}:${displayId}:${to}`,
		tags: [
			{ name: 'flow', value: 'ticket-created' },
			{ name: 'ticket', value: displayId }
		],
		orgConfig
	});
}

export async function sendTicketReplyEmail({
	to,
	orgName,
	orgSlug,
	displayId,
	title,
	publicId,
	replierName,
	bodyPreview,
	orgConfig
}: {
	to: string;
	orgName: string;
	orgSlug: string;
	displayId: string;
	title: string;
	publicId: string;
	replierName: string;
	bodyPreview: string;
	orgConfig?: OrgEmailConfig | null;
}) {
	const portalUrl = `${env.BETTER_AUTH_URL}/portal/${orgSlug}/ticket/${publicId}`;
	const message = buildTicketReplyEmail({
		appName: env.APP_NAME,
		orgName,
		displayId,
		title,
		replierName,
		bodyPreview,
		portalUrl
	});

	return sendTransactionalEmail({
		to,
		subject: message.subject,
		html: message.html,
		text: message.text,
		namespace: 'ticket-reply',
		fingerprint: `${orgSlug}:${displayId}:${Date.now()}`,
		tags: [
			{ name: 'flow', value: 'ticket-reply' },
			{ name: 'ticket', value: displayId }
		],
		orgConfig
	});
}

export function verifyResendWebhook(payload: string, headers: Headers): WebhookEventPayload {
	const id = headers.get('svix-id');
	const timestamp = headers.get('svix-timestamp');
	const signature = headers.get('svix-signature');

	if (!id || !timestamp || !signature) {
		throw new AppError('Missing Resend webhook headers.', 400, 'INVALID_WEBHOOK_HEADERS');
	}

	return platformResend.webhooks.verify({
		payload,
		webhookSecret: env.RESEND_WEBHOOK_SECRET,
		headers: {
			id,
			timestamp,
			signature
		}
	});
}
