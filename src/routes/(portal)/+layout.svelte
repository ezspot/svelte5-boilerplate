<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-base-200/40">
	<div class="mx-auto max-w-2xl px-4 py-8">
		{@render children()}
	</div>
</div>
