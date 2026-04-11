<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight, Boxes, LockKeyhole, MailCheck, ServerCog } from '@lucide/svelte';

	const pillars = [
		{
			title: 'Server-first auth',
			copy: 'Better Auth, SvelteKit actions, SSR route guards, and email verification are wired into the baseline.',
			icon: LockKeyhole
		},
		{
			title: 'Operationally simple data layer',
			copy: 'Prisma 7 owns the schema, migrations, generated client output, and application models on PostgreSQL.',
			icon: ServerCog
		},
		{
			title: 'Transactional email ready',
			copy: 'Verification, password reset, and invite emails run through a dedicated Resend service with idempotency keys.',
			icon: MailCheck
		},
		{
			title: 'Extensible SaaS domain',
			copy: 'Organizations, memberships, invitations, audit events, and billing boundaries are intentionally small and scalable.',
			icon: Boxes
		}
	];
</script>

<svelte:head>
	<title>Acme SaaS | Production-ready SvelteKit boilerplate</title>
</svelte:head>

<section
	class="mx-auto grid max-w-7xl gap-10 px-6 pt-8 pb-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"
>
	<div>
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
			Svelte 5 SaaS starter
		</p>
		<h1 class="mt-5 max-w-3xl text-5xl leading-tight font-semibold text-balance">
			A production baseline for teams shipping the boring parts well.
		</h1>
		<p class="section-copy mt-6 text-base">
			This boilerplate favors clean server boundaries, predictable auth flows, and a compact
			multi-tenant domain over novelty. It is ready for real products, not just demos.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a class="btn btn-primary" href={resolve('/register')}>
				Start from the app shell
				<ArrowRight size={16} />
			</a>
			<a class="btn btn-ghost" href={resolve('/pricing')}>See the starter scope</a>
		</div>
	</div>

	<div class="surface-panel space-y-5 p-8">
		<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
			Included baseline
		</p>
		<ul class="space-y-4">
			<li class="flex items-start gap-3">
				<div class="rounded-xl bg-primary/10 p-2 text-primary">
					<LockKeyhole size={18} />
				</div>
				<div>
					<p class="font-medium">Email/password auth with verification and reset flows</p>
					<p class="section-copy mt-1">
						SvelteKit-native Better Auth integration with secure cookies.
					</p>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<div class="rounded-xl bg-primary/10 p-2 text-primary">
					<ServerCog size={18} />
				</div>
				<div>
					<p class="font-medium">Prisma 7 client generation outside `node_modules`</p>
					<p class="section-copy mt-1">
						One shared Prisma client module and explicit output configuration.
					</p>
				</div>
			</li>
			<li class="flex items-start gap-3">
				<div class="rounded-xl bg-primary/10 p-2 text-primary">
					<MailCheck size={18} />
				</div>
				<div>
					<p class="font-medium">Resend webhook verification and audit-friendly persistence</p>
					<p class="section-copy mt-1">Only the parts that help in production are included.</p>
				</div>
			</li>
		</ul>
	</div>
</section>

<section class="mx-auto max-w-7xl px-6 pb-16">
	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each pillars as pillar (pillar.title)}
			{@const Icon = pillar.icon}
			<div class="surface-panel p-6">
				<div class="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
					<Icon size={18} />
				</div>
				<h2 class="mt-4 text-lg font-semibold">{pillar.title}</h2>
				<p class="section-copy mt-2">{pillar.copy}</p>
			</div>
		{/each}
	</div>
</section>
