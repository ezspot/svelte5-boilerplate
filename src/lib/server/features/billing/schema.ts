import { z } from 'zod';

export const billingCheckoutSchema = z.object({
	planKey: z.enum(['starter', 'growth'])
});
