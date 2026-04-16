import { createHmac, timingSafeEqual } from 'node:crypto';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/client';
import { logError } from '$lib/server/core/errors';
import { decryptField } from '$lib/server/core/crypto';
import { checkRateLimit } from '$lib/server/core/rate-limit';
import { createEmailTicket } from '$lib/server/features/tickets/service';
import type { RequestHandler } from './$types';

/**
 * Resend inbound email webhook.
 *
 * Each org can configure its own inbound webhook secret via HelpdeskSettings.
 * The `to` address encodes the org slug using plus-addressing:
 *   support+{slug}@yourdomain.com
 */

interface InboundEmailPayload {
	from: string;
	to: string[];
	subject: string;
	text: string;
	html: string;
}

/** Extract org slug from plus-addressed recipient, e.g. support+acme@domain.com → acme */
function parseOrgSlug(toAddresses: string[]): string | null {
	for (const addr of toAddresses) {
		const local = addr.split('@')[0];
		const plusIdx = local.indexOf('+');
		if (plusIdx !== -1) {
			const slug = local.slice(plusIdx + 1).toLowerCase().trim();
			if (slug) return slug;
		}
	}
	return null;
}

/** Extract display name and email from a "Name <email>" or plain email string */
function parseFrom(from: string): { email: string; name: string } {
	const match = from.match(/^(.+?)\s*<(.+?)>$/);
	if (match) return { name: match[1].trim(), email: match[2].trim() };
	return { email: from.trim(), name: from.split('@')[0] };
}

/** Verify per-org webhook secret using HMAC-SHA256 (timing-safe) */
function verifyWebhookSecret(rawBody: string, secret: string, signatureHeader: string | null): boolean {
	if (!signatureHeader) return false;
	const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
	try {
		return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signatureHeader, 'hex'));
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const rl = checkRateLimit(`webhook:inbound:${getClientAddress()}`, 60, 60_000);
	if (rl.limited) {
		return json({ error: 'Rate limited.' }, { status: 429 });
	}

	const rawBody = await request.text();
	let payload: InboundEmailPayload;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const slug = parseOrgSlug(payload.to ?? []);
	if (!slug) {
		return json({ error: 'Could not determine organization from recipient address.' }, { status: 422 });
	}

	const org = await prisma.organization.findUnique({
		where: { slug },
		select: {
			id: true,
			helpdeskSettings: { select: { inboundWebhookSecret: true } }
		}
	});
	if (!org) {
		return json({ error: 'Organization not found.' }, { status: 404 });
	}

	// Validate per-org webhook secret if configured
	const encryptedSecret = org.helpdeskSettings?.inboundWebhookSecret;
	if (encryptedSecret) {
		const secret = decryptField(encryptedSecret);
		if (!secret) {
			return json({ error: 'Webhook secret misconfigured.' }, { status: 500 });
		}
		const signature = request.headers.get('x-webhook-secret');
		if (!verifyWebhookSecret(rawBody, secret, signature)) {
			return json({ error: 'Invalid webhook signature.' }, { status: 401 });
		}
	}

	const { email, name } = parseFrom(payload.from ?? '');
	const body = payload.text || (payload.html ?? '').replace(/<[^>]+>/g, '');

	if (!email) {
		return json({ error: 'Missing sender address.' }, { status: 422 });
	}

	try {
		const ticket = await createEmailTicket({
			organizationId: org.id,
			fromEmail: email,
			fromName: name,
			subject: payload.subject ?? '',
			body: body.slice(0, 10_000)
		});

		return json({ received: true, ticketId: ticket.id });
	} catch (err) {
		logError(err, 'Inbound email webhook failed');
		return json({ error: 'Internal error processing email.' }, { status: 500 });
	}
};
