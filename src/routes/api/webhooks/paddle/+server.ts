import { json } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/server/core/errors';
import { parsePaddleWebhook, processPaddleWebhook } from '$lib/server/features/billing/service';

export async function POST({ request }) {
	const rawBody = await request.text();

	try {
		const event = await parsePaddleWebhook({
			rawBody,
			signature: request.headers.get('paddle-signature')
		});

		const payload = JSON.parse(rawBody) as unknown;
		const result = await processPaddleWebhook({
			event,
			payload
		});

		return json({
			ok: true,
			duplicate: result.duplicate
		});
	} catch (error) {
		console.error('Paddle webhook processing failed', error);

		return json(
			{
				ok: false,
				message: getErrorMessage(error, 'Unable to process the Paddle webhook.')
			},
			{
				status: 400
			}
		);
	}
}
