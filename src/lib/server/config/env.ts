import { loadEnvFile } from 'node:process';
import { z } from 'zod';

loadEnvFile();

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	DATABASE_URL: z
		.string()
		.min(1)
		.refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
			message: 'DATABASE_URL must be a PostgreSQL connection string.'
		}),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string().url(),
	TRUSTED_ORIGINS: z.string().optional(),
	RESEND_API_KEY: z.string().min(1),
	RESEND_WEBHOOK_SECRET: z.string().min(1),
	EMAIL_FROM: z.string().min(1),
	APP_NAME: z.string().min(1).default('Acme SaaS'),
	PADDLE_API_KEY: z.string().min(1),
	PADDLE_ENVIRONMENT: z.enum(['sandbox', 'production']),
	PADDLE_WEBHOOK_SECRET: z.string().min(1),
	PADDLE_PRICE_STARTER_MONTHLY: z.string().min(1),
	PADDLE_PRICE_GROWTH_MONTHLY: z.string().min(1),
	PUBLIC_PADDLE_CLIENT_TOKEN: z.string().min(1),
	PUBLIC_BILLING_STARTER_PRICE: z.string().min(1),
	PUBLIC_BILLING_GROWTH_PRICE: z.string().min(1)
});

type ParsedEnv = Omit<z.infer<typeof envSchema>, 'TRUSTED_ORIGINS'> & {
	TRUSTED_ORIGINS: string[];
};

let cachedEnv: ParsedEnv | undefined;

function parseEnv(): ParsedEnv {
	const raw = envSchema.parse(process.env);
	const { TRUSTED_ORIGINS, ...rest } = raw;

	return {
		...rest,
		TRUSTED_ORIGINS: TRUSTED_ORIGINS
			? TRUSTED_ORIGINS.split(',')
					.map((value) => value.trim())
					.filter(Boolean)
			: [raw.BETTER_AUTH_URL]
	};
}

export const env = (() => {
	cachedEnv ??= parseEnv();
	return cachedEnv;
})();
