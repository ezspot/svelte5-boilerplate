<svelte:head>
	<title>About | Acme SaaS</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-16 md:px-6">
	<div class="hero-surface px-6 py-8 md:px-8 md:py-10">
		<p class="eyebrow">About this starter</p>
		<h1 class="mt-4 max-w-4xl text-4xl font-semibold text-balance md:text-5xl">
			Built for teams that want less scaffolding drift and fewer platform do-overs.
		</h1>
		<div class="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
			<div class="space-y-4 text-base leading-7 text-base-content/72">
				<p>
					The goal is not to prebuild every SaaS feature. The goal is to give you the production
					infrastructure that usually gets rebuilt badly once deadlines get real.
				</p>
				<p>
					The app uses SvelteKit SSR for authenticated surfaces, prerenders public routes when it is
					safe, and keeps database access and product logic inside server modules instead of inside
					Svelte components.
				</p>
			</div>

			<div class="surface-panel-muted grid gap-4 p-5">
				<div>
					<p class="eyebrow">Default principles</p>
					<p class="mt-3 text-lg font-semibold">Production-ready without product lock-in</p>
				</div>
				<ul class="space-y-3 text-sm text-base-content/70">
					<li>One Prisma schema and migration path.</li>
					<li>Server-first auth and forms.</li>
					<li>Billing integrated without making billing the architecture.</li>
					<li>Feature modules kept small and replaceable.</li>
				</ul>
			</div>
		</div>
	</div>
</section>
