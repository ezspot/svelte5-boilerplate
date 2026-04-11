<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Reset password | Acme SaaS</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
	<div class="surface-panel w-full p-8 md:p-10">
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
			Create a new password
		</p>
		<h1 class="mt-4 text-3xl font-semibold">Finish the reset flow</h1>
		<p class="section-copy mt-3">
			This page is reached through the Better Auth password reset callback and stays server-driven.
		</p>

		<div class="mt-6 space-y-4">
			<FormAlert message={data.error} tone="error" />
			<FormAlert message={form?.message} tone="error" />
		</div>

		{#if data.token}
			<form class="mt-6 space-y-5" method="POST" use:enhance>
				<input type="hidden" name="token" value={form?.values?.token ?? data.token} />

				<label class="form-control">
					<div class="label"><span class="label-text font-medium">New password</span></div>
					<input
						class="input-bordered input w-full"
						name="password"
						type="password"
						autocomplete="new-password"
						required
					/>
				</label>

				<label class="form-control">
					<div class="label"><span class="label-text font-medium">Confirm password</span></div>
					<input
						class="input-bordered input w-full"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
					/>
				</label>

				<button class="btn w-full btn-primary" type="submit">Reset password</button>
			</form>
		{:else}
			<div class="mt-6">
				<a class="btn btn-primary" href={resolve('/forgot-password')}>Request a new link</a>
			</div>
		{/if}
	</div>
</div>
