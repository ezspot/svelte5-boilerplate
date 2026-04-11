import { createHash } from 'node:crypto';
import { Resend, type WebhookEventPayload } from 'resend';
import { env } from '$lib/server/config/env';
import { AppError } from '$lib/server/core/errors';
import { buildInvitationEmail } from './templates/invitation';
import { buildPasswordResetEmail } from './templates/password-reset';
import { buildVerificationEmail } from './templates/verification';

const resend = new Resend(env.RESEND_API_KEY);

function createIdempotencyKey(namespace: string, fingerprint: string) {
	const digest = createHash('sha256').update(fingerprint).digest('hex');
	return `${namespace}:${digest.slice(0, 48)}`;
}

async function sendTransactionalEmail({
	to,
	subject,
	html,
	text,
	namespace,
	fingerprint,
	tags
}: {
	to: string;
	subject: string;
	html: string;
	text: string;
	namespace: string;
	fingerprint: string;
	tags: { name: string; value: string }[];
}) {
	const response = await resend.emails.send(
		{
			from: env.EMAIL_FROM,
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

export function verifyResendWebhook(payload: string, headers: Headers): WebhookEventPayload {
	const id = headers.get('svix-id');
	const timestamp = headers.get('svix-timestamp');
	const signature = headers.get('svix-signature');

	if (!id || !timestamp || !signature) {
		throw new AppError('Missing Resend webhook headers.', 400, 'INVALID_WEBHOOK_HEADERS');
	}

	return resend.webhooks.verify({
		payload,
		webhookSecret: env.RESEND_WEBHOOK_SECRET,
		headers: {
			id,
			timestamp,
			signature
		}
	});
}
