<script lang="ts">
	import { enhance } from '$app/forms';
	import { BadgeCheck, CalendarDays, CreditCard, UsersRound } from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const actionSucceeded = $derived(Boolean(form && 'success' in form && form.success));

	function formatDate(value: Date | null) {
		if (!value) {
			return 'Not scheduled';
		}

		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium'
		}).format(value);
	}
</script>

<svelte:head>
	<title>Billing settings | Acme SaaS</title>
</svelte:head>

<div class="space-y-4">
	<section class="app-header-card">
		<div>
			<div class="app-header-meta">
				<span class="app-meta-pill">Billing</span>
				<span class="app-meta-pill">{data.billing.currentPlan.name}</span>
			</div>
			<h1 class="mt-4 text-3xl font-semibold tracking-tight text-balance">
				Commercial controls with a lighter operational footprint.
			</h1>
			<p class="section-copy mt-3 text-base">
				Merchant-of-record billing keeps Europe-first tax and compliance handling simpler while
				preserving a clean path to US expansion.
			</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-2 lg:w-[42rem] xl:grid-cols-4">
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Plan
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<CreditCard size={16} class="text-primary" />
					{data.billing.currentPlan.name}
				</p>
			</div>
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Status
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<BadgeCheck size={16} class="text-success" />
					{data.billing.statusLabel}
				</p>
			</div>
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Next billing date
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<CalendarDays size={16} class="text-secondary" />
					{formatDate(data.billing.renewalAt)}
				</p>
			</div>
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Collaboration
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<UsersRound size={16} class="text-primary" />
					{data.billing.allowsTeamInvites ? 'Invites enabled' : 'Upgrade required'}
				</p>
			</div>
		</div>
	</section>

	<FormAlert
		message={data.notice ?? form?.message}
		tone={data.notice ? 'info' : actionSucceeded ? 'success' : 'error'}
	/>

	<div class="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
		<div class="space-y-4">
			<SectionCard
				title="Billing overview"
				description="Plan state, commercial contact details, and portal access stay inside one clean workspace surface."
				eyebrow="Commercial state"
			>
				<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					<div class="app-kpi-card">
						<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
							Plan
						</p>
						<p class="mt-3 text-2xl font-semibold tracking-tight">
							{data.billing.currentPlan.name}
						</p>
					</div>
					<div class="app-kpi-card">
						<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
							Status
						</p>
						<p class="mt-3 text-lg font-semibold">{data.billing.statusLabel}</p>
					</div>
					<div class="app-kpi-card">
						<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
							Next billing date
						</p>
						<p class="mt-3 text-sm leading-6">{formatDate(data.billing.renewalAt)}</p>
					</div>
					<div class="app-kpi-card">
						<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
							Team invites
						</p>
						<p class="mt-3 text-sm leading-6">
							{data.billing.allowsTeamInvites
								? 'Included on this plan'
								: 'Upgrade to invite teammates'}
						</p>
					</div>
				</div>

				<div class="surface-panel-muted flex flex-wrap items-center justify-between gap-3 p-4">
					<div class="space-y-1">
						<p class="font-medium">Billing email</p>
						<p class="text-sm text-base-content/65">
							{data.billing.billingEmail ?? 'Will default to the workspace owner email'}
						</p>
					</div>

					{#if data.billing.customerPortalAvailable}
						<form method="POST" action="?/portal" use:enhance>
							<button class="btn rounded-full btn-outline" type="submit">
								Open billing portal
							</button>
						</form>
					{/if}
				</div>
			</SectionCard>

			<SectionCard
				title="Plans"
				description="Free is intentionally narrow. Paid plans unlock collaboration, and subscription changes move through Paddle after the first checkout."
				eyebrow="Plan catalog"
			>
				<div class="grid gap-4 xl:grid-cols-3">
					{#each data.billing.plans as plan (plan.key)}
						<div
							class={`surface-panel flex h-full flex-col gap-4 p-6 ${
								plan.highlighted
									? 'shadow-[0_18px_60px_-30px_rgba(30,64,175,0.3)] ring-1 ring-primary/25'
									: ''
							}`}
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<p
										class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase"
									>
										{plan.name}
									</p>
									<p class="mt-3 text-3xl font-semibold tracking-tight">
										{plan.priceLabel}
									</p>
								</div>
								{#if plan.isCurrent}
									<span class="badge rounded-full badge-outline badge-primary">Current</span>
								{/if}
							</div>

							<p class="section-copy">{plan.description}</p>

							<ul class="space-y-2 text-sm text-base-content/75">
								{#each plan.features as feature (feature)}
									<li class="flex gap-3">
										<span class="mt-2 h-2 w-2 rounded-full bg-primary"></span>
										<span>{feature}</span>
									</li>
								{/each}
							</ul>

							<div class="mt-auto pt-2">
								{#if plan.key === 'free'}
									<button class="btn w-full rounded-full btn-ghost" type="button" disabled>
										{plan.ctaLabel}
									</button>
								{:else if plan.canStartCheckout}
									<form method="POST" action="?/checkout" use:enhance>
										<input type="hidden" name="planKey" value={plan.key} />
										<button
											class={`btn w-full rounded-full ${
												plan.highlighted ? 'btn-primary' : 'btn-outline'
											}`}
											type="submit"
										>
											{plan.ctaLabel}
										</button>
									</form>
								{:else}
									<button class="btn w-full rounded-full btn-ghost" type="button" disabled>
										Use portal to manage
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</SectionCard>
		</div>

		<aside class="app-side-stack">
			<section class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Billing notes
				</p>
				<div class="mt-4 space-y-3 text-sm text-base-content/66">
					<div class="app-note-card">
						<p class="font-medium">Merchant of record</p>
						<p class="mt-2 leading-6">
							Paddle handles invoicing and tax collection so the application surface can stay lean.
						</p>
					</div>
					<div class="app-note-card">
						<p class="font-medium">Upgrade path</p>
						<p class="mt-2 leading-6">
							Plan upgrades immediately unlock collaboration boundaries once the provider confirms
							the subscription.
						</p>
					</div>
				</div>
			</section>
		</aside>
	</div>
</div>
