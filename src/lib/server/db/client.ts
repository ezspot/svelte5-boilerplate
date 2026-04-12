import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '$lib/server/config/env';
import { PrismaClient } from '../../../../generated/prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
	prisma?: PrismaClient;
	pgPool?: Pool;
};

function createPrismaClient() {
	const pool =
		globalForPrisma.pgPool ??
		new Pool({
			connectionString: env.DATABASE_URL,
			max: 20
		});

	if (env.NODE_ENV !== 'production') {
		globalForPrisma.pgPool = pool;
	}

	const adapter = new PrismaPg(pool);

	return new PrismaClient({
		adapter,
		log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
