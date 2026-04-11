<script lang="ts">
	const tiers = [
		{
			name: 'Starter baseline',
			price: '$0',
			copy: 'The app foundation you customize for a single SaaS product.',
			features: [
				'Auth, email verification, and password reset',
				'Organizations, invites, and audit events',
				'Marketing routes plus an authenticated app shell'
			]
		},
		{
			name: 'Scale-ready handoff',
			price: 'Custom',
			copy: 'Where you layer billing, product entitlements, and team-specific domain models.',
			features: [
				'Billing service boundary already carved out',
				'Prisma migrations and feature-oriented modules',
				'Platform-agnostic SvelteKit deployment path'
			]
		}
	];
</script>

<svelte:head>
	<title>Pricing | Acme SaaS</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-6 py-16">
	<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Pricing scope</p>
	<h1 class="mt-4 text-4xl font-semibold text-balance">What the starter includes on day one.</h1>
	<p class="section-copy mt-4">
		This baseline is intentionally opinionated about infrastructure and intentionally light on
		product features.
	</p>

	<div class="mt-10 grid gap-6 md:grid-cols-2">
		{#each tiers as tier (tier.name)}
			<div class="surface-panel p-8">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
					{tier.name}
				</p>
				<div class="mt-4 text-4xl font-semibold">{tier.price}</div>
				<p class="section-copy mt-3">{tier.copy}</p>
				<ul class="mt-6 space-y-3 text-sm">
					{#each tier.features as feature (feature)}
						<li class="flex gap-3">
							<span class="mt-2 h-2 w-2 rounded-full bg-primary"></span>
							<span>{feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>
