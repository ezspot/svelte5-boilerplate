<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { ArrowLeft, Mail, MessageSquareText, Plus, Settings2, ShieldCheck, Trash2 } from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let activeTab = $state<'general' | 'email' | 'canned' | 'sla'>('general');
	$effect(() => {
		if (form?.tab) activeTab = form.tab;
	});
	let showCannedForm = $state(false);
	let showSlaForm = $state(false);

	const priorityLabels: Record<string, string> = {
		LOW: 'Low',
		MEDIUM: 'Medium',
		HIGH: 'High',
		URGENT: 'Urgent'
	};
</script>

<svelte:head>
	<title>Helpdesk Settings</title>
</svelte:head>

<div class="space-y-4">
	<header class="app-page-header">
		<div class="flex items-center gap-2">
			<a href={resolve('/tickets')} class="btn btn-ghost btn-sm btn-square">
				<ArrowLeft size={16} />
			</a>
			<h1 class="app-page-title">Helpdesk Settings</h1>
		</div>
	</header>

	{#if form}
		<FormAlert
			message={form.message}
			tone={form.success ? 'success' : 'error'}
		/>
	{/if}

	<!-- Tabs -->
	<div role="tablist" class="tabs tabs-bordered">
		<button role="tab" class="tab {activeTab === 'general' ? 'tab-active' : ''}" onclick={() => (activeTab = 'general')}>
			<Settings2 size={14} class="mr-1.5" /> General
		</button>
		<button role="tab" class="tab {activeTab === 'email' ? 'tab-active' : ''}" onclick={() => (activeTab = 'email')}>
			<Mail size={14} class="mr-1.5" /> Email
		</button>
		<button role="tab" class="tab {activeTab === 'canned' ? 'tab-active' : ''}" onclick={() => (activeTab = 'canned')}>
			<MessageSquareText size={14} class="mr-1.5" /> Canned Responses
		</button>
		<button role="tab" class="tab {activeTab === 'sla' ? 'tab-active' : ''}" onclick={() => (activeTab = 'sla')}>
			<ShieldCheck size={14} class="mr-1.5" /> SLA Policies
		</button>
	</div>

	<!-- General tab -->
	{#if activeTab === 'general'}
		<div class="card bg-base-100 shadow-sm">
			<form method="POST" action="?/saveTicketPrefix" use:enhance class="card-body gap-4">
				<h2 class="card-title text-base">Ticket Numbering</h2>
				<p class="text-sm text-base-content/60">Set a prefix for your ticket display IDs (e.g. TKT, HELP, SUP). New tickets will be numbered like <span class="font-mono">{data.ticketPrefix}-A7X9K2</span>.</p>
				<label class="form-control w-full max-w-xs">
					<div class="label"><span class="label-text text-xs">Ticket prefix</span></div>
					<input name="ticketPrefix" type="text" class="input input-bordered input-sm uppercase" value={data.ticketPrefix} minlength="2" maxlength="10" pattern="[A-Za-z0-9]+" required />
				</label>
				<div class="flex justify-end">
					<button type="submit" class="btn btn-primary btn-sm">Save prefix</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Email tab -->
	{#if activeTab === 'email'}
		<div class="card bg-base-100 shadow-sm">
			<form method="POST" action="?/saveHelpdeskSettings" use:enhance class="card-body gap-4">
				<h2 class="card-title text-base">Email Configuration</h2>
				<p class="text-sm text-base-content/60">Configure your organization's email settings for ticket notifications. Leave blank to use the platform defaults.</p>
				<div class="grid gap-3 sm:grid-cols-2">
					<label class="form-control w-full">
						<div class="label"><span class="label-text text-xs">From name</span></div>
						<input name="fromName" type="text" class="input input-bordered input-sm w-full" value={data.helpdeskSettings?.fromName ?? ''} placeholder="Support Team" />
					</label>
					<label class="form-control w-full">
						<div class="label"><span class="label-text text-xs">From email</span></div>
						<input name="fromEmail" type="email" class="input input-bordered input-sm w-full" value={data.helpdeskSettings?.fromEmail ?? ''} placeholder="support@yourcompany.com" />
					</label>
				</div>
				<label class="form-control w-full">
					<div class="label"><span class="label-text text-xs">Resend API key (optional — override platform key)</span></div>
					<input name="resendApiKey" type="password" class="input input-bordered input-sm w-full" value={data.helpdeskSettings?.resendApiKey ?? ''} placeholder="re_..." autocomplete="off" />
				</label>
				<label class="form-control w-full">
					<div class="label"><span class="label-text text-xs">Inbound webhook secret</span></div>
					<input name="inboundWebhookSecret" type="password" class="input input-bordered input-sm w-full" value={data.helpdeskSettings?.inboundWebhookSecret ?? ''} placeholder="whsec_..." autocomplete="off" />
				</label>
				<div class="flex justify-end">
					<button type="submit" class="btn btn-primary btn-sm">Save email settings</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Canned Responses tab -->
	{#if activeTab === 'canned'}
		<div class="space-y-3">
			<div class="flex justify-end">
				<button class="btn btn-primary btn-sm gap-1.5" onclick={() => (showCannedForm = !showCannedForm)}>
					<Plus size={15} />
					Add response
				</button>
			</div>

			{#if showCannedForm}
				<form method="POST" action="?/createCanned" use:enhance class="card bg-base-100 shadow-sm">
					<div class="card-body gap-3">
						<div class="grid gap-3 sm:grid-cols-2">
							<input name="title" type="text" class="input input-bordered input-sm w-full" placeholder="Title" required />
							<input name="shortcut" type="text" class="input input-bordered input-sm w-full" placeholder="Shortcut (optional)" />
						</div>
						<textarea name="body" class="textarea textarea-bordered w-full text-sm" rows="3" placeholder="Response body…" required></textarea>
						<div class="flex justify-end gap-2">
							<button type="button" class="btn btn-ghost btn-sm" onclick={() => (showCannedForm = false)}>Cancel</button>
							<button type="submit" class="btn btn-primary btn-sm">Create</button>
						</div>
					</div>
				</form>
			{/if}

			{#if data.cannedResponses.length === 0}
				<p class="text-sm text-base-content/50">No canned responses yet. Create one to speed up agent replies.</p>
			{:else}
				<div class="space-y-2">
					{#each data.cannedResponses as cr (cr.id)}
						<div class="dashboard-card flex items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium">{cr.title}</p>
								{#if cr.shortcut}
									<p class="text-xs text-base-content/40">/{cr.shortcut}</p>
								{/if}
								<p class="mt-1 text-sm text-base-content/60 line-clamp-2">{cr.body}</p>
							</div>
							<form method="POST" action="?/deleteCanned" use:enhance>
								<input type="hidden" name="id" value={cr.id} />
								<button type="submit" class="btn btn-ghost btn-xs btn-square text-error/60 hover:text-error">
									<Trash2 size={14} />
								</button>
							</form>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- SLA Policies tab -->
	{#if activeTab === 'sla'}
		<div class="space-y-3">
			<div class="flex justify-end">
				<button class="btn btn-primary btn-sm gap-1.5" onclick={() => (showSlaForm = !showSlaForm)}>
					<Plus size={15} />
					Add policy
				</button>
			</div>

			{#if showSlaForm}
				<form method="POST" action="?/upsertSla" use:enhance class="card bg-base-100 shadow-sm">
					<div class="card-body gap-3">
						<div class="grid gap-3 sm:grid-cols-2">
							<input name="name" type="text" class="input input-bordered input-sm w-full" placeholder="Policy name" required />
							<select name="priority" class="select select-bordered select-sm w-full" required>
								<option value="" disabled selected>Priority…</option>
								{#each ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as p (p)}
									<option value={p}>{priorityLabels[p]}</option>
								{/each}
							</select>
						</div>
						<div class="grid gap-3 sm:grid-cols-2">
							<label class="form-control">
								<div class="label"><span class="label-text text-xs">First response (minutes)</span></div>
								<input name="firstResponseMinutes" type="number" class="input input-bordered input-sm w-full" min="1" required />
							</label>
							<label class="form-control">
								<div class="label"><span class="label-text text-xs">Resolution (minutes)</span></div>
								<input name="resolutionMinutes" type="number" class="input input-bordered input-sm w-full" min="1" required />
							</label>
						</div>
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" name="isDefault" class="checkbox checkbox-xs" />
							<span class="text-base-content/60">Set as default for this priority</span>
						</label>
						<div class="flex justify-end gap-2">
							<button type="button" class="btn btn-ghost btn-sm" onclick={() => (showSlaForm = false)}>Cancel</button>
							<button type="submit" class="btn btn-primary btn-sm">Save</button>
						</div>
					</div>
				</form>
			{/if}

			{#if data.slaPolicies.length === 0}
				<p class="text-sm text-base-content/50">No SLA policies yet. Define one per priority level.</p>
			{:else}
				<div class="data-table-shell">
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Priority</th>
									<th>First Response</th>
									<th>Resolution</th>
									<th>Default</th>
									<th class="w-10"></th>
								</tr>
							</thead>
							<tbody>
								{#each data.slaPolicies as policy (policy.id)}
									<tr>
										<td class="font-medium text-sm">{policy.name}</td>
										<td class="text-sm">{priorityLabels[policy.priority]}</td>
										<td class="text-sm">{policy.firstResponseMinutes}m</td>
										<td class="text-sm">{policy.resolutionMinutes}m</td>
										<td>{policy.isDefault ? '✓' : ''}</td>
										<td>
											<form method="POST" action="?/deleteSla" use:enhance>
												<input type="hidden" name="id" value={policy.id} />
												<button type="submit" class="btn btn-ghost btn-xs btn-square text-error/60 hover:text-error">
													<Trash2 size={14} />
												</button>
											</form>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
