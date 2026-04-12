<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/ui/auth-shell.svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	const features = [
		{
			label: 'Safe repeat submits',
			copy: 'The email service uses idempotency controls so repeat requests stay operationally safe.'
		},
		{
			label: 'Server-driven recovery',
			copy: 'Reset handling stays on the server and uses the same transactional mail path as production.'
		}
	];
</script>

<svelte:head>
	<title>Forgot password | Acme SaaS</title>
</svelte:head>

<AuthShell
	eyebrow="Password reset"
	title="Request a reset link"
	description="Recover access without introducing client-side auth complexity into the baseline."
	{features}
>
	<div class="mt-2 space-y-4">
		<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />
	</div>

	<form class="mt-6 space-y-5" method="POST" use:enhance>
		<label class="form-control">
			<div class="label"><span class="label-text font-medium">Email</span></div>
			<input
				class="input-bordered input w-full rounded-2xl"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.values?.email ?? ''}
				required
			/>
		</label>

		<button class="btn w-full rounded-full btn-primary" type="submit">Send reset email</button>
	</form>

	<p class="mt-6 text-sm text-base-content/70">
		Remembered it?
		<a class="link link-primary" href={resolve('/login')}>Back to sign in</a>
	</p>
</AuthShell>
