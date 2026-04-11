import { z } from 'zod';

export const organizationNameSchema = z.object({
	name: z.string().trim().min(2, 'Workspace name must be at least 2 characters.').max(80)
});

export const invitationSchema = z.object({
	email: z.email('Use a valid email address.'),
	role: z.enum(['ADMIN', 'MEMBER'])
});

export type OrganizationNameInput = z.infer<typeof organizationNameSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
