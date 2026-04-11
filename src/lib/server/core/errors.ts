import { APIError } from 'better-auth';

export class AppError extends Error {
	constructor(
		message: string,
		public readonly status = 500,
		public readonly code?: string
	) {
		super(message);
		this.name = 'AppError';
	}
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
	if (error instanceof APIError) {
		return error.body?.message ?? error.message ?? fallback;
	}

	if (error instanceof AppError) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallback;
}
