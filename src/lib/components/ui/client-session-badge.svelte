<script lang="ts">
	import { authClient } from '$lib/auth-client';

	const sessionStore = authClient.useSession();
</script>

<span
	class={`rounded-full border px-2.5 py-1 text-xs font-medium ${
		$sessionStore.data
			? 'border-success/20 bg-success/10 text-success'
			: 'border-base-300/70 bg-base-100 text-base-content/60'
	}`}
>
	{$sessionStore.data ? 'Live session' : 'Session check'}
</span>
