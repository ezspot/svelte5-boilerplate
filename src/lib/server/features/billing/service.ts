import {
	Environment,
	EventName,
	Paddle,
	type EventEntity,
	type SubscriptionNotification,
	type TransactionNotification
} from '@paddle/paddle-node-sdk';
import type { BillingSubscriptionStatus, Prisma } from '../../../../../generated/prisma/client';
import { prisma } from '$lib/server/db/client';
import { env } from '$lib/server/config/env';
import { AppError } from '$lib/server/core/errors';
import {
	allowsTeamInvites,
	getBillablePlan,
	getBillingPlan,
	getBillingPlans,
	getPlanKeyFromPriceId,
	type BillingPlanKey
} from './plans';

const globalForPaddle = globalThis as typeof globalThis & {
	paddle?: Paddle;
};

function createPaddleClient() {
	return new Paddle(env.PADDLE_API_KEY, {
		environment:
			env.PADDLE_ENVIRONMENT === 'production' ? Environment.production : Environment.sandbox
	});
}

const paddle = globalForPaddle.paddle ?? createPaddleClient();

if (env.NODE_ENV !== 'production') {
	globalForPaddle.paddle = paddle;
}

function toDate(value: string | null | undefined) {
	return value ? new Date(value) : null;
}

function serializePayload(value: unknown) {
	return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function formatSubscriptionStatus(status: BillingSubscriptionStatus | null) {
	switch (status) {
		case 'ACTIVE':
			return 'Active';
		case 'TRIALING':
			return 'Trialing';
		case 'PAST_DUE':
			return 'Past due';
		case 'PAUSED':
			return 'Paused';
		case 'CANCELED':
			return 'Canceled';
		default:
			return 'No active subscription';
	}
}

function mapSubscriptionStatus(status: string): BillingSubscriptionStatus {
	switch (status) {
		case 'active':
			return 'ACTIVE';
		case 'trialing':
			return 'TRIALING';
		case 'past_due':
			return 'PAST_DUE';
		case 'paused':
			return 'PAUSED';
		case 'canceled':
			return 'CANCELED';
		default:
			throw new AppError(
				`Unsupported subscription status: ${status}`,
				400,
				'BILLING_STATUS_INVALID'
			);
	}
}

function getPrimaryPriceId(items: Array<{ price: { id: string } | null }> | undefined) {
	return items?.[0]?.price?.id ?? null;
}

function getTrialEndsAt(
	items:
		| Array<{
				trialDates: {
					endsAt: string;
				} | null;
		  }>
		| undefined
) {
	return toDate(items?.[0]?.trialDates?.endsAt);
}

function getOrganizationIdFromCustomData(customData: unknown) {
	if (!customData || typeof customData !== 'object' || Array.isArray(customData)) {
		return null;
	}

	const organizationId = Reflect.get(customData, 'organizationId');
	return typeof organizationId === 'string' && organizationId.length > 0 ? organizationId : null;
}

async function resolveOrganizationId({
	customerId,
	subscriptionId,
	customData
}: {
	customerId?: string | null;
	subscriptionId?: string | null;
	customData?: unknown;
}) {
	const organizationId = getOrganizationIdFromCustomData(customData);

	if (organizationId) {
		return organizationId;
	}

	if (customerId) {
		const customer = await prisma.billingCustomer.findUnique({
			where: { providerCustomerId: customerId },
			select: { organizationId: true }
		});

		if (customer) {
			return customer.organizationId;
		}
	}

	if (subscriptionId) {
		const subscription = await prisma.billingSubscription.findUnique({
			where: { providerSubscriptionId: subscriptionId },
			select: { organizationId: true }
		});

		return subscription?.organizationId ?? null;
	}

	return null;
}

async function ensureBillingCustomer({
	organizationId,
	customerEmail,
	customerName
}: {
	organizationId: string;
	customerEmail: string;
	customerName: string;
}) {
	const existing = await prisma.billingCustomer.findUnique({
		where: { organizationId }
	});

	if (existing) {
		if (existing.email !== customerEmail || existing.name !== customerName) {
			return prisma.billingCustomer.update({
				where: { id: existing.id },
				data: {
					email: customerEmail,
					name: customerName
				}
			});
		}

		return existing;
	}

	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			slug: true
		}
	});

	if (!organization) {
		throw new AppError('Workspace not found.', 404, 'ORG_NOT_FOUND');
	}

	const customer = await paddle.customers.create({
		email: customerEmail,
		name: customerName,
		customData: {
			organizationId,
			organizationSlug: organization.slug
		}
	});

	return prisma.billingCustomer.create({
		data: {
			organizationId,
			providerCustomerId: customer.id,
			email: customerEmail,
			name: customerName
		}
	});
}

async function syncBillingCustomer({
	organizationId,
	customerId
}: {
	organizationId: string;
	customerId: string | null;
}) {
	if (!customerId) {
		return;
	}

	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			name: true,
			billingEmail: true,
			owner: {
				select: {
					email: true
				}
			}
		}
	});

	if (!organization) {
		return;
	}

	await prisma.billingCustomer.upsert({
		where: { organizationId },
		update: {
			providerCustomerId: customerId,
			email: organization.billingEmail ?? organization.owner.email,
			name: organization.name
		},
		create: {
			organizationId,
			providerCustomerId: customerId,
			email: organization.billingEmail ?? organization.owner.email,
			name: organization.name
		}
	});
}

async function upsertSubscriptionRecord({
	organizationId,
	customerId,
	subscriptionId,
	transactionId,
	priceId,
	status,
	currencyCode,
	quantity,
	currentPeriodStartsAt,
	currentPeriodEndsAt,
	nextBilledAt,
	trialEndsAt,
	cancelAtPeriodEnd,
	canceledAt
}: {
	organizationId: string;
	customerId: string | null;
	subscriptionId: string;
	transactionId: string | null;
	priceId: string;
	status: BillingSubscriptionStatus;
	currencyCode: string;
	quantity: number;
	currentPeriodStartsAt: Date | null;
	currentPeriodEndsAt: Date | null;
	nextBilledAt: Date | null;
	trialEndsAt: Date | null;
	cancelAtPeriodEnd: boolean;
	canceledAt: Date | null;
}) {
	const planKey = getPlanKeyFromPriceId(priceId);

	if (!planKey) {
		throw new AppError(
			'The Paddle price is not mapped to a local plan.',
			400,
			'PLAN_PRICE_UNMAPPED'
		);
	}

	await prisma.$transaction(async (tx) => {
		await tx.billingSubscription.upsert({
			where: { organizationId },
			update: {
				providerSubscriptionId: subscriptionId,
				providerTransactionId: transactionId,
				providerPriceId: priceId,
				planKey,
				status,
				currencyCode,
				quantity,
				currentPeriodStartsAt,
				currentPeriodEndsAt,
				nextBilledAt,
				trialEndsAt,
				cancelAtPeriodEnd,
				canceledAt
			},
			create: {
				organizationId,
				providerSubscriptionId: subscriptionId,
				providerTransactionId: transactionId,
				providerPriceId: priceId,
				planKey,
				status,
				currencyCode,
				quantity,
				currentPeriodStartsAt,
				currentPeriodEndsAt,
				nextBilledAt,
				trialEndsAt,
				cancelAtPeriodEnd,
				canceledAt
			}
		});

		await tx.organization.update({
			where: { id: organizationId },
			data: {
				planKey: status === 'CANCELED' ? 'free' : planKey
			}
		});
	});

	await syncBillingCustomer({
		organizationId,
		customerId
	});
}

async function syncSubscriptionNotification(
	organizationId: string,
	notification: SubscriptionNotification
) {
	const priceId = getPrimaryPriceId(notification.items);

	if (!priceId) {
		throw new AppError(
			'Subscription notification is missing a price.',
			400,
			'SUBSCRIPTION_PRICE_MISSING'
		);
	}

	await upsertSubscriptionRecord({
		organizationId,
		customerId: notification.customerId,
		subscriptionId: notification.id,
		transactionId: null,
		priceId,
		status: mapSubscriptionStatus(notification.status),
		currencyCode: notification.currencyCode,
		quantity: notification.items[0]?.quantity ?? 1,
		currentPeriodStartsAt: toDate(notification.currentBillingPeriod?.startsAt),
		currentPeriodEndsAt: toDate(notification.currentBillingPeriod?.endsAt),
		nextBilledAt: toDate(notification.nextBilledAt),
		trialEndsAt: getTrialEndsAt(notification.items),
		cancelAtPeriodEnd: notification.scheduledChange?.action === 'cancel',
		canceledAt: toDate(notification.canceledAt)
	});
}

async function syncTransactionNotification(
	organizationId: string,
	notification: TransactionNotification
) {
	if (!notification.subscriptionId) {
		await syncBillingCustomer({
			organizationId,
			customerId: notification.customerId
		});
		return;
	}

	const priceId = getPrimaryPriceId(notification.items);

	if (!priceId) {
		return;
	}

	await upsertSubscriptionRecord({
		organizationId,
		customerId: notification.customerId,
		subscriptionId: notification.subscriptionId,
		transactionId: notification.id,
		priceId,
		status:
			notification.status === 'past_due'
				? 'PAST_DUE'
				: notification.status === 'canceled'
					? 'CANCELED'
					: 'ACTIVE',
		currencyCode: notification.currencyCode,
		quantity: notification.items[0]?.quantity ?? 1,
		currentPeriodStartsAt: toDate(notification.billingPeriod?.startsAt),
		currentPeriodEndsAt: toDate(notification.billingPeriod?.endsAt),
		nextBilledAt: toDate(notification.billingPeriod?.endsAt),
		trialEndsAt: null,
		cancelAtPeriodEnd: false,
		canceledAt: notification.status === 'canceled' ? toDate(notification.updatedAt) : null
	});
}

export async function getBillingOverview(organizationId: string) {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		include: {
			billingCustomer: true,
			billingSubscription: true
		}
	});

	if (!organization) {
		throw new AppError('Workspace not found.', 404, 'ORG_NOT_FOUND');
	}

	const currentPlanKey = (organization.planKey as BillingPlanKey) ?? 'free';
	const currentPlan = getBillingPlan(currentPlanKey);
	const subscription = organization.billingSubscription;

	return {
		currentPlan,
		statusLabel: formatSubscriptionStatus(subscription?.status ?? null),
		renewalAt: subscription?.nextBilledAt ?? subscription?.currentPeriodEndsAt ?? null,
		trialEndsAt: subscription?.trialEndsAt ?? null,
		billingEmail: organization.billingEmail ?? organization.billingCustomer?.email ?? null,
		customerPortalAvailable: Boolean(
			organization.billingCustomer?.providerCustomerId && subscription?.providerSubscriptionId
		),
		allowsTeamInvites: allowsTeamInvites(currentPlan.key),
		subscription: subscription
			? {
					status: subscription.status,
					cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
					currentPeriodEndsAt: subscription.currentPeriodEndsAt,
					nextBilledAt: subscription.nextBilledAt,
					currencyCode: subscription.currencyCode,
					planKey: subscription.planKey
				}
			: null,
		plans: getBillingPlans().map((plan) => ({
			...plan,
			isCurrent: plan.key === currentPlan.key,
			canStartCheckout:
				plan.key !== 'free' &&
				!subscription?.providerSubscriptionId &&
				organization.planKey === 'free'
		}))
	};
}

export async function createCheckoutSession({
	organizationId,
	actorUserId,
	actorEmail,
	organizationName,
	planKey
}: {
	organizationId: string;
	actorUserId: string;
	actorEmail: string;
	organizationName: string;
	planKey: Exclude<BillingPlanKey, 'free'>;
}) {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		include: {
			billingCustomer: true,
			billingSubscription: true
		}
	});

	if (!organization) {
		throw new AppError('Workspace not found.', 404, 'ORG_NOT_FOUND');
	}

	if (organization.billingSubscription && organization.billingSubscription.status !== 'CANCELED') {
		throw new AppError(
			'This workspace already has a managed subscription. Use the billing portal to change it.',
			409,
			'SUBSCRIPTION_ALREADY_EXISTS'
		);
	}

	const plan = getBillablePlan(planKey);
	const customer = await ensureBillingCustomer({
		organizationId,
		customerEmail: organization.billingEmail ?? actorEmail,
		customerName: organizationName
	});

	const transaction = await paddle.transactions.create({
		items: [
			{
				priceId: plan.priceId!,
				quantity: 1
			}
		],
		customerId: customer.providerCustomerId,
		customData: {
			organizationId,
			planKey,
			actorUserId
		}
	});

	if (!transaction.checkout?.url) {
		throw new AppError('Paddle did not return a checkout URL.', 502, 'CHECKOUT_URL_MISSING');
	}

	await prisma.auditEvent.create({
		data: {
			organizationId,
			actorUserId,
			type: 'billing.checkout.created',
			targetType: 'billing.transaction',
			targetId: transaction.id,
			payload: {
				planKey,
				provider: 'paddle'
			}
		}
	});

	return {
		transactionId: transaction.id,
		checkoutUrl: transaction.checkout.url,
		plan
	};
}

export async function createCustomerPortalLink({
	organizationId,
	actorUserId
}: {
	organizationId: string;
	actorUserId: string;
}) {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		include: {
			billingCustomer: true,
			billingSubscription: true
		}
	});

	if (!organization?.billingCustomer || !organization.billingSubscription) {
		throw new AppError(
			'This workspace does not have a managed subscription yet.',
			404,
			'PORTAL_UNAVAILABLE'
		);
	}

	const session = await paddle.customerPortalSessions.create(
		organization.billingCustomer.providerCustomerId,
		[organization.billingSubscription.providerSubscriptionId]
	);

	await prisma.auditEvent.create({
		data: {
			organizationId,
			actorUserId,
			type: 'billing.portal.created',
			targetType: 'billing.subscription',
			targetId: organization.billingSubscription.id,
			payload: {
				provider: 'paddle'
			}
		}
	});

	return session.urls.general.overview;
}

export async function parsePaddleWebhook({
	rawBody,
	signature
}: {
	rawBody: string;
	signature: string | null;
}) {
	if (!signature) {
		throw new AppError('Missing Paddle webhook signature.', 400, 'WEBHOOK_SIGNATURE_MISSING');
	}

	return paddle.webhooks.unmarshal(rawBody, env.PADDLE_WEBHOOK_SECRET, signature);
}

export async function processPaddleWebhook({
	event,
	payload
}: {
	event: EventEntity;
	payload: unknown;
}) {
	const existingEvent = await prisma.billingWebhookEvent.findUnique({
		where: {
			providerEventId: event.eventId
		},
		select: {
			id: true
		}
	});

	if (existingEvent) {
		return {
			duplicate: true
		};
	}

	const eventPayload = serializePayload(payload);
	const data = event.data as unknown as Record<string, unknown>;
	const customerId = typeof data.customerId === 'string' ? data.customerId : null;
	const subscriptionId =
		typeof data.id === 'string' && event.eventType.startsWith('subscription.')
			? data.id
			: typeof data.subscriptionId === 'string'
				? data.subscriptionId
				: null;
	const organizationId = await resolveOrganizationId({
		customerId,
		subscriptionId,
		customData: data.customData
	});

	await prisma.billingWebhookEvent.create({
		data: {
			organizationId,
			providerEventId: event.eventId,
			eventType: event.eventType,
			payload: eventPayload
		}
	});

	switch (event.eventType) {
		case EventName.SubscriptionActivated:
		case EventName.SubscriptionCanceled:
		case EventName.SubscriptionCreated:
		case EventName.SubscriptionPastDue:
		case EventName.SubscriptionPaused:
		case EventName.SubscriptionResumed:
		case EventName.SubscriptionTrialing:
		case EventName.SubscriptionUpdated:
			if (organizationId) {
				await syncSubscriptionNotification(organizationId, event.data as SubscriptionNotification);
			}
			break;
		case EventName.TransactionBilled:
		case EventName.TransactionCompleted:
		case EventName.TransactionPaid:
		case EventName.TransactionPastDue:
		case EventName.TransactionUpdated:
			if (organizationId) {
				await syncTransactionNotification(organizationId, event.data as TransactionNotification);
			}
			break;
		default:
			break;
	}

	await prisma.billingWebhookEvent.update({
		where: {
			providerEventId: event.eventId
		},
		data: {
			processedAt: new Date()
		}
	});

	return {
		duplicate: false
	};
}
