<script lang="ts">
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Security settings | Acme SaaS</title>
</svelte:head>

<div class="space-y-6">
	<SectionCard
		title="Email verification"
		description="This baseline requires verified email addresses before a user can fully operate inside the app."
	>
		<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />
		<div class="flex flex-wrap items-center justify-between gap-3">
			<p class="text-sm">
				Status:
				<span class={`font-medium ${data.emailVerified ? 'text-success' : 'text-warning'}`}>
					{data.emailVerified ? 'Verified' : 'Pending'}
				</span>
			</p>
			{#if !data.emailVerified}
				<form method="POST" action="?/resendVerification">
					<button class="btn btn-sm btn-primary" type="submit">Resend verification</button>
				</form>
			{/if}
		</div>
	</SectionCard>

	<SectionCard
		title="Password reset"
		description="Use the same transactional email path that the public forgot-password flow uses."
	>
		<form method="POST" action="?/sendReset">
			<button class="btn btn-outline" type="submit">Email reset link</button>
		</form>
	</SectionCard>

	<SectionCard
		title="Active sessions"
		description="The auth layer exposes the current session list for quick inspection."
	>
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Created</th>
						<th>Expires</th>
						<th>IP address</th>
						<th>User agent</th>
					</tr>
				</thead>
				<tbody>
					{#each data.sessions as session (session.id)}
						<tr>
							<td>{session.createdAt.toLocaleString()}</td>
							<td>{session.expiresAt.toLocaleString()}</td>
							<td>{session.ipAddress ?? 'Unavailable'}</td>
							<td class="max-w-xs truncate">{session.userAgent ?? 'Unavailable'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</SectionCard>
</div>
