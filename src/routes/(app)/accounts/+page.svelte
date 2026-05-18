<script lang="ts">
	let { data } = $props();
	let mastodonServer = $state('');
	let connecting = $state(false);

	const providerColors: Record<string, string> = {
		twitter: 'bg-sky-100 text-sky-700',
		facebook: 'bg-blue-100 text-blue-700',
		facebook_page: 'bg-blue-100 text-blue-700',
		mastodon: 'bg-purple-100 text-purple-700'
	};

	async function connectProvider(provider: string) {
		connecting = true;
		const body = provider === 'mastodon' ? { serverUrl: mastodonServer } : {};
		const res = await fetch(`/api/accounts/add/${provider}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		const data = await res.json();
		if (data.redirectUrl) window.location.href = data.redirectUrl;
		connecting = false;
	}
</script>

<div>
	<h2 class="text-2xl font-bold text-gray-900">Connected Accounts</h2>
	<p class="text-sm text-gray-500 mt-1">Manage your social media accounts</p>

	<div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
		<button onclick={() => connectProvider('twitter')} disabled={connecting}
			class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:border-sky-200 transition-colors text-left">
			<div class="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-lg">𝕏</div>
			<div>
				<p class="font-medium text-gray-900">Twitter / X</p>
				<p class="text-xs text-gray-500">Connect your account</p>
			</div>
		</button>
		<button onclick={() => connectProvider('facebook')} disabled={connecting}
			class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors text-left">
			<div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">f</div>
			<div>
				<p class="font-medium text-gray-900">Facebook</p>
				<p class="text-xs text-gray-500">Connect a page</p>
			</div>
		</button>
		<div class="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
			<div class="flex items-center gap-3 mb-3">
				<div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg">🐘</div>
				<div>
					<p class="font-medium text-gray-900">Mastodon</p>
					<p class="text-xs text-gray-500">Any instance</p>
				</div>
			</div>
			<div class="flex gap-2">
				<input type="text" bind:value={mastodonServer} placeholder="mastodon.social"
					class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
				<button onclick={() => connectProvider('mastodon')} disabled={connecting || !mastodonServer}
					class="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
					Connect
				</button>
			</div>
		</div>
	</div>

	<div class="mt-8 space-y-3">
		{#each data.socialAccounts as account}
			<div class="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
				{#if account.imageUrl}
					<img src={account.imageUrl} alt="" class="h-10 w-10 rounded-full" />
				{:else}
					<div class="h-10 w-10 rounded-full bg-gray-200"></div>
				{/if}
				<div class="flex-1">
					<p class="font-medium text-gray-900">{account.name}</p>
					<p class="text-sm text-gray-500">@{account.username}</p>
				</div>
				<span class={["rounded-full px-2.5 py-0.5 text-xs font-medium", providerColors[account.provider] ?? 'bg-gray-100 text-gray-700']}>
					{account.provider}
				</span>
				<span class={["h-2 w-2 rounded-full", account.authorized ? "bg-green-500" : "bg-red-500"]}></span>
			</div>
		{:else}
			<p class="text-sm text-gray-400 py-8 text-center">No accounts connected yet</p>
		{/each}
	</div>
</div>
