import type { Session, User } from 'better-auth';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}

		interface Locals {
			session: Session | null;
			user: User | null;
		}

		interface PageData {
			session: Session | null;
			user: User | null;
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {};
