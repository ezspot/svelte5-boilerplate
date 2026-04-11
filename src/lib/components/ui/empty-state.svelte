<script lang="ts">
	import { resolve } from '$app/paths';

	type Props = {
		title: string;
		description: string;
		actionHref?: string;
		actionLabel?: string;
	};

	let { title, description, actionHref = undefined, actionLabel = undefined }: Props = $props();
</script>

<div class="surface-panel flex flex-col items-start gap-4 p-8">
	<div>
		<h3 class="text-lg font-semibold">{title}</h3>
		<p class="section-copy mt-2">{description}</p>
	</div>

	{#if actionHref && actionLabel}
		<a class="btn btn-sm btn-primary" href={resolve(actionHref)}>{actionLabel}</a>
	{/if}
</div>
