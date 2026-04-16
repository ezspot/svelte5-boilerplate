<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { House } from '@lucide/svelte';

	type Crumb = { label: string; href: string };

	const labelMap: Record<string, string> = {
		dashboard: 'Dashboard',
		tickets: 'Tickets',
		new: 'New',
		contacts: 'Contacts',
		settings: 'Settings',
		profile: 'Profile',
		organization: 'Organization',
		billing: 'Billing',
		security: 'Security'
	};

	const crumbs = $derived.by(() => {
		const pathname = page.url.pathname;
		const segments = pathname.split('/').filter(Boolean);
		const result: Crumb[] = [];

		let accumulated = '';
		for (const seg of segments) {
			accumulated += `/${seg}`;
			result.push({
				label: labelMap[seg] ?? seg,
				href: accumulated
			});
		}

		return result;
	});
</script>

<nav class="breadcrumbs text-sm" aria-label="Breadcrumb">
	<ul>
		<li>
			<a href={resolve('/dashboard')} class="inline-flex items-center gap-1.5">
				<House size={14} class="shrink-0" />
				<span>Home</span>
			</a>
		</li>
		{#each crumbs as crumb, i (crumb.href)}
			<li>
				{#if i === crumbs.length - 1}
					<span class="font-medium text-base-content">{crumb.label}</span>
				{:else}
					<a href={crumb.href}>{crumb.label}</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
