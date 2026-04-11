<script lang="ts">
	import { authClient } from '$lib/auth-client';

	const sessionStore = authClient.useSession();
</script>

<span
	class={`rounded-full px-2.5 py-1 text-xs font-medium ${
		$sessionStore.data ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/60'
	}`}
>
	{$sessionStore.data ? 'Live session' : 'Session check'}
</span>
