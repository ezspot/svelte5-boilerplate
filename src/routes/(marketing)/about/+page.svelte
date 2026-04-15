<svelte:head>
	<title>About | Acme SaaS</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-16 md:px-6">
	<div class="marketing-panel px-6 py-8 md:px-8 md:py-10">
		<span class="marketing-badge">About this starter</span>
		<h1 class="mt-5 max-w-4xl text-4xl font-semibold text-balance text-white md:text-5xl">
			Built for teams that want less scaffolding drift and fewer platform do-overs.
		</h1>
		<div class="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
			<div class="space-y-4 text-base leading-7 text-slate-300">
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

			<div class="rounded-3xl border border-white/10 bg-white/6 p-5 text-slate-100">
				<div>
					<p class="eyebrow">Default principles</p>
					<p class="mt-3 text-lg font-semibold">Production-ready without product lock-in</p>
				</div>
				<ul class="space-y-3 text-sm text-slate-300">
					<li>One Prisma schema and migration path.</li>
					<li>Server-first auth and forms.</li>
					<li>Billing integrated without making billing the architecture.</li>
					<li>Feature modules kept small and replaceable.</li>
				</ul>
			</div>
		</div>
	</div>

	<div class="mt-8 grid gap-5 md:grid-cols-3">
		<div class="marketing-panel-muted p-6">
			<p class="eyebrow">Auth</p>
			<p class="mt-3 text-xl font-semibold">Security that reads cleanly</p>
			<p class="mt-2 text-sm leading-6 text-base-content/68">
				Magic-link onboarding, verification, and optional password support stay aligned with SSR and
				server actions.
			</p>
		</div>
		<div class="marketing-panel-muted p-6">
			<p class="eyebrow">Data</p>
			<p class="mt-3 text-xl font-semibold">One boring source of truth</p>
			<p class="mt-2 text-sm leading-6 text-base-content/68">
				Prisma owns schema and migrations so auth and domain data don’t drift into parallel systems.
			</p>
		</div>
		<div class="marketing-panel-muted p-6">
			<p class="eyebrow">Operations</p>
			<p class="mt-3 text-xl font-semibold">Boundaries ready for growth</p>
			<p class="mt-2 text-sm leading-6 text-base-content/68">
				Email, billing, organizations, and account logic stay modular enough for real product
				extension work.
			</p>
		</div>
	</div>
</section>
