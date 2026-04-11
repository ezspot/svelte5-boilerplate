export async function getBillingOverview(organizationName: string) {
	return {
		planName: 'Starter',
		status: 'No billing provider connected',
		renewalLabel: 'Add Stripe, Lemon Squeezy, or Paddle behind this boundary.',
		organizationName
	};
}
