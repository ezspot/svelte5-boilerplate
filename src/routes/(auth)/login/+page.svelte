<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/ui/auth-shell.svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const features = [
		{
			label: 'Server-first sessions',
			copy: 'Sign-in stays resilient without client-heavy auth orchestration.'
		},
		{
			label: 'Secure cookies',
			copy: 'Better Auth and SvelteKit keep session state aligned across SSR and actions.'
		}
	];
</script>

<svelte:head>
	<title>Sign in | Acme SaaS</title>
</svelte:head>

<AuthShell
	eyebrow="Welcome back"
	title="Sign in with a secure email link."
	description="The default enterprise path is passwordless sign-in. If you have already added a password from Security settings, you can use it as a secondary option."
	{features}
>
	<div class="space-y-4">
		<FormAlert message={data.notice} tone="success" />
		<FormAlert message={form?.message} tone="error" />
	</div>

	<form class="mt-6 space-y-5" method="POST" use:enhance>
		<input type="hidden" name="next" value={form?.values?.next ?? data.next} />
		<input type="hidden" name="invite" value={form?.values?.invite ?? data.invite} />

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

		<button class="btn w-full rounded-full btn-primary" type="submit"
			>Email me a sign-in link</button
		>
	</form>

	<div class="mt-6 rounded-2xl border border-base-300/75 bg-base-100/70 p-4">
		<p class="text-sm font-medium">Use a password instead</p>
		<p class="mt-1 text-sm text-base-content/66">
			This is only for accounts that already added a password from the Security page.
		</p>

		<form class="mt-4 space-y-4" method="POST" action="?/password" use:enhance>
			<input type="hidden" name="next" value={form?.values?.next ?? data.next} />
			<input type="hidden" name="invite" value={form?.values?.invite ?? data.invite} />

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

			<label class="form-control">
				<div class="label"><span class="label-text font-medium">Password</span></div>
				<input
					class="input-bordered input w-full rounded-2xl"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</label>

			<div class="flex flex-wrap items-center justify-between gap-3">
				<a
					class="text-sm text-base-content/70 hover:text-base-content"
					href={resolve('/forgot-password')}>Forgot your password?</a
				>
				<button class="btn rounded-full btn-outline" type="submit">Sign in with password</button>
			</div>
		</form>
	</div>

	<div class="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-base-content/70">
		<a class="hover:text-base-content" href={resolve('/register')}>Create an account</a>
		<span>Magic link first, password optional later.</span>
	</div>
</AuthShell>
