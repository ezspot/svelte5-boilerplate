import { json } from '@sveltejs/kit';
import { AppError } from '$lib/server/core/errors';
import { prisma } from '$lib/server/db/client';
import { verifyResendWebhook } from '$lib/server/email/resend';
import type { Prisma } from '../../../../../generated/prisma/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const rawPayload = await request.text();

	try {
		const event = verifyResendWebhook(rawPayload, request.headers);
		const parsedPayload = JSON.parse(rawPayload) as Prisma.InputJsonValue;
		const externalId = request.headers.get('svix-id');

		if (!externalId) {
			throw new AppError('Missing webhook event id.', 400, 'INVALID_WEBHOOK_HEADERS');
		}

		const resendEmailId =
			'data' in event && event.data && typeof event.data === 'object' && 'email_id' in event.data
				? String(event.data.email_id)
				: null;

		await prisma.emailWebhookEvent.upsert({
			where: { externalId },
			update: {
				type: event.type,
				resendEmailId,
				payload: parsedPayload,
				processedAt: new Date()
			},
			create: {
				externalId,
				type: event.type,
				resendEmailId,
				payload: parsedPayload
			}
		});

		return json({ received: true });
	} catch (error) {
		const status = error instanceof AppError ? error.status : 400;
		return json({ received: false }, { status });
	}
};
