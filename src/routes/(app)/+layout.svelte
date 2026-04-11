<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';
	import ClientSessionBadge from '$lib/components/ui/client-session-badge.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/settings/profile', label: 'Profile' },
		{ href: '/settings/security', label: 'Security' },
		{ href: '/settings/organization', label: 'Organization' },
		{ href: '/settings/billing', label: 'Billing' }
	];
</script>

<div
	class="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6"
>
	<aside class="surface-panel flex flex-col gap-6 p-5">
		<div class="flex items-center gap-3">
			<LogoMark />
			<div>
				<p class="text-sm font-semibold">Acme SaaS</p>
				<p class="text-xs text-base-content/60">{data.organization.name}</p>
			</div>
		</div>

		<nav class="flex flex-col gap-1">
			{#each navItems as item (item.href)}
				<a
					class={`shell-link ${
						page.url.pathname === item.href || page.url.pathname.startsWith(`${item.href}/`)
							? 'shell-link-active'
							: ''
					}`}
					href={resolve(item.href)}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="mt-auto space-y-4">
			<ClientSessionBadge />
			<div class="text-sm">
				<p class="font-medium">{data.user.name}</p>
				<p class="mt-1 text-base-content/60">{data.user.email}</p>
			</div>
			<form action="/login?/logout" method="POST">
				<button class="btn w-full btn-outline btn-sm" type="submit">Sign out</button>
			</form>
		</div>
	</aside>

	<div class="space-y-6">
		<header class="surface-panel flex flex-wrap items-center justify-between gap-3 px-5 py-4">
			<div>
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
					Authenticated area
				</p>
				<p class="mt-1 text-lg font-semibold">{data.organization.name}</p>
			</div>
			<div class="badge badge-outline capitalize">{data.membership.role.toLowerCase()}</div>
		</header>

		<div>{@render children()}</div>
	</div>
</div>
