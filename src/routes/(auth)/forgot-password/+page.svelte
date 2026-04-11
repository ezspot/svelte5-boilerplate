<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Forgot password | Acme SaaS</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
	<div class="surface-panel w-full p-8 md:p-10">
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Password reset</p>
		<h1 class="mt-4 text-3xl font-semibold">Request a reset link</h1>
		<p class="section-copy mt-3">
			The email service uses Resend with idempotency keys, so repeated submissions stay safe.
		</p>

		<div class="mt-6 space-y-4">
			<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />
		</div>

		<form class="mt-6 space-y-5" method="POST" use:enhance>
			<label class="form-control">
				<div class="label"><span class="label-text font-medium">Email</span></div>
				<input
					class="input-bordered input w-full"
					name="email"
					type="email"
					autocomplete="email"
					value={form?.values?.email ?? ''}
					required
				/>
			</label>

			<button class="btn w-full btn-primary" type="submit">Send reset email</button>
		</form>

		<p class="mt-6 text-sm text-base-content/70">
			Remembered it?
			<a class="link link-primary" href={resolve('/login')}>Back to sign in</a>
		</p>
	</div>
</div>
