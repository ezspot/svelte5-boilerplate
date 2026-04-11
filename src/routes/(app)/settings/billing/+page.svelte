<script lang="ts">
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Billing settings | Acme SaaS</title>
</svelte:head>

<SectionCard
	title="Billing boundary"
	description="Billing is intentionally not integrated in the first baseline, but the service boundary is already in place."
>
	<div class="grid gap-4 md:grid-cols-3">
		<div class="surface-panel p-5">
			<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">Plan</p>
			<p class="mt-3 text-2xl font-semibold">{data.billing.planName}</p>
		</div>
		<div class="surface-panel p-5">
			<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">Status</p>
			<p class="mt-3 text-lg font-semibold">{data.billing.status}</p>
		</div>
		<div class="surface-panel p-5">
			<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
				Next step
			</p>
			<p class="mt-3 text-sm leading-6">{data.billing.renewalLabel}</p>
		</div>
	</div>
</SectionCard>
