<script lang="ts">
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Verify email | Acme SaaS</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
	<div class="surface-panel w-full p-8 md:p-10">
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
			Verification pending
		</p>
		<h1 class="mt-4 text-3xl font-semibold">Check your inbox</h1>
		<p class="section-copy mt-3">
			You need to verify your email before the account is fully active. The verification link will
			sign you in automatically and take you to the dashboard.
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
					value={form?.values?.email ?? data.email}
					required
				/>
			</label>

			<button class="btn w-full btn-primary" type="submit">Resend verification email</button>
		</form>
	</div>
</div>
