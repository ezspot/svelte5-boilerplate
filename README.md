# Svelte 5 SaaS Boilerplate

Production-ready SaaS starter built with:

- Svelte 5
- SvelteKit
- Tailwind CSS 4
- DaisyUI 5
- Lucide Svelte
- Prisma 7
- PostgreSQL
- Better Auth
- Resend
- Paddle Billing

## Architecture

This project keeps the original application architecture:

- Better Auth with the Prisma adapter
- Prisma as the single schema and migration source of truth
- PostgreSQL for auth and app data
- Resend for transactional email

For billing, the starter now uses a merchant-of-record approach with Paddle.

### Why Paddle here

The two strongest enterprise billing patterns for a SaaS starter in 2026 are:

1. Direct merchant billing:
   Stripe Billing or a similar stack, plus your own tax, compliance, invoice, and portal operations.
2. Merchant of record:
   Paddle or a similar provider, where more tax and compliance handling is delegated to the billing platform.

This starter selects Paddle because it is the better fit for a Europe-first SaaS that wants a clean path to expand into the US without overbuilding tax and compliance operations too early.

## What is included

- Better Auth mounted in SvelteKit hooks
- `event.locals.user` and `event.locals.session`
- Prisma client with explicit generated output and one shared server instance
- PostgreSQL schema for auth, organizations, memberships, invitations, audit events, email webhooks, and billing data
- Resend email verification, password reset, and invitations
- Resend webhook verification endpoint
- Paddle checkout flow for paid plans
- Paddle webhook verification and subscription sync
- Billing portal launch from the app
- Organization-level billing and plan state
- Paid-plan gating for teammate invites
- Marketing routes prerendered where safe
- Authenticated app routes kept SSR and dynamic

## Routes

Public:

- `/`
- `/pricing`
- `/about`
- `/login`
- `/register`
- `/forgot-password`
- `/verify-email`
- `/reset-password`

Authenticated app:

- `/dashboard`
- `/settings/profile`
- `/settings/security`
- `/settings/organization`
- `/settings/billing`
- `/checkout/paddle`

Integration endpoints:

- `/api/webhooks/resend`
- `/api/webhooks/paddle`

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Update `.env` with real values for:

- PostgreSQL
- Better Auth
- Resend
- Paddle

4. Generate Prisma client:

```bash
pnpm db:generate
```

5. Run migrations:

```bash
pnpm db:migrate
```

6. Start the app:

```bash
pnpm dev
```

## Environment variables

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
TRUSTED_ORIGINS=
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
EMAIL_FROM=
APP_NAME=
PADDLE_API_KEY=
PADDLE_ENVIRONMENT=
PADDLE_WEBHOOK_SECRET=
PADDLE_PRICE_STARTER_MONTHLY=
PADDLE_PRICE_GROWTH_MONTHLY=
PUBLIC_PADDLE_CLIENT_TOKEN=
PUBLIC_BILLING_STARTER_PRICE=
PUBLIC_BILLING_GROWTH_PRICE=
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

## Sell-ready baseline

What is ready now:

- user signup and authentication
- email verification and password reset
- organization and membership model
- paid-plan checkout entry
- customer portal entry
- billing webhook syncing
- basic entitlement gating

What is still intentionally out of scope:

- full billing analytics
- advanced seat-based billing
- invoice admin UI
- refunds and support tooling
- tax or finance reporting dashboards
- a live payment provider account configuration

## Verification

This repo currently passes:

```bash
pnpm run check
pnpm run lint
pnpm run build
```

## Deployment note

`@sveltejs/adapter-auto` is still in use because no deployment target has been specified yet. When you choose a platform, switch to the concrete SvelteKit adapter for that host.
