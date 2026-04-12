<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/ui/auth-shell.svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const features = [
		{
			label: 'Trusted activation',
			copy: 'The session starts only after the link proves inbox access.'
		},
		{
			label: 'Automatic sign-in',
			copy: 'The link finishes sign-in and lands the user directly in the app.'
		}
	];
</script>

<svelte:head>
	<title>Verify email | Acme SaaS</title>
</svelte:head>

<AuthShell
	eyebrow={data.flow === 'magic-link' ? 'Check your inbox' : 'Verification pending'}
	title="Check your inbox"
	description={data.flow === 'magic-link'
		? data.intent === 'signup'
			? 'We sent a secure link to finish creating the account. Opening it starts the first session automatically.'
			: 'We sent a secure sign-in link. Opening it starts the session without needing a password.'
		: 'Your account is created, but access stays locked until the email address is verified. The verification link finishes sign-in automatically and redirects to the dashboard.'}
	{features}
>
	<div class="surface-panel-muted p-4 text-sm text-base-content/75">
		<p class="font-medium">What happens next</p>
		<div class="mt-3 grid gap-3 md:grid-cols-3">
			<div class="rounded-2xl bg-base-100/80 p-3">
				1. Open the {data.flow === 'magic-link' ? 'sign-in' : 'verification'} email.
			</div>
			<div class="rounded-2xl bg-base-100/80 p-3">2. Click the secure link.</div>
			<div class="rounded-2xl bg-base-100/80 p-3">3. Land in the app with an active session.</div>
		</div>
	</div>

	<div class="mt-6 space-y-4">
		<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />
	</div>

	<form class="mt-6 space-y-5" method="POST" use:enhance>
		<input type="hidden" name="flow" value={data.flow} />
		<input type="hidden" name="intent" value={data.intent} />
		<input type="hidden" name="name" value={data.name} />
		<input type="hidden" name="invite" value={data.invite} />
		<input type="hidden" name="next" value={data.next} />

		<label class="form-control">
			<div class="label"><span class="label-text font-medium">Email</span></div>
			<input
				class="input-bordered input w-full rounded-2xl"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.values?.email ?? data.email}
				required
			/>
		</label>

		<button class="btn w-full rounded-full btn-primary" type="submit"
			>{data.flow === 'magic-link' ? 'Resend sign-in link' : 'Resend verification email'}</button
		>
	</form>
</AuthShell>
