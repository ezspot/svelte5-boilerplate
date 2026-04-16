import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/client';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
	const organization = await prisma.organization.findUnique({
		where: { slug: params.orgSlug },
		select: { id: true, name: true, slug: true }
	});

	if (!organization) throw error(404, 'Organization not found.');

	return { organization };
};
