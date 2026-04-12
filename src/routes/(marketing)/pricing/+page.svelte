<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Pricing | Acme SaaS</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-16 md:px-6">
	<div class="marketing-panel px-6 py-8 md:px-8 md:py-10">
		<div class="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
			<div>
				<span class="marketing-badge">Pricing</span>
				<h1 class="mt-5 max-w-4xl text-4xl font-semibold text-balance text-white md:text-5xl">
					Europe-first billing without turning the starter into a finance project.
				</h1>
				<p class="mt-4 max-w-3xl text-base leading-7 text-slate-300">
					The baseline uses a merchant-of-record approach for the first production path. That keeps
					VAT, tax, and invoicing overhead lighter while still leaving room to expand into the US.
				</p>
			</div>
			<div class="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 text-slate-100">
				<p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
					Commercial posture
				</p>
				<p class="mt-3 text-2xl font-semibold">Built for early selling</p>
				<p class="mt-2 text-sm leading-6 text-slate-300">
					Enough billing structure to charge customers, without locking the product into a complex
					stack too early.
				</p>
			</div>
		</div>
	</div>

	<div class="mt-10 grid gap-6 xl:grid-cols-3">
		{#each data.plans as plan (plan.key)}
			<div
				class={`marketing-panel-muted flex h-full flex-col gap-5 p-8 ${plan.highlighted ? 'shadow-[0_26px_70px_-38px_rgba(14,116,216,0.28)] ring-1 ring-sky-500/25' : ''}`}
			>
				<div class="flex items-center justify-between gap-3">
					<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
						{plan.name}
					</p>
					{#if plan.highlighted}
						<span
							class="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
						>
							Default paid plan
						</span>
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
						class={`btn w-full rounded-full ${plan.highlighted ? 'border-0 bg-sky-600 text-white hover:bg-sky-700' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'}`}
						href={resolve('/register')}
					>
						{plan.key === 'free' ? 'Create account' : plan.ctaLabel}
					</a>
				</div>
			</div>
		{/each}
	</div>

	<div class="marketing-panel-muted mt-10 p-6">
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
