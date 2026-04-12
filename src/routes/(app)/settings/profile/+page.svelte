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
	<section class="app-content-card px-5 py-5 md:px-6">
		<p class="eyebrow">Profile</p>
		<h1 class="mt-4 text-3xl font-semibold text-balance">Account identity and operator context.</h1>
		<p class="section-copy mt-4 text-base">
			Keep the primary user record current so audit trails, billing communications, and team
			operations stay trustworthy.
		</p>

		<div class="metric-grid mt-6">
			<div class="surface-panel-muted p-4">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">Email</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<Mail size={16} class="text-primary" />
					{data.profile.email}
				</p>
			</div>
			<div class="surface-panel-muted p-4">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
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
			<div class="surface-panel-muted p-4">
				<p class="text-xs font-semibold tracking-[0.18em] text-base-content/55 uppercase">
					Member since
				</p>
				<p class="mt-3 flex items-center gap-2 text-sm font-medium">
					<CalendarDays size={16} class="text-secondary" />
					{data.profile.createdAt.toLocaleDateString()}
				</p>
			</div>
		</div>
	</section>

	<SectionCard
		title="Profile details"
		description="Basic account information stays on the server and updates through a regular HTML form."
	>
		<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />

		<form class="space-y-4" method="POST" use:enhance>
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

			<div class="surface-panel-muted flex flex-wrap items-center justify-between gap-3 p-4">
				<p class="text-sm text-base-content/65">{data.profile.email}</p>
				<button class="btn rounded-full btn-primary" type="submit">Save profile</button>
			</div>
		</form>
	</SectionCard>
</div>
