<script lang="ts">
	import type { Snippet } from 'svelte';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';

	type Feature = {
		label: string;
		copy: string;
	};

	type Props = {
		eyebrow: string;
		title: string;
		description: string;
		features?: Feature[];
		children: Snippet;
	};

	let { eyebrow, title, description, features = [], children }: Props = $props();
</script>

<div class="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-6">
	<div class="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
		<div class="hero-surface hidden px-8 py-9 lg:block">
			<p class="eyebrow">{eyebrow}</p>
			<h1 class="mt-4 text-4xl font-semibold text-balance">{title}</h1>
			<p class="section-copy mt-4 text-base">{description}</p>

			{#if features.length}
				<div class="mt-8 space-y-3">
					{#each features as feature (feature.label)}
						<div class="surface-panel-muted p-4">
							<p class="text-sm font-medium">{feature.label}</p>
							<p class="mt-2 text-sm leading-6 text-base-content/68">{feature.copy}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="surface-panel w-full p-8 md:p-10">
			<div class="mb-8 flex items-center gap-3">
				<LogoMark />
				<div>
					<p class="text-sm font-semibold">Acme SaaS</p>
					<p class="text-xs text-base-content/55">{eyebrow}</p>
				</div>
			</div>

			{@render children()}
		</div>
	</div>
</div>
