<script lang="ts">
	import { Activity, Building2, Users } from '@lucide/svelte';

	type Props = {
		label: string;
		value: string;
		description: string;
	};

	let { label, value, description }: Props = $props();

	const presentation = (() => {
		switch (label) {
			case 'Team members':
				return {
					icon: Users,
					tone: 'text-primary',
					surface: 'bg-primary/10'
				};
			case 'Pending invites':
				return {
					icon: Activity,
					tone: 'text-secondary',
					surface: 'bg-secondary/10'
				};
			default:
				return {
					icon: Building2,
					tone: 'text-accent-content',
					surface: 'bg-accent/25'
				};
		}
	})();

	const Icon = presentation.icon;
</script>

<div class="dashboard-card">
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0">
			<p class="text-[0.68rem] font-semibold tracking-[0.2em] text-base-content/44 uppercase">
				{label}
			</p>
			<p class="mt-3 text-[2.2rem] font-semibold tracking-[-0.04em] tabular-nums">{value}</p>
		</div>
		<div class={`rounded-[1.1rem] p-3 ${presentation.surface} ${presentation.tone}`}>
			<Icon size={18} strokeWidth={2.1} />
		</div>
	</div>
	<p class="mt-4 text-sm leading-6 text-base-content/62">{description}</p>
	<div class="mt-5 border-t border-base-300/70"></div>
</div>
