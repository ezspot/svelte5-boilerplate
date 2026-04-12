<script lang="ts">
	import { Clock3, KeyRound, ShieldCheck } from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Security settings | Acme SaaS</title>
</svelte:head>

<div class="space-y-4">
	<section class="app-content-card px-5 py-5 md:px-6">
		<p class="eyebrow">Security</p>
		<h1 class="mt-4 text-3xl font-semibold text-balance">
			Verification, reset, and session oversight.
		</h1>
		<p class="section-copy mt-4 text-base">
			The baseline keeps account security intentionally simple: verified email, clean reset flows,
			and clear visibility into active sessions.
		</p>

		<div class="metric-grid mt-6">
			<div class="surface-panel-muted p-4">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
					Email status
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<ShieldCheck size={16} class={data.emailVerified ? 'text-success' : 'text-warning'} />
					{data.emailVerified ? 'Verified' : 'Pending'}
				</p>
			</div>
			<div class="surface-panel-muted p-4">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
					Active sessions
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<Clock3 size={16} class="text-secondary" />
					{data.sessions.length} open session{data.sessions.length === 1 ? '' : 's'}
				</p>
			</div>
			<div class="surface-panel-muted p-4">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
					Recovery path
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<KeyRound size={16} class="text-primary" />
					{data.hasPassword ? 'Password enabled' : 'Magic link only'}
				</p>
			</div>
		</div>
	</section>

	<SectionCard
		title="Email verification"
		description="This baseline requires verified email addresses before a user can fully operate inside the app."
	>
		<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />
		<div class="surface-panel-muted flex flex-wrap items-center justify-between gap-3 p-4">
			<p class="text-sm">
				Status:
				<span class={`font-medium ${data.emailVerified ? 'text-success' : 'text-warning'}`}>
					{data.emailVerified ? 'Verified' : 'Pending'}
				</span>
			</p>
			{#if !data.emailVerified}
				<form method="POST" action="?/resendVerification">
					<button class="btn rounded-full btn-sm btn-primary" type="submit"
						>Resend verification</button
					>
				</form>
			{/if}
		</div>
	</SectionCard>

	<SectionCard
		title={data.hasPassword ? 'Password reset' : 'Add a password'}
		description={data.hasPassword
			? 'Use the same transactional email path that the public forgot-password flow uses.'
			: 'Magic link stays the default. Add a password only if the account needs a secondary sign-in method.'}
	>
		{#if data.hasPassword}
			<div class="surface-panel-muted flex items-center justify-between gap-3 p-4">
				<p class="text-sm text-base-content/68">
					Send a new password reset link to the account email.
				</p>
				<form method="POST" action="?/sendReset">
					<button class="btn rounded-full btn-outline" type="submit">Email reset link</button>
				</form>
			</div>
		{:else}
			<form class="grid gap-4 md:grid-cols-2" method="POST" action="?/setPassword">
				<label class="form-control">
					<div class="label"><span class="label-text font-medium">New password</span></div>
					<input
						class="input-bordered input w-full rounded-2xl"
						name="newPassword"
						type="password"
						autocomplete="new-password"
						required
					/>
				</label>
				<label class="form-control">
					<div class="label"><span class="label-text font-medium">Confirm password</span></div>
					<input
						class="input-bordered input w-full rounded-2xl"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
					/>
				</label>
				<div class="md:col-span-2">
					<button class="btn rounded-full btn-outline" type="submit">Add password</button>
				</div>
			</form>
		{/if}
	</SectionCard>

	<SectionCard
		title="Active sessions"
		description="The auth layer exposes the current session list for quick inspection."
	>
		<div class="data-table-shell hidden md:block">
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
		<div class="table-mobile-stack md:hidden">
			{#each data.sessions as session (session.id)}
				<article class="table-mobile-item">
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="text-sm font-semibold">
								{session.ipAddress ?? 'Unavailable'}
							</p>
							<p class="mt-1 text-xs text-base-content/55">
								Created {session.createdAt.toLocaleDateString()}
							</p>
						</div>
						<span class="badge rounded-full badge-outline">Session</span>
					</div>
					<div class="mt-3 space-y-2 text-sm text-base-content/66">
						<p>
							<span class="font-medium text-base-content">Expires:</span>
							{session.expiresAt.toLocaleString()}
						</p>
						<p class="break-words">
							<span class="font-medium text-base-content">User agent:</span>
							{session.userAgent ?? 'Unavailable'}
						</p>
					</div>
				</article>
			{/each}
		</div>
	</SectionCard>
</div>
