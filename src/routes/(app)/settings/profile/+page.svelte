<script lang="ts">
	import { enhance } from '$app/forms';
	import { BadgeCheck, CalendarDays, Mail } from '@lucide/svelte';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Profile settings | Acme SaaS</title>
</svelte:head>

<div class="space-y-4">
	<section class="app-header-card">
		<div>
			<div class="app-header-meta">
				<span class="app-meta-pill">Profile</span>
				<span class="app-meta-pill">
					<Mail size={14} class="text-primary" />
					{data.profile.email}
				</span>
			</div>
			<h1 class="mt-4 text-3xl font-semibold tracking-tight text-balance">
				Account identity and operator context.
			</h1>
			<p class="section-copy mt-3 text-base">
				Keep the primary user record current so audit trails, billing communications, and team
				operations stay trustworthy.
			</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-3 lg:w-[30rem]">
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Email
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<Mail size={16} class="text-primary" />
					{data.profile.email}
				</p>
			</div>
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Verification
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<BadgeCheck
						size={16}
						class={data.profile.emailVerified ? 'text-success' : 'text-warning'}
					/>
					{data.profile.emailVerified ? 'Verified' : 'Pending'}
				</p>
			</div>
			<div class="app-kpi-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase">
					Member since
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<CalendarDays size={16} class="text-secondary" />
					{data.profile.createdAt.toLocaleDateString()}
				</p>
			</div>
		</div>
	</section>

	<div class="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
		<SectionCard
			title="Profile details"
			description="Basic account information stays on the server and updates through a regular HTML form."
			eyebrow="Account record"
		>
			<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />

			<form class="space-y-4" method="POST" use:enhance>
				<div class="grid gap-4 lg:grid-cols-2">
					<label class="form-control">
						<div class="label"><span class="label-text font-medium">Name</span></div>
						<input
							class="input-bordered input w-full rounded-2xl"
							name="name"
							type="text"
							value={form?.values?.name ?? data.profile.name}
							required
						/>
					</label>

					<label class="form-control">
						<div class="label"><span class="label-text font-medium">Avatar URL</span></div>
						<input
							class="input-bordered input w-full rounded-2xl"
							name="image"
							type="url"
							value={form?.values?.image ?? data.profile.image ?? ''}
						/>
					</label>
				</div>

				<div class="surface-panel-muted flex flex-wrap items-center justify-between gap-3 p-4">
					<div>
						<p class="text-sm font-medium">{data.profile.email}</p>
						<p class="mt-1 text-sm text-base-content/62">
							Profile changes update the canonical account record for this user.
						</p>
					</div>
					<button class="btn rounded-full btn-primary" type="submit">Save profile</button>
				</div>
			</form>
		</SectionCard>

		<aside class="app-side-stack">
			<section class="dashboard-card">
				<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
					Identity notes
				</p>
				<div class="mt-4 space-y-3 text-sm text-base-content/66">
					<div class="app-note-card">
						<p class="font-medium">Verification posture</p>
						<p class="mt-2 leading-6">
							{data.profile.emailVerified
								? 'This account is verified and can complete privileged flows without extra setup.'
								: 'Email verification is still pending. Some flows stay limited until verification is complete.'}
						</p>
					</div>
					<div class="app-note-card">
						<p class="font-medium">Audit consistency</p>
						<p class="mt-2 leading-6">
							Display name changes propagate to future audit entries and workspace-facing identity
							surfaces.
						</p>
					</div>
				</div>
			</section>
		</aside>
	</div>
</div>
