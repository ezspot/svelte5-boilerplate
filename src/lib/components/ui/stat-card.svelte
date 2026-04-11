<script lang="ts">
	type Props = {
		label: string;
		value: string;
		description: string;
	};

	let { label, value, description }: Props = $props();
</script>

<div class="surface-panel p-6">
	<p class="text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">{label}</p>
	<p class="mt-3 text-3xl font-semibold">{value}</p>
	<p class="section-copy mt-2">{description}</p>
</div>
