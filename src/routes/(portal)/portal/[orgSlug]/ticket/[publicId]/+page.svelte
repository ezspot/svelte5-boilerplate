<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { ArrowLeft, Clock3, Send } from '@lucide/svelte';
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
		return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
	}

	const ticket = $derived(data.ticket);
</script>

<svelte:head>
	<title>{ticket.title} | Support</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center gap-2">
		<a href="/portal/{page.params.orgSlug}" class="btn btn-ghost btn-sm btn-square">
			<ArrowLeft size={16} />
		</a>
		<div>
			<h1 class="text-lg font-bold">{ticket.title}</h1>
			<div class="flex items-center gap-2 text-sm text-base-content/50">
				<span class="badge badge-sm {statusBadge[ticket.status]}">
					{statusLabels[ticket.status]}
				</span>
				<span>Submitted {formatDate(ticket.createdAt)}</span>
			</div>
		</div>
	</div>

	{#if form}
		<FormAlert
			message={form.message}
			tone={form.success ? 'success' : 'error'}
		/>
	{/if}

	<!-- Description -->
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<p class="whitespace-pre-wrap text-sm leading-relaxed text-base-content/80">
				{ticket.description}
			</p>
		</div>
	</div>

	<!-- Thread -->
	{#if ticket.comments.length > 0}
		<div class="space-y-3">
			{#each ticket.comments as comment (comment.id)}
				{@const isAgent = Boolean(comment.author)}
				{@const authorName = comment.author?.name ?? comment.contact?.name ?? 'You'}
				<div class="card bg-base-100 shadow-sm {isAgent ? 'border-l-4 border-primary' : ''}">
					<div class="card-body gap-2 py-3">
						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium">{authorName}</span>
							{#if isAgent}
								<span class="badge badge-xs badge-primary badge-outline">Support</span>
							{/if}
							<span class="text-xs text-base-content/40">
								<Clock3 size={11} class="mr-0.5 inline" />
								{formatDate(comment.createdAt)}
							</span>
						</div>
						<p class="whitespace-pre-wrap text-sm leading-relaxed text-base-content/75">
							{comment.body}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Reply -->
	{#if ticket.status !== 'CLOSED'}
		<form method="POST" action="?/reply" use:enhance class="card bg-base-100 shadow-sm">
			<div class="card-body gap-3">
				<textarea
					class="textarea textarea-bordered w-full text-sm"
					name="body"
					rows="3"
					placeholder="Add a reply…"
					required
				></textarea>
				<div class="flex justify-end">
					<button class="btn btn-primary btn-sm gap-1.5" type="submit">
						<Send size={14} />
						Reply
					</button>
				</div>
			</div>
		</form>
	{:else}
		<p class="text-center text-sm text-base-content/50">This ticket has been closed.</p>
	{/if}
</div>
