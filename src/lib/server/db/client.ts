import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '$lib/server/config/env';
import { PrismaClient } from '../../../../generated/prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
	prisma?: PrismaClient;
};

function createPrismaClient() {
	const adapter = new PrismaPg(env.DATABASE_URL);

	return new PrismaClient({
		adapter,
		log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
