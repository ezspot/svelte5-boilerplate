<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Pricing | Acme SaaS</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-16 md:px-6">
	<div class="hero-surface px-6 py-8 md:px-8 md:py-10">
		<p class="eyebrow">Pricing</p>
		<h1 class="mt-4 max-w-4xl text-4xl font-semibold text-balance md:text-5xl">
			Europe-first SaaS billing with a cleaner path into the US.
		</h1>
		<p class="section-copy mt-4 max-w-3xl text-base">
			The starter uses a merchant-of-record billing approach for the first production baseline. That
			keeps VAT and sales-tax operations lighter than a direct merchant stack while preserving a
			clean upgrade path as your product grows.
		</p>
	</div>

	<div class="mt-10 grid gap-6 xl:grid-cols-3">
		{#each data.plans as plan (plan.key)}
			<div
				class={`surface-panel flex h-full flex-col gap-5 p-8 ${plan.highlighted ? 'shadow-[0_22px_80px_-34px_rgba(19,128,103,0.35)] ring-1 ring-primary/25' : ''}`}
			>
				<div class="flex items-center justify-between gap-3">
					<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
						{plan.name}
					</p>
					{#if plan.highlighted}
						<span class="badge badge-outline badge-primary">Default paid plan</span>
					{/if}
				</div>

				<div class="text-4xl font-semibold">{plan.priceLabel}</div>
				<p class="section-copy">{plan.description}</p>

				<ul class="space-y-3 text-sm">
					{#each plan.features as feature (feature)}
						<li class="flex gap-3">
							<span class="mt-2 h-2 w-2 rounded-full bg-primary"></span>
							<span>{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="mt-auto pt-3">
					<a
						class={`btn w-full ${plan.highlighted ? 'btn-primary' : 'btn-outline'}`}
						href={resolve('/register')}
					>
						{plan.key === 'free' ? 'Create account' : plan.ctaLabel}
					</a>
				</div>
			</div>
		{/each}
	</div>

	<div class="surface-panel-muted mt-10 p-6">
		<p class="font-medium">Architecture note</p>
		<p class="mt-3 text-sm leading-6 text-base-content/70">
			The two strongest enterprise billing patterns for 2026 are a direct merchant setup covering
			subscriptions, tax, and portal flows yourself, or a merchant-of-record setup where the
			provider handles more compliance and tax operations. This starter chooses the second path
			because it is the better operational fit for a Europe-first SaaS that still wants a
			straightforward expansion path into the US.
		</p>
	</div>
</section>
