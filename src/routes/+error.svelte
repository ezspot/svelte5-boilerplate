<script lang="ts">
	/* eslint-disable svelte/valid-prop-names-in-kit-pages */
	import { resolve } from '$app/paths';

	let { error, status }: { error: App.Error | null | undefined; status: number } = $props();

	const message = $derived(error?.message ?? 'The request could not be completed.');
	const displayStatus = $derived(status || 500);
</script>

<svelte:head>
	<title>{displayStatus} | Something went wrong</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
	<div class="surface-panel w-full p-8 md:p-10">
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Application error</p>
		<h1 class="mt-3 text-3xl font-semibold text-balance">We hit an unexpected issue.</h1>
		<p class="section-copy mt-4">
			{message}
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a class="btn btn-primary" href={resolve('/dashboard')}>Back to dashboard</a>
			<a class="btn btn-ghost" href={resolve('/')}>Go home</a>
		</div>
	</div>
</div>
