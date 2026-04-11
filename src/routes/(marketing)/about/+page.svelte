<svelte:head>
	<title>About | Acme SaaS</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-6 py-16">
	<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">About this starter</p>
	<h1 class="mt-4 text-4xl font-semibold text-balance">
		Built for product teams that want less scaffolding drift.
	</h1>
	<div class="section-copy mt-6 space-y-4 text-base">
		<p>
			The goal is not to prebuild every SaaS feature. The goal is to give you the production
			infrastructure that usually gets rebuilt badly under deadline pressure.
		</p>
		<p>
			The app uses SvelteKit SSR for authenticated surfaces, prerenders public marketing routes when
			it is safe, and keeps database access inside server modules instead of components.
		</p>
	</div>
</section>
