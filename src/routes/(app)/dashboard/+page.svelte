<script lang="ts">
	import { navigating } from '$app/state';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import StatCard from '$lib/components/ui/stat-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard | Acme SaaS</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Dashboard</p>
		<h1 class="mt-3 text-3xl font-semibold">Operational overview</h1>
		<p class="section-copy mt-3">
			The first screen stays intentionally small: recent events, team posture, and invitation
			volume.
		</p>
	</div>

	{#if navigating.to}
		<div class="surface-panel p-5">
			<div class="h-4 w-40 skeleton"></div>
			<div class="mt-3 grid gap-3 md:grid-cols-3">
				<div class="h-24 w-full skeleton"></div>
				<div class="h-24 w-full skeleton"></div>
				<div class="h-24 w-full skeleton"></div>
			</div>
		</div>
	{/if}

	{#if data.loadError}
		<EmptyState
			title="Dashboard unavailable"
			description={data.loadError}
			actionHref="/settings/organization"
			actionLabel="Review organization"
		/>
	{:else if data.dashboard}
		<div class="grid gap-4 md:grid-cols-3">
			{#each data.dashboard.stats as stat (stat.label)}
				<StatCard {...stat} />
			{/each}
		</div>

		{#if data.dashboard.recentEvents.length}
			<section class="surface-panel p-6 md:p-8">
				<h2 class="text-lg font-semibold">Recent audit events</h2>
				<div class="mt-5 overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Event</th>
								<th>Target</th>
								<th>When</th>
							</tr>
						</thead>
						<tbody>
							{#each data.dashboard.recentEvents as event (event.id)}
								<tr>
									<td class="font-medium">{event.type}</td>
									<td>{event.targetType ?? 'system'}</td>
									<td>{event.createdAt.toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else}
			<EmptyState
				title="No audit events yet"
				description="The starter begins logging useful account and organization activity as you use the app."
			/>
		{/if}
	{/if}
</div>
