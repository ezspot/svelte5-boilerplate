<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { ArrowLeft, ArrowUpRight, Mail, Phone, Building2 } from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const statusLabels: Record<string, string> = {
		OPEN: 'Open',
		IN_PROGRESS: 'In progress',
		WAITING: 'Waiting',
		RESOLVED: 'Resolved',
		CLOSED: 'Closed'
	};

	const statusBadge: Record<string, string> = {
		OPEN: 'badge-info',
		IN_PROGRESS: 'badge-warning',
		WAITING: 'badge-ghost',
		RESOLVED: 'badge-success',
		CLOSED: 'badge-neutral'
	};

	function formatDate(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
	}
</script>

<svelte:head>
	<title>{data.contact.name} | Contacts | Helpdesk</title>
</svelte:head>

<div class="space-y-4">
	<header class="app-page-header">
		<div class="flex items-center gap-2">
			<a href={resolve('/tickets/contacts')} class="btn btn-ghost btn-sm btn-square">
				<ArrowLeft size={16} />
			</a>
			<div>
				<h1 class="app-page-title">{data.contact.name}</h1>
				<p class="text-sm text-base-content/50">{data.contact.email}</p>
			</div>
		</div>
		<span class="text-sm text-base-content/50">{data.contact._count.tickets} ticket{data.contact._count.tickets === 1 ? '' : 's'}</span>
	</header>

	{#if form}
		<FormAlert
			message={form.message}
			tone={form.success ? 'success' : 'error'}
		/>
	{/if}

	<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
		<!-- Tickets -->
		<div class="dashboard-card">
			<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
				Recent tickets
			</p>
			{#if data.contact.tickets.length === 0}
				<p class="mt-3 text-sm text-base-content/50">No tickets from this contact.</p>
			{:else}
				<div class="mt-3 space-y-2">
					{#each data.contact.tickets as ticket (ticket.id)}
						<a
							href={resolve(`/tickets/${ticket.id}`)}
							class="flex items-center justify-between rounded-lg p-2 hover:bg-base-200/40"
						>
							<div>
								<span class="font-mono text-xs text-base-content/40">{ticket.displayId}</span>
								<span class="ml-1.5 text-sm font-medium">{ticket.title}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="badge badge-xs {statusBadge[ticket.status]}">
									{statusLabels[ticket.status]}
								</span>
								<span class="text-xs text-base-content/40">{formatDate(ticket.createdAt)}</span>
								<ArrowUpRight size={14} class="text-base-content/30" />
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Edit contact -->
		<form class="dashboard-card space-y-3" method="POST" action="?/update" use:enhance>
			<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
				Contact details
			</p>

			<label class="form-control">
				<div class="label"><span class="label-text text-xs font-medium">Name</span></div>
				<input
					name="name"
					type="text"
					class="input input-bordered input-sm w-full"
					required
					value={form?.values?.name ?? data.contact.name}
				/>
			</label>

			<label class="form-control">
				<div class="label"><span class="label-text text-xs font-medium">Email</span></div>
				<input type="email" class="input input-bordered input-sm w-full" disabled value={data.contact.email} />
			</label>

			<label class="form-control">
				<div class="label"><span class="label-text text-xs font-medium">Phone</span></div>
				<input
					name="phone"
					type="text"
					class="input input-bordered input-sm w-full"
					value={form?.values?.phone ?? data.contact.phone ?? ''}
				/>
			</label>

			<label class="form-control">
				<div class="label"><span class="label-text text-xs font-medium">Company</span></div>
				<input
					name="company"
					type="text"
					class="input input-bordered input-sm w-full"
					value={form?.values?.company ?? data.contact.company ?? ''}
				/>
			</label>

			<button class="btn btn-primary btn-sm w-full" type="submit">Save</button>
		</form>
	</div>
</div>
