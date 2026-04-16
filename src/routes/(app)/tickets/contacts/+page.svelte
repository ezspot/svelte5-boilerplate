<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { ArrowLeft, Building2, Mail, Phone, Plus, Search, UserPlus } from '@lucide/svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let showForm = $state(false);
</script>

<svelte:head>
	<title>Contacts | Helpdesk</title>
</svelte:head>

<div class="space-y-4">
	<header class="app-page-header">
		<div class="flex items-center gap-2">
			<a href={resolve('/tickets')} class="btn btn-ghost btn-sm btn-square">
				<ArrowLeft size={16} />
			</a>
			<h1 class="app-page-title">Contacts</h1>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm text-base-content/50">{data.total} total</span>
			<button class="btn btn-primary btn-sm gap-1.5" onclick={() => (showForm = !showForm)}>
				<UserPlus size={15} />
				Add contact
			</button>
		</div>
	</header>

	{#if form}
		<FormAlert
			message={form.message}
			tone={form.success ? 'success' : 'error'}
		/>
	{/if}

	<!-- Inline create form -->
	{#if showForm}
		<form method="POST" action="?/create" use:enhance class="card bg-base-100 shadow-sm">
			<div class="card-body gap-3">
				<p class="text-sm font-medium">New contact</p>
				<div class="grid gap-3 sm:grid-cols-2">
					<input name="name" type="text" class="input input-bordered input-sm w-full" placeholder="Name" required value={form?.values?.name ?? ''} />
					<input name="email" type="email" class="input input-bordered input-sm w-full" placeholder="Email" required value={form?.values?.email ?? ''} />
					<input name="phone" type="text" class="input input-bordered input-sm w-full" placeholder="Phone (optional)" value={form?.values?.phone ?? ''} />
					<input name="company" type="text" class="input input-bordered input-sm w-full" placeholder="Company (optional)" value={form?.values?.company ?? ''} />
				</div>
				<div class="flex justify-end gap-2">
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => (showForm = false)}>Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Create</button>
				</div>
			</div>
		</form>
	{/if}

	<!-- Search -->
	<form method="GET" class="flex gap-2">
		<label class="input input-bordered input-sm flex items-center gap-2 flex-1">
			<Search size={14} class="text-base-content/40" />
			<input type="text" name="q" class="grow" placeholder="Search contacts…" value={data.search} />
		</label>
		<button type="submit" class="btn btn-sm btn-ghost">Search</button>
	</form>

	{#if data.loadError}
		<EmptyState title="Could not load contacts" description={data.loadError} />
	{:else if data.contacts.length === 0}
		<EmptyState
			title="No contacts yet"
			description="Contacts are created automatically when tickets are submitted, or add one manually."
		/>
	{:else}
		<div class="data-table-shell">
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Company</th>
							<th>Tickets</th>
							<th class="w-10"></th>
						</tr>
					</thead>
					<tbody>
						{#each data.contacts as contact (contact.id)}
							<tr class="hover:bg-base-200/40">
								<td class="font-medium">{contact.name}</td>
								<td class="text-sm text-base-content/60">
									<span class="inline-flex items-center gap-1">
										<Mail size={12} />
										{contact.email}
									</span>
								</td>
								<td class="text-sm text-base-content/50">{contact.company ?? '—'}</td>
								<td class="text-sm">{contact._count.tickets}</td>
								<td>
									<a
										href={resolve(`/tickets/contacts/${contact.id}`)}
										class="btn btn-ghost btn-xs"
									>
										View
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		{#if data.totalPages > 1}
			<div class="flex items-center justify-between pt-2 text-sm text-base-content/60">
				<span>{data.total} contact{data.total === 1 ? '' : 's'}</span>
				<div class="join">
					{#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p (p)}
						<a
							href="{resolve('/tickets/contacts')}?page={p}{data.search ? `&q=${data.search}` : ''}"
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
