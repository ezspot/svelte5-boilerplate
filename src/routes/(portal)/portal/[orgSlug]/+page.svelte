<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { CheckCircle, Send } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Submit a Request | {data.organization.name}</title>
</svelte:head>

<div class="space-y-6">
	<div class="text-center">
		<h1 class="text-2xl font-bold">{data.organization.name}</h1>
		<p class="mt-1 text-base-content/60">Submit a support request</p>
	</div>

	{#if form?.success}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<CheckCircle size={40} class="text-success" />
				<h2 class="mt-2 text-lg font-semibold">Ticket submitted!</h2>
				<p class="text-sm text-base-content/60">{form.message}</p>
				{#if form.publicId}
					<a
						href="/portal/{page.params.orgSlug}/ticket/{form.publicId}"
						class="btn btn-primary btn-sm mt-3"
					>
						View your ticket
					</a>
				{/if}
			</div>
		</div>
	{:else}
		{#if form?.message}
			<div class="alert alert-error text-sm">{form.message}</div>
		{/if}

		<form method="POST" action="?/submit" use:enhance class="card bg-base-100 shadow-sm">
			<div class="card-body gap-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-medium">Your name</span></div>
						<input
							name="contactName"
							type="text"
							class="input input-bordered w-full"
							required
							value={form?.values?.contactName ?? ''}
						/>
					</label>
					<label class="form-control w-full">
						<div class="label"><span class="label-text font-medium">Your email</span></div>
						<input
							name="contactEmail"
							type="email"
							class="input input-bordered w-full"
							required
							value={form?.values?.contactEmail ?? ''}
						/>
					</label>
				</div>

				<label class="form-control w-full">
					<div class="label"><span class="label-text font-medium">Subject</span></div>
					<input
						name="title"
						type="text"
						class="input input-bordered w-full"
						required
						minlength={3}
						maxlength={200}
						value={form?.values?.title ?? ''}
					/>
				</label>

				<label class="form-control w-full">
					<div class="label"><span class="label-text font-medium">Description</span></div>
					<textarea
						name="description"
						class="textarea textarea-bordered w-full"
						rows={5}
						required
						minlength={10}
						maxlength={5000}
					>{form?.values?.description ?? ''}</textarea>
				</label>

				<button type="submit" class="btn btn-primary gap-1.5">
					<Send size={16} />
					Submit request
				</button>
			</div>
		</form>
	{/if}
</div>
