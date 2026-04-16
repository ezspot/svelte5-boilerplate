<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		AlertTriangle,
		ArrowUpRight,
		CircleDot,
		Clock3,
		MessageSquare,
		Plus,
		Timer
	} from '@lucide/svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const statusLabels: Record<string, string> = {
		OPEN: 'Open',
		IN_PROGRESS: 'In progress',
		WAITING: 'Waiting',
		RESOLVED: 'Resolved',
		CLOSED: 'Closed'
	};

	const priorityBadge: Record<string, string> = {
		LOW: 'badge-ghost',
		MEDIUM: 'badge-info',
		HIGH: 'badge-warning',
		URGENT: 'badge-error'
	};

	const statusBadge: Record<string, string> = {
		OPEN: 'badge-info',
		IN_PROGRESS: 'badge-warning',
		WAITING: 'badge-ghost',
		RESOLVED: 'badge-success',
		CLOSED: 'badge-neutral'
	};

	const channelLabels: Record<string, string> = {
		PORTAL: 'Portal',
		EMAIL: 'Email',
		PHONE: 'Phone',
		MANUAL: 'Manual'
	};

	function relativeTime(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		const diff = Date.now() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	const currentStatus = $derived(page.url.searchParams.get('status') ?? '');
	const totalBreaches = $derived(
		data.slaBreach.responseBreached + data.slaBreach.resolutionBreached
	);
</script>

<svelte:head>
	<title>Tickets | Helpdesk</title>
</svelte:head>

<div class="space-y-4">
	<header class="app-page-header">
		<h1 class="app-page-title">Tickets</h1>
		<div class="flex flex-wrap items-center gap-3">
			<div class="app-inline-stats">
				<span class="app-inline-stat">
					<CircleDot size={14} class="text-info" />
					{data.stats.open} open
				</span>
				<span class="text-base-300">|</span>
				<span class="app-inline-stat">
					<Timer size={14} class="text-warning" />
					{data.stats.inProgress} active
				</span>
				<span class="text-base-300">|</span>
				<span class="app-inline-stat">
					<Clock3 size={14} class="text-success" />
					{data.stats.resolved} resolved
				</span>
				{#if totalBreaches > 0}
					<span class="text-base-300">|</span>
					<span class="app-inline-stat text-error">
						<AlertTriangle size={14} />
						{totalBreaches} SLA breach{totalBreaches === 1 ? '' : 'es'}
					</span>
				{/if}
			</div>
			<a href={resolve('/tickets/new')} class="btn btn-primary btn-sm gap-1.5">
				<Plus size={15} />
				New ticket
			</a>
		</div>
	</header>

	<!-- Status filter tabs -->
	<div class="flex flex-wrap gap-1.5">
		<a
			href={resolve('/tickets')}
			class="badge badge-sm {currentStatus === '' ? 'badge-primary' : 'badge-ghost'} cursor-pointer"
		>
			All
		</a>
		{#each ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'] as status (status)}
			<a
				href="{resolve('/tickets')}?status={status}"
				class="badge badge-sm {currentStatus.toUpperCase() === status ? 'badge-primary' : 'badge-ghost'} cursor-pointer"
			>
				{statusLabels[status]}
			</a>
		{/each}
	</div>

	{#if data.loadError}
		<EmptyState
			title="Could not load tickets"
			description={data.loadError}
		/>
	{:else if data.tickets.length === 0}
		<EmptyState
			title="No tickets yet"
			description="Create your first ticket to get started."
		/>
	{:else}
		<div class="data-table-shell">
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>#</th>
							<th>Title</th>
							<th>Contact</th>
							<th>Status</th>
							<th>Priority</th>
							<th>Channel</th>
							<th>Assignee</th>
							<th>Created</th>
							<th class="w-10"></th>
						</tr>
					</thead>
					<tbody>
						{#each data.tickets as ticket (ticket.id)}
							<tr class="hover:bg-base-200/40">
								<td class="font-mono text-xs text-base-content/50">{ticket.displayId}</td>
								<td>
									<a
										href={resolve(`/tickets/${ticket.id}`)}
										class="font-medium hover:text-primary"
									>
										{ticket.title}
									</a>
									{#if ticket._count.comments > 0}
										<span class="ml-1.5 inline-flex items-center gap-0.5 text-xs text-base-content/40">
											<MessageSquare size={12} />
											{ticket._count.comments}
										</span>
									{/if}
								</td>
								<td class="text-sm">
									<div class="font-medium">{ticket.contact.name}</div>
									{#if ticket.contact.company}
										<div class="text-xs text-base-content/40">{ticket.contact.company}</div>
									{/if}
								</td>
								<td>
									<span class="badge badge-sm {statusBadge[ticket.status]}">
										{statusLabels[ticket.status]}
									</span>
								</td>
								<td>
									<span class="badge badge-sm {priorityBadge[ticket.priority]}">
										{ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
									</span>
								</td>
								<td class="text-xs text-base-content/50">
									{channelLabels[ticket.channel] ?? ticket.channel}
								</td>
								<td class="text-sm text-base-content/60">
									{ticket.assignedTo?.name ?? '—'}
								</td>
								<td class="text-xs text-base-content/50">
									{relativeTime(ticket.createdAt)}
								</td>
								<td>
									<a
										href={resolve(`/tickets/${ticket.id}`)}
										class="btn btn-ghost btn-xs btn-square"
									>
										<ArrowUpRight size={14} />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="flex items-center justify-between pt-2 text-sm text-base-content/60">
				<span>{data.total} ticket{data.total === 1 ? '' : 's'}</span>
				<div class="join">
					{#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p (p)}
						<a
							href="{resolve('/tickets')}?page={p}{currentStatus ? `&status=${currentStatus}` : ''}"
							class="join-item btn btn-sm {p === data.page ? 'btn-active' : ''}"
						>
							{p}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
