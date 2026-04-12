<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/ui/auth-shell.svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const features = [
		{
			label: 'Magic-link first',
			copy: 'New accounts start with a secure email link instead of requiring a password on day one.'
		},
		{
			label: 'Workspace-aware',
			copy: 'Invitation links still attach the user to the target organization after sign-in completes.'
		}
	];
</script>

<svelte:head>
	<title>Create account | Acme SaaS</title>
</svelte:head>

<AuthShell
	eyebrow="Create account"
	title="Start from a lean multi-tenant baseline."
	description="Create the account with name and email, then finish sign-in from the secure link we send. Passwords stay optional and can be added later from Security settings."
	{features}
>
	{#if data.invitation}
		<div class="mb-5 alert text-sm alert-info">
			You are joining <strong>{data.invitation.organizationName}</strong> as
			<strong>{data.invitation.role.toLowerCase()}</strong>.
		</div>
	{/if}

	<FormAlert message={form?.message} tone="error" />

	<form class="mt-6 space-y-5" method="POST" use:enhance>
		<input type="hidden" name="invite" value={data.inviteToken ?? ''} />

		<label class="form-control">
			<div class="label"><span class="label-text font-medium">Full name</span></div>
			<input
				class="input-bordered input w-full rounded-2xl"
				name="name"
				type="text"
				autocomplete="name"
				value={form?.values?.name ?? ''}
				required
			/>
		</label>

		<label class="form-control">
			<div class="label"><span class="label-text font-medium">Email</span></div>
			<input
				class="input-bordered input w-full rounded-2xl"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.values?.email ?? data.invitation?.email ?? ''}
				required
			/>
		</label>

		<button class="btn w-full rounded-full btn-primary" type="submit">
			Send my secure sign-in link
		</button>
	</form>

	<p class="mt-4 text-sm text-base-content/65">
		We email a secure link that finishes account setup and starts the first session.
	</p>

	<p class="mt-6 text-sm text-base-content/70">
		Already have an account?
		<a class="link link-primary" href={resolve('/login')}>Sign in</a>
	</p>
</AuthShell>
