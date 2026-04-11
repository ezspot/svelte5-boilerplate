<script lang="ts">
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Organization settings | Acme SaaS</title>
</svelte:head>

<div class="space-y-6">
	<SectionCard
		title="Workspace details"
		description="This is the minimal multi-tenant control surface included in the starter."
	>
		<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />
		<form class="space-y-5" method="POST" action="?/rename" use:enhance>
			<label class="form-control">
				<div class="label"><span class="label-text font-medium">Workspace name</span></div>
				<input
					class="input-bordered input w-full"
					name="name"
					type="text"
					value={data.organization.name}
					required
				/>
			</label>
			<button class="btn btn-primary" type="submit">Update workspace</button>
		</form>
	</SectionCard>

	<SectionCard
		title="Invite teammate"
		description="Invite emails are sent through Resend and recorded in the audit trail."
	>
		<form
			class="grid gap-4 md:grid-cols-[1.4fr_0.8fr_auto]"
			method="POST"
			action="?/invite"
			use:enhance
		>
			<input
				class="input-bordered input w-full"
				name="email"
				type="email"
				placeholder="teammate@example.com"
				value=""
				required
			/>
			<select class="select-bordered select w-full" name="role">
				<option value="MEMBER">Member</option>
				<option value="ADMIN">Admin</option>
			</select>
			<button class="btn btn-primary" type="submit">Send invite</button>
		</form>
	</SectionCard>

	<SectionCard title="Members" description="Current workspace membership.">
		<div class="overflow-x-auto">
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
							<td>{membership.user.name}</td>
							<td>{membership.user.email}</td>
							<td>{membership.role}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</SectionCard>

	<SectionCard
		title="Pending invitations"
		description="Invitation acceptance is supported for new registrations in this baseline."
	>
		<div class="overflow-x-auto">
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
	</SectionCard>
</div>
