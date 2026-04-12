<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Menu, X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let mobileNavOpen = $state(false);

	const navItems = [
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/about', label: 'About' }
	] as const;
</script>

<div class="marketing-shell">
	<header class="marketing-header">
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
			<a class="flex items-center gap-3 text-white" href={resolve('/')}>
				<LogoMark />
				<div>
					<p class="text-sm font-semibold tracking-[0.16em] uppercase">Acme SaaS</p>
					<p class="text-xs text-slate-400">Enterprise starter</p>
				</div>
			</a>

			<nav class="hidden items-center gap-2 md:flex">
				{#each navItems as item (item.href)}
					<a
						class={`marketing-nav-link ${page.url.pathname === item.href ? 'bg-white/10 text-white' : ''}`}
						href={resolve(item.href)}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="hidden items-center gap-2 md:flex">
				{#if data.user}
					<a
						class="btn rounded-full border-white/10 bg-white/8 px-5 text-white btn-sm hover:bg-white/12"
						href={resolve('/dashboard')}
					>
						Open dashboard
					</a>
				{:else}
					<a
						class="btn rounded-full border-white/10 bg-transparent px-5 text-slate-200 btn-sm hover:bg-white/8"
						href={resolve('/login')}>Sign in</a
					>
					<a
						class="btn rounded-full border-0 bg-accent px-5 text-accent-content shadow-[0_12px_30px_-18px_rgba(34,197,94,0.7)] btn-sm hover:bg-accent/90"
						href={resolve('/register')}
					>
						Contact sales
					</a>
				{/if}
			</div>

			<button
				class="btn btn-square rounded-full border-white/10 bg-white/6 text-white md:hidden"
				type="button"
				aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
				onclick={() => {
					mobileNavOpen = !mobileNavOpen;
				}}
			>
				{#if mobileNavOpen}
					<X size={18} />
				{:else}
					<Menu size={18} />
				{/if}
			</button>
		</div>

		{#if mobileNavOpen}
			<div class="border-t border-white/10 px-4 pb-4 md:hidden">
				<nav class="mt-4 grid gap-2">
					{#each navItems as item (item.href)}
						<a
							class="marketing-nav-link text-center"
							href={resolve(item.href)}
							onclick={() => {
								mobileNavOpen = false;
							}}
						>
							{item.label}
						</a>
					{/each}
					{#if data.user}
						<a
							class="btn mt-2 rounded-full border-white/10 bg-white/8 text-white"
							href={resolve('/dashboard')}
						>
							Open dashboard
						</a>
					{:else}
						<a
							class="btn mt-2 rounded-full border-white/10 bg-transparent text-slate-200"
							href={resolve('/login')}
						>
							Sign in
						</a>
						<a
							class="btn rounded-full border-0 bg-accent text-accent-content"
							href={resolve('/register')}
						>
							Contact sales
						</a>
					{/if}
				</nav>
			</div>
		{/if}
	</header>

	<main class="pb-16">{@render children()}</main>

	<footer class="marketing-footer">
		<div
			class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-6"
		>
			<div>
				<p class="font-semibold text-slate-900">Acme SaaS</p>
				<p class="mt-1">Production-ready SvelteKit baseline for Europe-first SaaS products.</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a class="hover:text-slate-900" href={resolve('/pricing')}>Pricing</a>
				<a class="hover:text-slate-900" href={resolve('/about')}>About</a>
				<a class="hover:text-slate-900" href={resolve('/login')}>Sign in</a>
			</div>
		</div>
	</footer>
</div>
