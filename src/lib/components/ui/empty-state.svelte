<script lang="ts">
	import { resolve } from '$app/paths';

	type Props = {
		title: string;
		description: string;
		actionHref?: '/settings/organization';
		actionLabel?: string;
	};

	let { title, description, actionHref = undefined, actionLabel = undefined }: Props = $props();
</script>

<div class="dashboard-card flex flex-col items-start gap-4">
	<div>
		<p class="eyebrow">Status</p>
		<h3 class="mt-2 text-lg font-semibold">{title}</h3>
		<p class="section-copy mt-2">{description}</p>
	</div>

	{#if actionHref && actionLabel}
		<a class="btn btn-sm btn-primary" href={resolve(actionHref)}>{actionLabel}</a>
	{/if}
</div>
