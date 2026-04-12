<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { initializePaddle } from '@paddle/paddle-js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let checkoutState = $state<'opening' | 'opened' | 'fallback'>('opening');
	let checkoutError = $state<string | null>(null);

	onMount(() => {
		let cancelled = false;

		const openCheckout = async () => {
			try {
				const paddle = await initializePaddle({
					token: data.clientToken,
					environment: data.environment
				});

				if (!paddle || cancelled) {
					checkoutState = 'fallback';
					return;
				}

				paddle.Checkout.open({
					transactionId: data.transactionId,
					settings: {
						successUrl: data.successUrl
					}
				});

				checkoutState = 'opened';
			} catch {
				checkoutError = 'Secure checkout could not be opened automatically.';
				checkoutState = 'fallback';
			}
		};

		void openCheckout();

		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>Checkout | Acme SaaS</title>
</svelte:head>

<section class="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
	<div class="surface-panel w-full space-y-6 p-8 text-center md:p-10">
		<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Secure checkout</p>
		<h1 class="text-3xl font-semibold text-balance">
			Starting {data.plan.name} for your workspace
		</h1>
		<p class="section-copy mx-auto max-w-2xl">
			Checkout opens through Paddle. If the overlay does not appear, continue with the hosted
			checkout page below.
		</p>

		<div
			class="mx-auto max-w-xl rounded-2xl border border-base-300/70 bg-base-200/40 p-5 text-left"
		>
			<p class="font-medium">{data.plan.name}</p>
			<p class="mt-2 text-sm text-base-content/70">{data.plan.priceLabel}</p>
			<p class="mt-3 text-sm leading-6 text-base-content/75">{data.plan.description}</p>
		</div>

		{#if checkoutError}
			<div class="alert text-sm alert-error">{checkoutError}</div>
		{/if}

		<div class="space-y-3">
			{#if checkoutState === 'opening'}
				<p class="text-sm text-base-content/65">Opening secure checkout...</p>
			{:else if checkoutState === 'opened'}
				<p class="text-sm text-base-content/65">
					If you closed the overlay, you can still continue below.
				</p>
			{:else}
				<p class="text-sm text-base-content/65">
					Automatic checkout was unavailable in this browser session.
				</p>
			{/if}

			<div class="flex flex-wrap justify-center gap-3">
				<form method="GET" action={data.checkoutUrl}>
					<button class="btn btn-primary" type="submit">Continue to checkout</button>
				</form>
				<a class="btn btn-outline" href={resolve('/settings/billing')}>Back to billing</a>
			</div>
		</div>
	</div>
</section>
