<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		children: Snippet;
	};

	let { title, description = '', children }: Props = $props();
</script>

<section class="dashboard-card">
	<div class="mb-5 flex items-start justify-between gap-4 border-b border-base-300/70 pb-4">
		<div>
			<p class="text-[0.72rem] font-semibold tracking-[0.16em] text-base-content/42 uppercase">
				Workspace section
			</p>
			<h2 class="mt-2 text-lg font-semibold">{title}</h2>
		</div>
		{#if description}
			<p class="max-w-2xl text-sm leading-6 text-base-content/62">{description}</p>
		{/if}
	</div>

	<div class="space-y-4">
		{@render children()}
	</div>
</section>
