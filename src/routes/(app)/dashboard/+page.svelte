<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import { ArrowUpRight, Clock3, CreditCard, Users } from '@lucide/svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import StatCard from '$lib/components/ui/stat-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard | Acme SaaS</title>
</svelte:head>

<div class="space-y-3 md:space-y-4">
	<section class="app-content-card px-5 py-5 md:px-6">
		<h2 class="text-3xl font-semibold tracking-tight">Overview</h2>
		<p class="mt-2 max-w-2xl text-sm leading-6 text-base-content/66">
			A tighter operator view for day-to-day product work: workspace posture, collaboration
			readiness, and recent activity in one console.
		</p>
	</section>

	{#if navigating.to}
		<div class="app-content-card p-5">
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
		<div class="grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.dashboard.stats as stat (stat.label)}
				<StatCard {...stat} />
			{/each}
		</div>

		<div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_288px]">
			<section class="app-content-card p-5 md:p-6">
				<div class="flex items-center justify-between gap-4">
					<div>
						<p
							class="text-[0.72rem] font-semibold tracking-[0.16em] text-base-content/42 uppercase"
						>
							Recent activity
						</p>
						<h2 class="mt-2 text-xl font-semibold">Audit trail</h2>
					</div>
					<div
						class="rounded-xl border border-base-300/75 bg-base-100 px-3 py-2 text-sm text-base-content/62"
					>
						{data.dashboard.recentEvents.length} events
					</div>
				</div>

				{#if data.dashboard.recentEvents.length}
					<div class="data-table-shell mt-5 hidden md:block">
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

					<div class="table-mobile-stack mt-5 md:hidden">
						{#each data.dashboard.recentEvents as event (event.id)}
							<article class="table-mobile-item">
								<div class="flex items-start justify-between gap-3">
									<div>
										<p class="text-sm font-semibold">{event.type}</p>
										<p class="mt-1 text-xs text-base-content/55">
											{event.targetType ?? 'system'}
										</p>
									</div>
									<p class="text-right text-xs text-base-content/52">
										{event.createdAt.toLocaleDateString()}
									</p>
								</div>
								<p class="mt-3 text-sm text-base-content/66">
									{event.createdAt.toLocaleTimeString()}
								</p>
							</article>
						{/each}
					</div>
				{:else}
					<div
						class="mt-5 rounded-2xl border border-dashed border-base-300/75 bg-base-100 px-4 py-6 text-sm text-base-content/58"
					>
						No audit events yet.
					</div>
				{/if}
			</section>

			<aside class="space-y-3">
				<div class="app-content-card p-5">
					<p class="text-[0.72rem] font-semibold tracking-[0.16em] text-base-content/42 uppercase">
						Quick links
					</p>
					<div class="mt-4 space-y-2">
						<a
							class="flex items-center justify-between rounded-xl border border-base-300/75 bg-base-100 px-4 py-3 text-sm font-medium hover:bg-base-200"
							href={resolve('/settings/profile')}
						>
							Update profile
							<ArrowUpRight size={15} />
						</a>
						<a
							class="flex items-center justify-between rounded-xl border border-base-300/75 bg-base-100 px-4 py-3 text-sm font-medium hover:bg-base-200"
							href={resolve('/settings/organization')}
						>
							Manage workspace
							<Users size={15} />
						</a>
						<a
							class="flex items-center justify-between rounded-xl border border-base-300/75 bg-base-100 px-4 py-3 text-sm font-medium hover:bg-base-200"
							href={resolve('/settings/billing')}
						>
							Review billing
							<CreditCard size={15} />
						</a>
					</div>
				</div>

				<div class="app-content-card p-5">
					<p class="text-[0.72rem] font-semibold tracking-[0.16em] text-base-content/42 uppercase">
						Workspace notes
					</p>
					<div class="mt-4 space-y-3 text-sm text-base-content/66">
						<div class="rounded-xl border border-base-300/75 bg-base-100 p-4">
							<p class="font-medium">Collaboration</p>
							<p class="mt-2 leading-6">
								{data.organization.planKey === 'free'
									? 'The workspace is still in solo mode. Upgrade billing to enable invites.'
									: 'Invites are available from Organization settings.'}
							</p>
						</div>
						<div class="rounded-xl border border-base-300/75 bg-base-100 p-4">
							<p class="font-medium">Activity cadence</p>
							<p class="mt-2 flex items-center gap-2">
								<Clock3 size={15} class="text-secondary" />
								Recent events stay visible here for quick operational checks.
							</p>
						</div>
					</div>
				</div>
			</aside>
		</div>
	{:else}
		<EmptyState
			title="Dashboard loading"
			description="Please wait while we set up your workspace..."
		/>
	{/if}
</div>
