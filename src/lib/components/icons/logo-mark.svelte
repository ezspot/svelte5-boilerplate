<script lang="ts">
	import { LayoutGrid } from '@lucide/svelte';

	type Props = {
		size?: number;
	};

	let { size = 18 }: Props = $props();
</script>

<span
	class="inline-flex items-center justify-center rounded-xl bg-primary p-2 text-primary-content shadow-sm"
>
	<LayoutGrid {size} strokeWidth={2.2} />
</span>
