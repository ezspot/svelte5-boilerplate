<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		ChevronsLeft,
		ChevronsRight,
		CircleDollarSign,
		LayoutDashboard,
		LogOut,
		Menu,
		ShieldCheck,
		UsersRound,
		UserRound
	} from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';
	import AppBreadcrumbs from '$lib/components/ui/app-breadcrumbs.svelte';
	import ClientSessionBadge from '$lib/components/ui/client-session-badge.svelte';
	import type { LayoutData } from './$types';

	type AppNavHref =
		| '/dashboard'
		| '/settings/security'
		| '/settings/organization'
		| '/settings/billing';

	type NavItem = {
		href: AppNavHref;
		label: string;
		icon: typeof LayoutDashboard;
	};

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let mobileNavOpen = $state(false);
	let desktopNavCollapsed = $state(false);

	const storageKey = 'acme-app-nav-collapsed';

	const navItems: NavItem[] = [
		{
			href: '/dashboard',
			label: 'Dashboard',
			icon: LayoutDashboard
		},
		{
			href: '/settings/security',
			label: 'Security',
			icon: ShieldCheck
		},
		{
			href: '/settings/organization',
			label: 'Organization',
			icon: UsersRound
		},
		{
			href: '/settings/billing',
			label: 'Billing',
			icon: CircleDollarSign
		}
	];

	onMount(() => {
		if (!browser) {
			return;
		}

		desktopNavCollapsed = window.localStorage.getItem(storageKey) === '1';
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		window.localStorage.setItem(storageKey, desktopNavCollapsed ? '1' : '0');
	});

	function isActive(href: AppNavHref) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}
</script>

<div class="app-shell">
	{#if mobileNavOpen}
		<button
			class="fixed inset-0 z-30 bg-neutral/28 backdrop-blur-[1px] lg:hidden"
			type="button"
			aria-label="Close navigation"
			onclick={closeMobileNav}
		></button>
	{/if}

	<div
		class="min-h-screen lg:grid lg:grid-cols-[var(--app-nav-width)_minmax(0,1fr)]"
		style={`--app-nav-width: ${desktopNavCollapsed ? '4.75rem' : '15.5rem'}`}
	>
		<aside
			class={`app-sidebar hidden h-screen flex-col lg:sticky lg:top-0 lg:flex ${desktopNavCollapsed ? 'w-19' : 'w-62'}`}
		>
			<div class="app-shell-header-row justify-between border-b border-base-300/80 px-3">
				<a
					class={`flex items-center gap-3 rounded-xl ${desktopNavCollapsed ? 'justify-center px-0 py-1.5' : 'px-2 py-2'}`}
					href={resolve('/dashboard')}
					aria-label="Go to dashboard"
					title="Dashboard"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl border border-base-300/75 bg-base-100"
					>
						<LogoMark size={16} />
					</div>
					{#if !desktopNavCollapsed}
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold text-white">Acme SaaS</p>
							<p class="truncate text-xs text-slate-400">{data.organization.slug}</p>
						</div>
					{/if}
				</a>

				<button
					class="app-subtle-button hidden h-10 w-10 justify-center px-0 lg:inline-flex"
					type="button"
					aria-label={desktopNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
					onclick={() => {
						desktopNavCollapsed = !desktopNavCollapsed;
					}}
				>
					{#if desktopNavCollapsed}
						<ChevronsRight size={16} />
					{:else}
						<ChevronsLeft size={16} />
					{/if}
				</button>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-3 py-3">
				<nav class="space-y-1">
					{#each navItems as item (item.href)}
						{@const Icon = item.icon}
						<a
							class={`app-nav-link ${desktopNavCollapsed ? 'justify-center px-0' : ''} ${isActive(item.href) ? 'app-nav-link-active' : ''}`}
							href={resolve(item.href)}
							title={item.label}
						>
							<span class="app-nav-icon">
								<Icon size={16} strokeWidth={2.1} />
							</span>
							{#if !desktopNavCollapsed}
								<span class="truncate">{item.label}</span>
							{/if}
						</a>
					{/each}
				</nav>
			</div>

			<div class="border-t border-base-300/80 p-3">
				{#if desktopNavCollapsed}
					<div class="flex flex-col items-center gap-2.5">
						<a
							class={`flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/8 text-sm font-semibold text-white transition hover:bg-white/12 ${
								page.url.pathname === '/settings/profile' ? 'ring-2 ring-white/20' : ''
							}`}
							href={resolve('/settings/profile')}
							title="Profile"
							aria-label="Open profile"
						>
							{data.user.name.slice(0, 1).toUpperCase()}
						</a>
						<form action="/login?/logout" method="POST">
							<button
								class="app-subtle-button h-10 w-10 justify-center px-0"
								type="submit"
								aria-label="Sign out"
								title="Sign out"
							>
								<LogOut size={16} />
							</button>
						</form>
					</div>
				{:else}
					<div class="rounded-2xl border border-white/8 bg-white/5 p-2.5 text-slate-100">
						<a
							class="flex items-start gap-3 rounded-xl px-2.5 py-2 transition hover:bg-white/6"
							href={resolve('/settings/profile')}
						>
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/8 text-sm font-semibold text-white"
							>
								{data.user.name.slice(0, 1).toUpperCase()}
							</div>
							<div class="min-w-0 flex-1 text-sm">
								<p class="truncate font-medium text-white">{data.user.name}</p>
								<p class="mt-1 truncate text-xs text-slate-400">{data.user.email}</p>
							</div>
							<div class="pt-0.5">
								<UserRound size={16} class="text-slate-400" />
							</div>
						</a>
						<div class="mt-2 flex items-center justify-between gap-3 px-2.5 pb-1">
							<ClientSessionBadge />
							<form action="/login?/logout" method="POST">
								<button
									class="btn rounded-xl border-white/10 bg-white/6 text-white btn-sm hover:bg-white/10"
									type="submit"
								>
									Sign out
								</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		</aside>

		<aside
			class={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-68 flex-col transition-transform duration-200 lg:hidden ${
				mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
			}`}
		>
			<div class="app-shell-header-row gap-3 border-b border-base-300/80 px-4">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl border border-base-300/75"
				>
					<LogoMark size={16} />
				</div>
				<div class="min-w-0">
					<p class="truncate text-sm font-semibold text-white">Acme SaaS</p>
					<p class="truncate text-xs text-slate-400">{data.organization.slug}</p>
				</div>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
				<nav class="space-y-1">
					{#each navItems as item (item.href)}
						{@const Icon = item.icon}
						<a
							class={`app-nav-link ${isActive(item.href) ? 'app-nav-link-active' : ''}`}
							href={resolve(item.href)}
							onclick={closeMobileNav}
						>
							<span class="app-nav-icon">
								<Icon size={16} strokeWidth={2.1} />
							</span>
							<span class="truncate">{item.label}</span>
						</a>
					{/each}
				</nav>
			</div>

			<div class="border-t border-base-300/80 p-4">
				<div class="rounded-2xl border border-white/8 bg-white/5 p-2.5 text-slate-100">
					<a
						class="flex items-start gap-3 rounded-xl px-2.5 py-2 transition hover:bg-white/6"
						href={resolve('/settings/profile')}
						onclick={closeMobileNav}
					>
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/8 text-sm font-semibold text-white"
						>
							{data.user.name.slice(0, 1).toUpperCase()}
						</div>
						<div class="min-w-0 flex-1 text-sm">
							<p class="truncate font-medium text-white">{data.user.name}</p>
							<p class="mt-1 truncate text-xs text-slate-400">{data.user.email}</p>
						</div>
						<div class="pt-0.5">
							<UserRound size={16} class="text-slate-400" />
						</div>
					</a>
					<div class="mt-2 flex items-center justify-between gap-3 px-2.5 pb-1">
						<ClientSessionBadge />
					</div>
					<form action="/login?/logout" method="POST">
						<button
							class="btn mt-4 w-full rounded-xl border-white/10 bg-white/6 text-white btn-sm hover:bg-white/10"
							type="submit"
						>
							Sign out
						</button>
					</form>
				</div>
			</div>
		</aside>

		<div class="min-w-0">
			<header class="flex items-center gap-3 px-4 pt-3 pb-1 lg:hidden">
				<button
					class="btn btn-square btn-sm rounded-lg border border-slate-900/10 bg-base-100/92 text-slate-900 shadow-sm backdrop-blur"
					type="button"
					aria-label="Open navigation"
					onclick={() => {
						mobileNavOpen = !mobileNavOpen;
					}}
				>
					<Menu size={16} />
				</button>
				<AppBreadcrumbs />
			</header>

			<div class="app-page">
				<div class="mx-auto w-full max-w-screen-2xl">
					<div class="mb-3 hidden lg:block">
						<AppBreadcrumbs />
					</div>
					<main>{@render children()}</main>
				</div>
			</div>
		</div>
	</div>
</div>
