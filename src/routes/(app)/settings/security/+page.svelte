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
	<header class="app-page-header">
		<h1 class="app-page-title">Security</h1>
		<div class="app-inline-stats">
			<span class="app-inline-stat">
				<ShieldCheck size={14} class={data.emailVerified ? 'text-success' : 'text-warning'} />
				{data.emailVerified ? 'Verified' : 'Pending'}
			</span>
			<span class="text-base-300">|</span>
			<span class="app-inline-stat">
				<Clock3 size={14} />
				{data.sessions.length} session{data.sessions.length === 1 ? '' : 's'}
			</span>
			<span class="text-base-300">|</span>
			<span class="app-inline-stat">
				<KeyRound size={14} />
				{data.hasPassword ? 'Password enabled' : 'Magic link only'}
			</span>
		</div>
	</header>

	<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />

	<div class="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
		<div class="space-y-4">
			<SectionCard
				title="Email verification"
				description="This baseline requires verified email addresses before a user can fully operate inside the app."
				eyebrow="Identity trust"
			>
				<div class="surface-panel-muted flex flex-wrap items-center justify-between gap-3 p-4">
					<div>
						<p class="text-sm font-medium">
							Status:
							<span class={data.emailVerified ? 'text-success' : 'text-warning'}>
								{data.emailVerified ? 'Verified' : 'Pending'}
							</span>
						</p>
						<p class="mt-1 text-sm text-base-content/62">
							Verification emails route through the same transactional path as onboarding.
						</p>
					</div>
					{#if !data.emailVerified}
						<form method="POST" action="?/resendVerification">
							<button class="btn rounded-full btn-sm btn-primary" type="submit">
								Resend verification
							</button>
						</form>
					{/if}
				</div>
			</SectionCard>

			<SectionCard
				title={data.hasPassword ? 'Password reset' : 'Add a password'}
				description={data.hasPassword
					? 'Use the same transactional email path that the public forgot-password flow uses.'
					: 'Magic link stays the default. Add a password only if the account needs a secondary sign-in method.'}
				eyebrow="Credential path"
			>
				{#if data.hasPassword}
					<div class="surface-panel-muted flex items-center justify-between gap-3 p-4">
						<div>
							<p class="text-sm font-medium">Email a reset link</p>
							<p class="mt-1 text-sm text-base-content/62">
								Send a new password reset link to the account email.
							</p>
						</div>
						<form method="POST" action="?/sendReset">
							<button class="btn rounded-full btn-outline" type="submit"> Email reset link </button>
						</form>
					</div>
				{:else}
					<form class="grid gap-4 lg:grid-cols-2" method="POST" action="?/setPassword">
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
						<div class="flex justify-end lg:col-span-2">
							<button class="btn rounded-full btn-outline" type="submit">Add password</button>
						</div>
					</form>
				{/if}
			</SectionCard>

			<SectionCard
				title="Active sessions"
				description="The auth layer exposes the current session list for quick inspection."
				eyebrow="Session visibility"
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
								<p class="warp-break-word">
									<span class="font-medium text-base-content">User agent:</span>
									{session.userAgent ?? 'Unavailable'}
								</p>
							</div>
						</article>
					{/each}
				</div>
			</SectionCard>
		</div>

		<aside class="app-side-stack">
			<section class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Security notes
				</p>
				<div class="mt-4 space-y-3 text-sm text-base-content/66">
					<div class="app-note-card">
						<p class="font-medium">Primary sign-in</p>
						<p class="mt-2 leading-6">
							Magic link remains the lowest-friction path. Passwords are optional and stay additive.
						</p>
					</div>
					<div class="app-note-card">
						<p class="font-medium">Session review</p>
						<p class="mt-2 leading-6">
							Use the session list for quick visibility into currently active devices and browser
							agents.
						</p>
					</div>
				</div>
			</section>
		</aside>
	</div>
</div>
