<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="min-h-screen">
	<header class="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
		<a class="flex items-center gap-3" href={resolve('/')}>
			<LogoMark />
			<div>
				<p class="text-sm font-semibold tracking-[0.16em] uppercase">Acme SaaS</p>
				<p class="text-xs text-base-content/60">SvelteKit baseline</p>
			</div>
		</a>

		<nav class="hidden items-center gap-6 md:flex">
			<a class="text-sm font-medium" href={resolve('/pricing')}>Pricing</a>
			<a class="text-sm font-medium" href={resolve('/about')}>About</a>
		</nav>

		<div class="flex items-center gap-3">
			{#if data.user}
				<a class="btn btn-sm btn-primary" href={resolve('/dashboard')}>Dashboard</a>
			{:else}
				<a class="btn btn-ghost btn-sm" href={resolve('/login')}>Sign in</a>
				<a class="btn btn-sm btn-primary" href={resolve('/register')}>Create account</a>
			{/if}
		</div>
	</header>

	<main>{@render children()}</main>
</div>
