import { env } from '$lib/server/config/env';

export type BillingPlanKey = 'free' | 'starter' | 'growth';

export type BillingPlan = {
	key: BillingPlanKey;
	name: string;
	priceLabel: string;
	description: string;
	features: string[];
	ctaLabel: string;
	priceId: string | null;
	highlighted: boolean;
	allowsTeamInvites: boolean;
};

export function getBillingPlans(): BillingPlan[] {
	return [
		{
			key: 'free',
			name: 'Free',
			priceLabel: 'EUR 0',
			description: 'Production baseline for a founder or solo operator.',
			features: [
				'One workspace owner',
				'Authentication and transactional email',
				'Dashboard, profile, security, and audit trail'
			],
			ctaLabel: 'Included',
			priceId: null,
			highlighted: false,
			allowsTeamInvites: false
		},
		{
			key: 'starter',
			name: 'Starter',
			priceLabel: env.PUBLIC_BILLING_STARTER_PRICE,
			description: 'First paid plan for small teams that need collaboration and billing controls.',
			features: [
				'Team invitations and workspace members',
				'Hosted checkout and customer portal',
				'Subscription lifecycle synced by webhooks'
			],
			ctaLabel: 'Start Starter',
			priceId: env.PADDLE_PRICE_STARTER_MONTHLY,
			highlighted: true,
			allowsTeamInvites: true
		},
		{
			key: 'growth',
			name: 'Growth',
			priceLabel: env.PUBLIC_BILLING_GROWTH_PRICE,
			description: 'Commercial plan for larger teams that need room to scale across markets.',
			features: [
				'Everything in Starter',
				'Stronger upgrade path for Europe and US expansion',
				'Prepared boundary for advanced billing controls later'
			],
			ctaLabel: 'Start Growth',
			priceId: env.PADDLE_PRICE_GROWTH_MONTHLY,
			highlighted: false,
			allowsTeamInvites: true
		}
	];
}

export function getBillingPlan(planKey: BillingPlanKey) {
	const plan = getBillingPlans().find((item) => item.key === planKey);

	if (!plan) {
		throw new Error(`Unknown billing plan: ${planKey}`);
	}

	return plan;
}

export function getBillablePlan(planKey: Exclude<BillingPlanKey, 'free'>) {
	return getBillingPlan(planKey);
}

export function getPlanKeyFromPriceId(priceId: string): BillingPlanKey | null {
	const plan = getBillingPlans().find((item) => item.priceId === priceId);
	return plan?.key ?? null;
}

export function allowsTeamInvites(planKey: string) {
	return getBillingPlans().some((plan) => plan.key === planKey && plan.allowsTeamInvites);
}

export function isPaidPlan(planKey: string) {
	return planKey === 'starter' || planKey === 'growth';
}
