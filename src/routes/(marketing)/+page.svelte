<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		ArrowRight,
		BadgeCheck,
		Building2,
		ChartNoAxesColumn,
		LockKeyhole,
		MailCheck,
		ServerCog
	} from '@lucide/svelte';

	const pillars = [
		{
			title: 'Identity that fits a real product',
			copy: 'Better Auth, secure cookies, email verification, and server-first actions are already shaped for a production team.',
			icon: LockKeyhole
		},
		{
			title: 'A database model that stays boring in the right way',
			copy: 'Prisma owns the schema, migrations, and generated client while PostgreSQL holds both auth and app state.',
			icon: ServerCog
		},
		{
			title: 'Operational messaging without vendor sprawl',
			copy: 'Verification, reset, invite, and webhook handling are separated into deliberate email services.',
			icon: MailCheck
		},
		{
			title: 'SaaS building blocks with room to grow',
			copy: 'Organizations, billing, memberships, and audit events are present without locking the product into a rigid shape.',
			icon: Building2
		}
	];

	const faqItems = [
		{
			question: 'Is this a marketing-only starter?',
			answer:
				'No. The marketing layer is small on purpose. The real value is the authenticated app shell, auth wiring, database model, billing boundary, and operational services.'
		},
		{
			question: 'Can this run as a Europe-first SaaS?',
			answer:
				'Yes. The current billing baseline is designed for a Europe-first launch while keeping the architecture simple enough to expand into the US.'
		},
		{
			question: 'How much is intentionally left out?',
			answer:
				'Anything too product-specific stays out. The starter solves platform concerns well, then leaves your actual domain features to your team.'
		}
	];
</script>

<svelte:head>
	<title>Acme SaaS | Production-ready SvelteKit boilerplate</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-10">
	<div class="hero-surface overflow-hidden px-6 py-8 md:px-10 md:py-12">
		<div class="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
			<div>
				<p class="eyebrow">Svelte 5 SaaS starter</p>
				<h1 class="mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold text-balance md:text-6xl">
					A calmer, sharper baseline for teams shipping software that has to last.
				</h1>
				<p class="section-copy mt-6 max-w-2xl text-base md:text-[1.02rem]">
					Enterprise-ready foundations for auth, billing, email, and multi-tenant product surfaces,
					delivered in a server-first SvelteKit architecture that still feels light to work in.
				</p>

				<div class="mt-8 flex flex-wrap gap-3">
					<a class="btn rounded-full px-6 btn-primary" href={resolve('/register')}>
						Start building
						<ArrowRight size={16} />
					</a>
					<a class="btn rounded-full px-6 btn-ghost" href={resolve('/pricing')}>Review pricing</a>
				</div>

				<div class="metric-grid mt-8">
					<div class="surface-panel-muted p-4">
						<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
							Auth model
						</p>
						<p class="mt-3 text-lg font-semibold">Verify first</p>
						<p class="mt-2 text-sm text-base-content/68">
							Auto sign-in happens after trusted email verification.
						</p>
					</div>
					<div class="surface-panel-muted p-4">
						<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
							Data layer
						</p>
						<p class="mt-3 text-lg font-semibold">One schema</p>
						<p class="mt-2 text-sm text-base-content/68">
							Prisma stays the single source of truth for the baseline.
						</p>
					</div>
					<div class="surface-panel-muted p-4">
						<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
							Billing stance
						</p>
						<p class="mt-3 text-lg font-semibold">Europe first</p>
						<p class="mt-2 text-sm text-base-content/68">
							Merchant-of-record billing reduces early operational drag.
						</p>
					</div>
				</div>
			</div>

			<div class="surface-panel relative overflow-hidden p-7 md:p-8">
				<div class="absolute inset-x-8 top-0 h-24 rounded-full bg-primary/12 blur-3xl"></div>
				<div class="relative space-y-5">
					<div class="flex items-center justify-between">
						<div>
							<p class="eyebrow">Starter snapshot</p>
							<p class="mt-2 text-xl font-semibold">Platform surface</p>
						</div>
						<span class="badge rounded-full badge-outline px-3 py-3">Baseline v1</span>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="surface-panel-muted p-4">
							<div class="flex items-center gap-3">
								<div class="rounded-2xl bg-primary/12 p-3 text-primary">
									<LockKeyhole size={18} />
								</div>
								<div>
									<p class="font-medium">Auth</p>
									<p class="text-sm text-base-content/65">Better Auth + SSR</p>
								</div>
							</div>
						</div>
						<div class="surface-panel-muted p-4">
							<div class="flex items-center gap-3">
								<div class="rounded-2xl bg-secondary/12 p-3 text-secondary">
									<ChartNoAxesColumn size={18} />
								</div>
								<div>
									<p class="font-medium">Billing</p>
									<p class="text-sm text-base-content/65">Paddle + webhooks</p>
								</div>
							</div>
						</div>
						<div class="surface-panel-muted p-4">
							<div class="flex items-center gap-3">
								<div class="rounded-2xl bg-accent/25 p-3 text-accent-content">
									<ServerCog size={18} />
								</div>
								<div>
									<p class="font-medium">Database</p>
									<p class="text-sm text-base-content/65">Prisma + PostgreSQL</p>
								</div>
							</div>
						</div>
						<div class="surface-panel-muted p-4">
							<div class="flex items-center gap-3">
								<div class="rounded-2xl bg-success/15 p-3 text-success-content">
									<BadgeCheck size={18} />
								</div>
								<div>
									<p class="font-medium">Email</p>
									<p class="text-sm text-base-content/65">Resend + verification</p>
								</div>
							</div>
						</div>
					</div>

					<div class="rounded-3xl border border-base-300/65 bg-base-200/45 p-5">
						<p class="text-sm font-medium">What this starter optimizes for</p>
						<p class="mt-2 text-sm leading-6 text-base-content/68">
							Clean boundaries, low operational noise, and enough product structure to start selling
							without turning the boilerplate into a framework of its own.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 py-16 md:px-6">
	<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
		<div>
			<p class="eyebrow">Core surfaces</p>
			<h2 class="mt-4 text-3xl font-semibold text-balance">
				The default shape is polished, not busy.
			</h2>
		</div>
		<p class="section-copy">
			The visual system aims for product credibility: soft contrast, strong type hierarchy, and
			components that look maintained rather than improvised.
		</p>
	</div>

	<div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
		{#each pillars as pillar (pillar.title)}
			{@const Icon = pillar.icon}
			<div class="surface-panel p-6">
				<div class="flex items-center justify-between gap-4">
					<div class="rounded-2xl bg-base-200/80 p-3 text-primary">
						<Icon size={18} strokeWidth={2.1} />
					</div>
					<div class="h-px flex-1 bg-linear-to-r from-base-300/70 to-transparent"></div>
				</div>
				<h3 class="mt-5 text-lg font-semibold">{pillar.title}</h3>
				<p class="section-copy mt-2">{pillar.copy}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-16 md:px-6">
	<div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
		<div class="surface-panel p-7 md:p-8">
			<p class="eyebrow">Implementation posture</p>
			<h2 class="mt-4 text-3xl font-semibold">
				Small by default. Ready when the product gets serious.
			</h2>
			<p class="section-copy mt-4">
				Public surfaces prerender when safe. Authenticated routes stay SSR and dynamic. Database
				access stays on the server. The UI stays fast because most state is driven from the load
				functions and actions rather than client-only orchestration.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="surface-panel-muted p-5">
				<p class="eyebrow">Rendering</p>
				<p class="mt-3 text-xl font-semibold">SSR where trust matters</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					Dashboard and settings stay server-rendered, guarded, and predictable.
				</p>
			</div>
			<div class="surface-panel-muted p-5">
				<p class="eyebrow">Actions</p>
				<p class="mt-3 text-xl font-semibold">Forms that survive without JS</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					Progressive enhancement improves feel without being required for correctness.
				</p>
			</div>
			<div class="surface-panel-muted p-5">
				<p class="eyebrow">Security</p>
				<p class="mt-3 text-xl font-semibold">Email verification stays first class</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					The default auth flow favors real user trust over aggressive sign-up conversion tricks.
				</p>
			</div>
			<div class="surface-panel-muted p-5">
				<p class="eyebrow">Scale</p>
				<p class="mt-3 text-xl font-semibold">Feature modules stay separated</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					Account, billing, email, and organization logic each keep their own boundaries.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-16 md:px-6">
	<div class="hero-surface px-6 py-8 md:px-8 md:py-10">
		<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div>
				<p class="eyebrow">FAQ</p>
				<h2 class="mt-4 text-3xl font-semibold">
					Questions teams ask before they commit to a starter.
				</h2>
			</div>
			<a class="btn rounded-full btn-outline" href={resolve('/about')}>Read the architecture</a>
		</div>

		<div class="mt-8 space-y-4">
			{#each faqItems as item (item.question)}
				<details class="surface-panel-muted group px-5 py-4">
					<summary class="cursor-pointer list-none text-base font-medium">
						{item.question}
					</summary>
					<p class="mt-3 pr-4 text-sm leading-6 text-base-content/68">{item.answer}</p>
				</details>
			{/each}
		</div>
	</div>
</section>
