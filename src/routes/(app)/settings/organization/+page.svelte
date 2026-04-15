<script lang="ts">
	import { enhance } from '$app/forms';
	import { Building2, MailPlus, UserRoundCheck, UsersRound } from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const renameValues = $derived(form?.values && 'name' in form.values ? form.values : null);
	const inviteValues = $derived(form?.values && 'email' in form.values ? form.values : null);
</script>

<svelte:head>
	<title>Organization settings | Acme SaaS</title>
</svelte:head>

<div class="space-y-4">
	<header class="app-page-header">
		<h1 class="app-page-title">Organization</h1>
		<div class="app-inline-stats">
			<span class="app-inline-stat">
				<Building2 size={14} />
				{data.organization.name}
			</span>
			<span class="text-base-300">|</span>
			<span class="app-inline-stat">
				<UsersRound size={14} />
				{data.organization.memberships.length} members
			</span>
			<span class="text-base-300">|</span>
			<span class="app-inline-stat">
				<MailPlus size={14} />
				{data.organization.invitations.length} pending
			</span>
		</div>
	</header>

	<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />

	<div class="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
		<div class="space-y-4">
			<SectionCard
				title="Workspace details"
				description="This is the minimal multi-tenant control surface included in the starter."
				eyebrow="Workspace identity"
			>
				<form class="space-y-5" method="POST" action="?/rename" use:enhance>
					<label class="form-control">
						<div class="label">
							<span class="label-text font-medium">Workspace name</span>
						</div>
						<input
							class="input-bordered input w-full rounded-2xl"
							name="name"
							type="text"
							value={renameValues?.name ?? data.organization.name}
							required
						/>
					</label>
					<div class="flex justify-end">
						<button class="btn rounded-full btn-primary" type="submit">Update workspace</button>
					</div>
				</form>
			</SectionCard>

			<SectionCard
				title="Invite teammate"
				description="Invite emails are sent through Resend and recorded in the audit trail."
				eyebrow="Collaboration access"
			>
				{#if data.organization.planKey === 'free'}
					<div class="alert text-sm alert-info">
						Free workspaces are single-owner by default. Upgrade billing to unlock teammate invites.
					</div>
				{/if}

				<form
					class="grid gap-4 xl:grid-cols-[1.35fr_0.8fr_auto]"
					method="POST"
					action="?/invite"
					use:enhance
				>
					<input
						class="input-bordered input w-full rounded-2xl"
						name="email"
						type="email"
						placeholder="teammate@example.com"
						value={inviteValues?.email ?? ''}
						disabled={data.organization.planKey === 'free'}
						required
					/>
					<select
						class="select-bordered select w-full rounded-2xl"
						name="role"
						disabled={data.organization.planKey === 'free'}
					>
						<option value="MEMBER" selected={(inviteValues?.role ?? 'MEMBER') === 'MEMBER'}>
							Member
						</option>
						<option value="ADMIN" selected={inviteValues?.role === 'ADMIN'}>Admin</option>
					</select>
					<button
						class="btn rounded-full btn-primary"
						type="submit"
						disabled={data.organization.planKey === 'free'}
					>
						Send invite
					</button>
				</form>
			</SectionCard>

			<div class="grid gap-4 xl:grid-cols-2">
				<SectionCard
					title="Members"
					description="Current workspace membership."
					eyebrow="Workspace roster"
				>
					<div class="data-table-shell hidden md:block">
						<table class="table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									<th>Role</th>
								</tr>
							</thead>
							<tbody>
								{#each data.organization.memberships as membership (membership.id)}
									<tr>
										<td class="font-medium">
											<div class="flex items-center gap-2">
												<UserRoundCheck size={15} class="text-primary" />
												{membership.user.name}
											</div>
										</td>
										<td>{membership.user.email}</td>
										<td>{membership.role}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="table-mobile-stack md:hidden">
						{#each data.organization.memberships as membership (membership.id)}
							<article class="table-mobile-item">
								<div class="flex items-start justify-between gap-3">
									<div>
										<p class="flex items-center gap-2 text-sm font-semibold">
											<UserRoundCheck size={15} class="text-primary" />
											{membership.user.name}
										</p>
										<p class="mt-1 text-sm text-base-content/62">
											{membership.user.email}
										</p>
									</div>
									<span class="badge rounded-full badge-outline">{membership.role}</span>
								</div>
							</article>
						{/each}
					</div>
				</SectionCard>

				<SectionCard
					title="Pending invitations"
					description="Invitation acceptance is supported for new registrations in this baseline."
					eyebrow="Invite queue"
				>
					<div class="data-table-shell hidden md:block">
						<table class="table">
							<thead>
								<tr>
									<th>Email</th>
									<th>Role</th>
									<th>Status</th>
									<th>Expires</th>
								</tr>
							</thead>
							<tbody>
								{#if data.organization.invitations.length}
									{#each data.organization.invitations as invitation (invitation.id)}
										<tr>
											<td>{invitation.email}</td>
											<td>{invitation.role}</td>
											<td>{invitation.status}</td>
											<td>{invitation.expiresAt.toLocaleDateString()}</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td colspan="4" class="text-base-content/60">No invitations yet.</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
					{#if data.organization.invitations.length}
						<div class="table-mobile-stack md:hidden">
							{#each data.organization.invitations as invitation (invitation.id)}
								<article class="table-mobile-item">
									<div class="flex items-start justify-between gap-3">
										<div>
											<p class="text-sm font-semibold">{invitation.email}</p>
											<p class="mt-1 text-xs text-base-content/55">
												Expires {invitation.expiresAt.toLocaleDateString()}
											</p>
										</div>
										<span class="badge rounded-full badge-outline">{invitation.status}</span>
									</div>
									<div class="mt-3 flex items-center justify-between gap-3 text-sm">
										<span class="text-base-content/62">Role</span>
										<span class="font-medium">{invitation.role}</span>
									</div>
								</article>
							{/each}
						</div>
					{:else}
						<div
							class="rounded-xl border border-dashed border-base-300/70 bg-base-200/28 px-4 py-6 text-sm text-base-content/58 md:hidden"
						>
							No invitations yet.
						</div>
					{/if}
				</SectionCard>
			</div>
		</div>

		<aside class="app-side-stack">
			<section class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Workspace notes
				</p>
				<div class="mt-4 space-y-3 text-sm text-base-content/66">
					<div class="app-note-card">
						<p class="font-medium">Invite policy</p>
						<p class="mt-2 leading-6">
							{data.organization.planKey === 'free'
								? 'This workspace is in solo mode until billing is upgraded.'
								: 'Team invites are enabled for this workspace plan.'}
						</p>
					</div>
					<div class="app-note-card">
						<p class="font-medium">Membership roles</p>
						<p class="mt-2 leading-6">
							Admins can operate organization settings. Members stay scoped to standard workspace
							use.
						</p>
					</div>
				</div>
			</section>
		</aside>
	</div>
</div>
