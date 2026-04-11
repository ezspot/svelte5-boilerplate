<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import LogoMark from '$lib/components/icons/logo-mark.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Sign in | Acme SaaS</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
	<div class="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr]">
		<div class="hidden lg:block">
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Welcome back</p>
			<h1 class="mt-4 text-4xl font-semibold text-balance">Sign in to the application shell.</h1>
			<p class="section-copy mt-4">
				Server actions keep the flow resilient without JavaScript, while Better Auth and secure
				cookies handle the session lifecycle behind the scenes.
			</p>
		</div>

		<div class="surface-panel w-full p-8 md:p-10">
			<div class="mb-8 flex items-center gap-3">
				<LogoMark />
				<div>
					<p class="text-sm font-semibold">Acme SaaS</p>
					<p class="text-xs text-base-content/60">Sign in</p>
				</div>
			</div>

			<div class="space-y-4">
				<FormAlert message={data.notice} tone="success" />
				<FormAlert message={form?.message} tone="error" />
			</div>

			<form class="mt-6 space-y-5" method="POST" use:enhance>
				<input type="hidden" name="next" value={form?.values?.next ?? data.next} />

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

				<label class="form-control">
					<div class="label"><span class="label-text font-medium">Password</span></div>
					<input
						class="input-bordered input w-full"
						name="password"
						type="password"
						autocomplete="current-password"
						required
					/>
				</label>

				<button class="btn w-full btn-primary" type="submit">Sign in</button>
			</form>

			<div
				class="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-base-content/70"
			>
				<a href={resolve('/forgot-password')}>Forgot your password?</a>
				<a href={resolve('/register')}>Create an account</a>
			</div>
		</div>
	</div>
</div>
