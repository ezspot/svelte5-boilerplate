<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		eyebrow?: string;
		children: Snippet;
	};

	let { title, description = '', eyebrow = 'Control surface', children }: Props = $props();
</script>

<section class="dashboard-card">
	<div
		class="mb-5 space-y-3 border-b border-base-300/70 pb-4 lg:flex lg:items-start lg:justify-between lg:gap-6 lg:space-y-0"
	>
		<div class="min-w-0">
			<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
				{eyebrow}
			</p>
			<h2 class="mt-2 text-xl font-semibold tracking-tight text-balance">{title}</h2>
		</div>
		{#if description}
			<p class="max-w-2xl text-sm leading-6 text-base-content/62 lg:text-right">
				{description}
			</p>
		{/if}
	</div>

	<div class="space-y-4">
		{@render children()}
	</div>
</section>
