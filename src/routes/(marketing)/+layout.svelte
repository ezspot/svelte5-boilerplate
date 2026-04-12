<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const navItems = [
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/about', label: 'About' }
	] as const;
</script>

<div class="min-h-screen">
	<header class="sticky top-0 z-20 px-4 pt-4 md:px-6">
		<div class="hero-surface mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
			<a class="flex items-center gap-3" href={resolve('/')}>
				<LogoMark />
				<div>
					<p class="text-sm font-semibold tracking-[0.16em] uppercase">Acme SaaS</p>
					<p class="text-xs text-base-content/55">Enterprise starter</p>
				</div>
			</a>

			<nav class="hidden items-center gap-2 rounded-full bg-base-100/75 p-1 md:flex">
				{#each navItems as item (item.href)}
					<a
						class="rounded-full px-4 py-2 text-sm font-medium text-base-content/72 hover:bg-base-100 hover:text-base-content"
						href={resolve(item.href)}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="flex items-center gap-2">
				{#if data.user}
					<a class="btn rounded-full px-5 btn-sm btn-primary" href={resolve('/dashboard')}>
						Open dashboard
					</a>
				{:else}
					<a class="btn rounded-full btn-ghost btn-sm" href={resolve('/login')}>Sign in</a>
					<a class="btn rounded-full px-5 btn-sm btn-primary" href={resolve('/register')}>
						Start free
					</a>
				{/if}
			</div>
		</div>
	</header>

	<main class="pb-16">{@render children()}</main>
</div>
