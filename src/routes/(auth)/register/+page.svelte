<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Create account | Acme SaaS</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
	<div class="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr]">
		<div class="hidden lg:block">
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Create account</p>
			<h1 class="mt-4 text-4xl font-semibold text-balance">
				Start from a lean multi-tenant baseline.
			</h1>
			<p class="section-copy mt-4">
				A personal workspace is provisioned automatically the first time the user reaches the app
				shell, and invitation links can attach the new user to an existing workspace.
			</p>
		</div>

		<div class="surface-panel w-full p-8 md:p-10">
			<div class="mb-8 flex items-center gap-3">
				<LogoMark />
				<div>
					<p class="text-sm font-semibold">Acme SaaS</p>
					<p class="text-xs text-base-content/60">Registration</p>
				</div>
			</div>

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
						class="input-bordered input w-full"
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
						class="input-bordered input w-full"
						name="email"
						type="email"
						autocomplete="email"
						value={form?.values?.email ?? data.invitation?.email ?? ''}
						required
					/>
				</label>

				<div class="grid gap-5 md:grid-cols-2">
					<label class="form-control">
						<div class="label"><span class="label-text font-medium">Password</span></div>
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
				</div>

				<button class="btn w-full btn-primary" type="submit">Create account</button>
			</form>

			<p class="mt-6 text-sm text-base-content/70">
				Already have an account?
				<a class="link link-primary" href={resolve('/login')}>Sign in</a>
			</p>
		</div>
	</div>
</div>
