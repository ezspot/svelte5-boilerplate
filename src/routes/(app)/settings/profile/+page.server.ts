import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { requireAuthenticated } from '$lib/server/auth/permissions';
import { getProfile, updateProfile } from '$lib/server/features/account/service';
import { profileSchema } from '$lib/server/features/account/schema';
import { getErrorMessage } from '$lib/server/core/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	return {
		profile: await getProfile(user.id)
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { user } = requireAuthenticated(event);
		const formData = await event.request.formData();
		const values = {
			name: String(formData.get('name') ?? ''),
			image: String(formData.get('image') ?? '')
		};

		const parsed = profileSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				message: z.prettifyError(parsed.error),
				values
			});
		}

		try {
			await updateProfile({
				userId: user.id,
				input: parsed.data,
				ipAddress: event.getClientAddress(),
				userAgent: event.request.headers.get('user-agent')
			});
		} catch (error) {
			return fail(400, {
				message: getErrorMessage(error, 'Unable to update the profile.'),
				values
			});
		}

		return {
			success: true,
			message: 'Profile updated.',
			values
		};
	}
};
