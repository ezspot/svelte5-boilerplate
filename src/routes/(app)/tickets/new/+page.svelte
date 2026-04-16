<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { ArrowLeft } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>New Ticket | Helpdesk</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-4">
	<header class="app-page-header">
		<div class="flex items-center gap-2">
			<a href={resolve('/tickets')} class="btn btn-ghost btn-sm btn-square">
				<ArrowLeft size={16} />
			</a>
			<h1 class="app-page-title">New ticket</h1>
		</div>
	</header>

	{#if form?.message}
		<div class="alert alert-error text-sm">{form.message}</div>
	{/if}

	<form method="POST" use:enhance class="card bg-base-100 shadow-sm">
		<div class="card-body gap-4">
			<label class="form-control w-full">
				<div class="label"><span class="label-text font-medium">Contact</span></div>
				<select name="contactId" class="select select-bordered w-full" required>
					<option value="" disabled selected={!form?.values?.contactId}>Select contact…</option>
					{#each data.contacts as contact (contact.id)}
						<option value={contact.id} selected={contact.id === form?.values?.contactId}>
							{contact.name} ({contact.email}){contact.company ? ` — ${contact.company}` : ''}
						</option>
					{/each}
				</select>
			</label>

			<label class="form-control w-full">
				<div class="label"><span class="label-text font-medium">Title</span></div>
				<input
					name="title"
					type="text"
					class="input input-bordered w-full"
					required
					minlength={3}
					maxlength={200}
					value={form?.values?.title ?? ''}
				/>
			</label>

			<label class="form-control w-full">
				<div class="label"><span class="label-text font-medium">Description</span></div>
				<textarea
					name="description"
					class="textarea textarea-bordered w-full"
					rows={5}
					required
					minlength={10}
					maxlength={5000}>{form?.values?.description ?? ''}</textarea>
			</label>

			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<label class="form-control w-full">
					<div class="label"><span class="label-text font-medium">Priority</span></div>
					<select name="priority" class="select select-bordered w-full">
						{#each ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as p (p)}
							<option value={p} selected={p === (form?.values?.priority ?? 'MEDIUM')}>
								{p.charAt(0) + p.slice(1).toLowerCase()}
							</option>
						{/each}
					</select>
				</label>

				<label class="form-control w-full">
					<div class="label"><span class="label-text font-medium">Channel</span></div>
					<select name="channel" class="select select-bordered w-full">
						{#each ['MANUAL', 'EMAIL', 'PHONE'] as ch (ch)}
							<option value={ch} selected={ch === (form?.values?.channel ?? 'MANUAL')}>
								{ch.charAt(0) + ch.slice(1).toLowerCase()}
							</option>
						{/each}
					</select>
				</label>

				<label class="form-control w-full">
					<div class="label"><span class="label-text font-medium">Assignee</span></div>
					<select name="assignedToId" class="select select-bordered w-full">
						<option value="">Unassigned</option>
						{#each data.members as member (member.id)}
							<option value={member.id} selected={member.id === form?.values?.assignedToId}>
								{member.name}
							</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="card-actions justify-end pt-2">
				<a href={resolve('/tickets')} class="btn btn-ghost btn-sm">Cancel</a>
				<button type="submit" class="btn btn-primary btn-sm">Create ticket</button>
			</div>
		</div>
	</form>
</div>
