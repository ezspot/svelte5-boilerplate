<script lang="ts">
	type Tone = 'error' | 'success' | 'info';

	type Props = {
		message?: string | null;
		tone?: Tone;
	};

	let { message = null, tone = 'info' }: Props = $props();

	const toneClasses: Record<Tone, string> = {
		error: 'alert-error',
		success: 'alert-success',
		info: 'alert-info'
	};
</script>

{#if message}
	<div class={`alert ${toneClasses[tone]} text-sm`}>{message}</div>
{/if}
