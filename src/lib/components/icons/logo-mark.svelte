<script lang="ts">
	import { Sparkles } from '@lucide/svelte';

	type Props = {
		size?: number;
	};

	let { size = 18 }: Props = $props();
</script>

<span
	class="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_82%,white),color-mix(in_oklab,var(--color-secondary)_55%,white))] p-2.5 text-primary-content shadow-[0_16px_30px_-18px_rgba(20,120,98,0.65)]"
>
	<Sparkles {size} strokeWidth={2.15} />
</span>
