<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import {
		AlertTriangle,
		ArrowLeft,
		Clock3,
		Mail,
		Send,
		Tag,
		User,
		UserCircle
	} from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let commentBody = $state('');

	const statusLabels: Record<string, string> = {
		OPEN: 'Open',
		IN_PROGRESS: 'In progress',
		WAITING: 'Waiting',
		RESOLVED: 'Resolved',
		CLOSED: 'Closed'
	};

	const priorityLabels: Record<string, string> = {
		LOW: 'Low',
		MEDIUM: 'Medium',
		HIGH: 'High',
		URGENT: 'Urgent'
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

	function formatDate(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
	}

	function isSlaBreached(dueAt: Date | string | null): boolean {
		if (!dueAt) return false;
		return new Date(dueAt).getTime() < Date.now();
	}

	function applyCannedResponse(body: string) {
		commentBody = body;
	}

	const ticket = $derived(data.ticket);
	const slaResponseBreached = $derived(
		!ticket.firstRespondedAt && isSlaBreached(ticket.slaFirstResponseDueAt)
	);
	const slaResolutionBreached = $derived(
		!ticket.closedAt && isSlaBreached(ticket.slaResolutionDueAt)
	);
</script>

<svelte:head>
	<title>{ticket.displayId} {ticket.title} | Helpdesk</title>
</svelte:head>

<div class="space-y-4">
	<header class="app-page-header">
		<div class="flex items-center gap-3">
			<a href={resolve('/tickets')} class="btn btn-ghost btn-sm btn-square">
				<ArrowLeft size={16} />
			</a>
			<div>
				<span class="font-mono text-xs text-base-content/40">{ticket.displayId}</span>
				<h1 class="app-page-title">{ticket.title}</h1>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<span class="badge {statusBadge[ticket.status]}">{statusLabels[ticket.status]}</span>
			<span class="badge badge-outline badge-sm">{priorityLabels[ticket.priority]}</span>
			<span class="badge badge-ghost badge-sm">{channelLabels[ticket.channel]}</span>
			{#if slaResponseBreached || slaResolutionBreached}
				<span class="badge badge-error badge-sm gap-1">
					<AlertTriangle size={12} />
					SLA breached
				</span>
			{/if}
		</div>
	</header>

	{#if form}
		<FormAlert
			message={form.message}
			tone={form.success ? 'success' : 'error'}
		/>
	{/if}

	<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
		<!-- Main content -->
		<div class="space-y-4">
			<!-- Description -->
			<div class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Description
				</p>
				<div class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-base-content/80">
					{ticket.description}
				</div>
				<p class="mt-4 text-xs text-base-content/40">
					{#if ticket.createdBy}
						Opened by {ticket.createdBy.name}
					{:else}
						Submitted via {channelLabels[ticket.channel]}
					{/if}
					on {formatDate(ticket.createdAt)}
				</p>
			</div>

			<!-- Activity thread -->
			<div class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Activity
				</p>

				{#if ticket.comments.length === 0}
					<p class="mt-3 text-sm text-base-content/50">No replies yet.</p>
				{:else}
					<div class="mt-3 space-y-4">
						{#each ticket.comments as comment (comment.id)}
							{@const isAgent = Boolean(comment.author)}
							{@const authorName = comment.author?.name ?? comment.contact?.name ?? 'Unknown'}
							<div
								class="flex gap-3 {comment.internal ? 'rounded-lg border border-warning/30 bg-warning/5 p-3' : ''}"
							>
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold
									{isAgent ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/60'}"
								>
									{authorName.slice(0, 1).toUpperCase()}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-center gap-2 text-sm">
										<span class="font-medium">{authorName}</span>
										{#if isAgent}
											<span class="badge badge-xs badge-primary badge-outline">Agent</span>
										{:else}
											<span class="badge badge-xs badge-ghost">Contact</span>
										{/if}
										{#if comment.internal}
											<span class="badge badge-xs badge-warning">Internal note</span>
										{/if}
										<span class="text-xs text-base-content/40">
											<Clock3 size={11} class="mr-0.5 inline" />
											{formatDate(comment.createdAt)}
										</span>
									</div>
									<p class="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-base-content/75">
										{comment.body}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Reply form -->
				<form
					class="mt-4 border-t border-base-300/60 pt-4"
					method="POST"
					action="?/comment"
					use:enhance
				>
					{#if data.cannedResponses.length > 0}
						<div class="mb-2 flex flex-wrap gap-1">
							{#each data.cannedResponses as cr (cr.id)}
								<button
									type="button"
									class="badge badge-ghost badge-sm cursor-pointer hover:badge-primary"
									onclick={() => applyCannedResponse(cr.body)}
								>
									{cr.title}
								</button>
							{/each}
						</div>
					{/if}
					<label class="form-control">
						<textarea
							class="textarea textarea-bordered w-full text-sm"
							name="body"
							rows="3"
							placeholder="Write a reply…"
							required
							bind:value={commentBody}
						></textarea>
					</label>
					<div class="mt-2 flex items-center justify-between">
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" name="internal" class="checkbox checkbox-xs" />
							<span class="text-base-content/60">Internal note</span>
						</label>
						<button class="btn btn-primary btn-sm gap-1.5" type="submit">
							<Send size={14} />
							Reply
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-3">
			<!-- Contact card -->
			<div class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Contact
				</p>
				<div class="mt-2 space-y-1 text-sm">
					<p class="flex items-center gap-1.5 font-medium">
						<UserCircle size={14} class="text-base-content/40" />
						{ticket.contact.name}
					</p>
					<p class="flex items-center gap-1.5 text-base-content/60">
						<Mail size={14} class="text-base-content/40" />
						{ticket.contact.email}
					</p>
					{#if ticket.contact.company}
						<p class="text-xs text-base-content/50">{ticket.contact.company}</p>
					{/if}
				</div>
			</div>

			<!-- Tags -->
			{#if ticket.tags.length > 0}
				<div class="dashboard-card">
					<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
						Tags
					</p>
					<div class="mt-2 flex flex-wrap gap-1">
						{#each ticket.tags as tag (tag.id)}
							<span
								class="badge badge-sm"
								style="background-color: {tag.color}20; color: {tag.color}; border-color: {tag.color}40"
							>
								<Tag size={10} class="mr-0.5" />
								{tag.name}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- SLA -->
			{#if ticket.slaFirstResponseDueAt || ticket.slaResolutionDueAt}
				<div class="dashboard-card text-xs">
					<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
						SLA
					</p>
					<div class="mt-2 space-y-1.5">
						{#if ticket.slaFirstResponseDueAt}
							<p class={slaResponseBreached ? 'font-medium text-error' : 'text-base-content/60'}>
								First response: {ticket.firstRespondedAt ? 'Met' : formatDate(ticket.slaFirstResponseDueAt)}
								{#if slaResponseBreached}
									<AlertTriangle size={12} class="ml-0.5 inline" />
								{/if}
							</p>
						{/if}
						{#if ticket.slaResolutionDueAt}
							<p class={slaResolutionBreached ? 'font-medium text-error' : 'text-base-content/60'}>
								Resolution: {ticket.closedAt ? 'Met' : formatDate(ticket.slaResolutionDueAt)}
								{#if slaResolutionBreached}
									<AlertTriangle size={12} class="ml-0.5 inline" />
								{/if}
							</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Manage form -->
			<form class="dashboard-card space-y-3" method="POST" action="?/update" use:enhance>
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Manage
				</p>

				<label class="form-control">
					<div class="label">
						<span class="label-text text-xs font-medium">Status</span>
					</div>
					<select class="select select-bordered select-sm w-full" name="status">
						{#each ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'] as s (s)}
							<option value={s} selected={ticket.status === s}>
								{statusLabels[s]}
							</option>
						{/each}
					</select>
				</label>

				<label class="form-control">
					<div class="label">
						<span class="label-text text-xs font-medium">Priority</span>
					</div>
					<select class="select select-bordered select-sm w-full" name="priority">
						{#each ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as p (p)}
							<option value={p} selected={ticket.priority === p}>
								{priorityLabels[p]}
							</option>
						{/each}
					</select>
				</label>

				<label class="form-control">
					<div class="label">
						<span class="label-text text-xs font-medium">Assignee</span>
					</div>
					<select class="select select-bordered select-sm w-full" name="assignedToId">
						<option value="">Unassigned</option>
						{#each data.members as member (member.id)}
							<option value={member.id} selected={ticket.assignedToId === member.id}>
								{member.name}
							</option>
						{/each}
					</select>
				</label>

				<button class="btn btn-primary btn-sm w-full" type="submit">Update</button>
			</form>

			<!-- Timestamps -->
			<div class="dashboard-card text-xs text-base-content/50">
				<p><span class="font-medium text-base-content/70">Created:</span> {formatDate(ticket.createdAt)}</p>
				<p class="mt-1"><span class="font-medium text-base-content/70">Updated:</span> {formatDate(ticket.updatedAt)}</p>
				{#if ticket.closedAt}
					<p class="mt-1"><span class="font-medium text-base-content/70">Closed:</span> {formatDate(ticket.closedAt)}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
