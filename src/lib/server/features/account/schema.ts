import { z } from 'zod';

export const profileSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
	image: z.string().trim().url('Use a valid image URL.').optional().or(z.literal(''))
});

export type ProfileInput = z.infer<typeof profileSchema>;
