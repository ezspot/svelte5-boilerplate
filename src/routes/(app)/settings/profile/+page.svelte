<script lang="ts">
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/ui/form-alert.svelte';
	import SectionCard from '$lib/components/ui/section-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Profile settings | Acme SaaS</title>
</svelte:head>

<SectionCard
	title="Profile"
	description="Basic account information stays on the server and updates through a regular HTML form."
>
	<FormAlert message={form?.message} tone={form?.success ? 'success' : 'error'} />

	<form class="space-y-5" method="POST" use:enhance>
		<label class="form-control">
			<div class="label"><span class="label-text font-medium">Name</span></div>
			<input
				class="input-bordered input w-full"
				name="name"
				type="text"
				value={form?.values?.name ?? data.profile.name}
				required
			/>
		</label>

		<label class="form-control">
			<div class="label"><span class="label-text font-medium">Avatar URL</span></div>
			<input
				class="input-bordered input w-full"
				name="image"
				type="url"
				value={form?.values?.image ?? data.profile.image ?? ''}
			/>
		</label>

		<div class="flex flex-wrap items-center justify-between gap-3">
			<p class="text-sm text-base-content/60">{data.profile.email}</p>
			<button class="btn btn-primary" type="submit">Save profile</button>
		</div>
	</form>
</SectionCard>
