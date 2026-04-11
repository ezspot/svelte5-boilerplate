# Svelte 5 SaaS Boilerplate

Production-ready SaaS starter built on:

- Svelte 5
- SvelteKit
- Tailwind CSS 4
- DaisyUI 5
- Lucide Svelte
- Prisma 7
- PostgreSQL
- Better Auth
- Resend

## What Is Included

- Better Auth wired into SvelteKit with server hooks and `event.locals.user` / `event.locals.session`
- Prisma 7 with explicit generated client output and one shared Prisma client
- PostgreSQL schema for auth, organizations, memberships, invitations, audit events, and Resend webhook events
- Resend email service for verification, password reset, and invite emails
- Resend webhook endpoint with signature verification
- Public marketing routes
- Auth routes for login, register, forgot password, verify email, and reset password
- Authenticated app shell with dashboard and settings pages
- Server actions for the main forms
- SSR route protection for authenticated areas

## Architecture Decision

This project uses Architecture A:

- Better Auth with Prisma adapter
- Prisma as the single schema and migration source of truth
- PostgreSQL as the database
- Resend for transactional email

Reason:

- simpler production operations
- one migration workflow
- one ORM
- cleaner developer experience

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Update `.env` with real values.

4. Generate the Prisma client:

```bash
pnpm db:generate
```

5. Apply migrations to your database:

```bash
pnpm db:migrate
```

6. Start the app:

```bash
pnpm dev
```

## Environment Variables

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
TRUSTED_ORIGINS=
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
EMAIL_FROM=
APP_NAME=
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm check
pnpm lint
pnpm format
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:studio
```

## Main Routes

- `/` marketing landing page
- `/pricing` pricing scope page
- `/about` simple project overview
- `/login`
- `/register`
- `/forgot-password`
- `/verify-email`
- `/reset-password`
- `/dashboard`
- `/settings/profile`
- `/settings/security`
- `/settings/organization`
- `/settings/billing`
- `/api/webhooks/resend`

## Important Notes

- Billing is intentionally not integrated yet. The billing service boundary exists, but no Stripe or other provider is connected.
- `@sveltejs/adapter-auto` is still in use because no deployment target was specified. Switch to the correct SvelteKit adapter when you choose a host.
- Prisma migrations are checked in under `prisma/migrations`.
- The generated Prisma client is written to `generated/prisma`.

## Verification

This codebase currently passes:

```bash
pnpm run check
pnpm run lint
pnpm run build
```
