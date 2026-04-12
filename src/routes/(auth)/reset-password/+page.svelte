<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/ui/auth-shell.svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const features = [
		{
			label: 'Callback-driven',
			copy: 'This page is reached through the secure Better Auth reset callback rather than a client token flow.'
		},
		{
			label: 'Clean completion',
			copy: 'After the reset finishes, the user is routed back into the normal sign-in journey.'
		}
	];
</script>

<svelte:head>
	<title>Reset password | Acme SaaS</title>
</svelte:head>

<AuthShell
	eyebrow="Create a new password"
	title="Finish the reset flow"
	description="Reset completion stays server-driven so token validation and password mutation never move into browser state."
	{features}
>
	<div class="space-y-4">
		<FormAlert message={data.error} tone="error" />
		<FormAlert message={form?.message} tone="error" />
	</div>

	{#if data.token}
		<form class="mt-6 space-y-5" method="POST" use:enhance>
			<input type="hidden" name="token" value={form?.values?.token ?? data.token} />

			<label class="form-control">
				<div class="label"><span class="label-text font-medium">New password</span></div>
				<input
					class="input-bordered input w-full rounded-2xl"
					name="password"
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

			<button class="btn w-full rounded-full btn-primary" type="submit">Reset password</button>
		</form>
	{:else}
		<div class="mt-6">
			<a class="btn rounded-full btn-primary" href={resolve('/forgot-password')}
				>Request a new link</a
			>
		</div>
	{/if}
</AuthShell>
