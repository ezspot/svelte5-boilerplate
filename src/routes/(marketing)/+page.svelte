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

<section class="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
	<div class="marketing-panel overflow-hidden px-6 py-8 md:px-10 md:py-12">
		<div class="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
			<div>
				<span class="marketing-badge">Europe-first SaaS foundation</span>
				<h1
					class="mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold text-balance text-white md:text-6xl"
				>
					Operational trust up front. Product flexibility after launch.
				</h1>
				<p class="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-[1.02rem]">
					A SvelteKit SaaS starter for teams that want clean auth, billing, multi-tenant boundaries,
					and a product shell that already feels credible in front of customers and stakeholders.
				</p>

				<div class="mt-8 flex flex-wrap gap-3">
					<a
						class="btn rounded-full border-0 bg-accent px-6 text-accent-content shadow-[0_16px_36px_-20px_rgba(34,197,94,0.75)]"
						href={resolve('/register')}
					>
						Start with the baseline
						<ArrowRight size={16} />
					</a>
					<a
						class="btn rounded-full border-white/12 bg-white/6 px-6 text-white hover:bg-white/10"
						href={resolve('/pricing')}
					>
						Review pricing
					</a>
				</div>

				<div class="metric-grid mt-8">
					<div class="marketing-stat">
						<p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
							Auth model
						</p>
						<p class="mt-3 text-lg font-semibold text-white">Magic-link first</p>
						<p class="mt-2 text-sm text-slate-300">
							Passwordless onboarding with optional password hardening later.
						</p>
					</div>
					<div class="marketing-stat">
						<p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
							Data layer
						</p>
						<p class="mt-3 text-lg font-semibold text-white">One schema</p>
						<p class="mt-2 text-sm text-slate-300">
							Prisma remains the single migration and client authority.
						</p>
					</div>
					<div class="marketing-stat">
						<p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
							Billing stance
						</p>
						<p class="mt-3 text-lg font-semibold text-white">Europe first</p>
						<p class="mt-2 text-sm text-slate-300">
							Merchant-of-record billing keeps early compliance overhead low.
						</p>
					</div>
				</div>
			</div>

			<div class="marketing-panel-muted relative overflow-hidden p-7 md:p-8">
				<div class="space-y-5">
					<div class="flex items-center justify-between">
						<div>
							<p class="eyebrow">Starter snapshot</p>
							<p class="mt-2 text-xl font-semibold">Platform surface</p>
						</div>
						<span
							class="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
						>
							Baseline v1
						</span>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="surface-panel-muted p-4">
							<div class="flex items-center gap-3">
								<div class="rounded-2xl bg-slate-900 p-3 text-white">
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
								<div class="rounded-2xl bg-sky-100 p-3 text-sky-700">
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
								<div class="rounded-2xl bg-slate-100 p-3 text-slate-700">
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
								<div class="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
									<BadgeCheck size={18} />
								</div>
								<div>
									<p class="font-medium">Email</p>
									<p class="text-sm text-base-content/65">Resend + verification</p>
								</div>
							</div>
						</div>
					</div>

					<div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
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
				Public trust outside. Operational clarity inside.
			</h2>
		</div>
		<p class="section-copy">
			The visual system follows a more enterprise-forward split: authority and trust on the public
			site, denser navigation and clearer information rhythm once users enter the product.
		</p>
	</div>

	<div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
		{#each pillars as pillar (pillar.title)}
			{@const Icon = pillar.icon}
			<div class="marketing-panel-muted p-6">
				<div class="flex items-center justify-between gap-4">
					<div class="rounded-2xl bg-slate-100 p-3 text-slate-800">
						<Icon size={18} strokeWidth={2.1} />
					</div>
					<div class="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent"></div>
				</div>
				<h3 class="mt-5 text-lg font-semibold">{pillar.title}</h3>
				<p class="section-copy mt-2">{pillar.copy}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-16 md:px-6">
	<div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
		<div class="marketing-panel p-7 md:p-8">
			<p class="eyebrow">Implementation posture</p>
			<h2 class="mt-4 text-3xl font-semibold text-white">
				Structured enough for enterprise reviews. Small enough to evolve quickly.
			</h2>
			<p class="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
				Public surfaces prerender when safe. Authenticated routes stay SSR and dynamic. Database
				access stays on the server. The UI stays fast because most state is driven from the load
				functions and actions rather than client-only orchestration.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="marketing-panel-muted p-5">
				<p class="eyebrow">Rendering</p>
				<p class="mt-3 text-xl font-semibold">SSR where trust matters</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					Dashboard and settings stay server-rendered, guarded, and predictable.
				</p>
			</div>
			<div class="marketing-panel-muted p-5">
				<p class="eyebrow">Actions</p>
				<p class="mt-3 text-xl font-semibold">Forms that survive without JS</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					Progressive enhancement improves feel without being required for correctness.
				</p>
			</div>
			<div class="marketing-panel-muted p-5">
				<p class="eyebrow">Security</p>
				<p class="mt-3 text-xl font-semibold">Email verification stays first class</p>
				<p class="mt-2 text-sm leading-6 text-base-content/68">
					The default auth flow favors real user trust over aggressive sign-up conversion tricks.
				</p>
			</div>
			<div class="marketing-panel-muted p-5">
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
	<div class="marketing-panel-muted px-6 py-8 md:px-8 md:py-10">
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
				<details class="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-5 py-4">
					<summary class="cursor-pointer list-none text-base font-medium">
						{item.question}
					</summary>
					<p class="mt-3 pr-4 text-sm leading-6 text-base-content/68">{item.answer}</p>
				</details>
			{/each}
		</div>
	</div>
</section>
