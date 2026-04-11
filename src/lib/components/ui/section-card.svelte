<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		children: Snippet;
	};

	let { title, description = '', children }: Props = $props();
</script>

<section class="surface-panel p-6 md:p-8">
	<div class="mb-6">
		<h2 class="text-lg font-semibold">{title}</h2>
		{#if description}
			<p class="section-copy mt-2">{description}</p>
		{/if}
	</div>

	<div class="space-y-4">
		{@render children()}
	</div>
</section>
