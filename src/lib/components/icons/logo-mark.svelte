<script lang="ts">
	import { Sparkles } from '@lucide/svelte';

	type Props = {
		size?: number;
	};

	let { size = 18 }: Props = $props();
</script>

<span
	class="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_100%)] p-2.5 text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.55)]"
>
	<Sparkles {size} strokeWidth={2.15} />
</span>
