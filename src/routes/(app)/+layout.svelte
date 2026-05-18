<script lang="ts">
	import { page } from '$app/state';
	let { data, children } = $props();

	const nav = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊' },
		{ href: '/posts', label: 'Posts', icon: '📝' },
		{ href: '/posts/create', label: 'Create Post', icon: '➕' },
		{ href: '/calendar', label: 'Calendar', icon: '📅' },
		{ href: '/media', label: 'Media', icon: '🖼️' },
		{ href: '/accounts', label: 'Accounts', icon: '🔗' },
		{ href: '/services', label: 'Services', icon: '⚙️' },
		{ href: '/settings', label: 'Settings', icon: '🛠️' }
	];
</script>

<div class="flex min-h-screen bg-gray-50">
	<aside class="w-60 border-r border-gray-200 bg-white px-4 py-6">
		<div class="mb-8">
			<h1 class="text-xl font-bold text-gray-900">Mixpost</h1>
			<p class="text-xs text-gray-500">{data.user?.name}</p>
		</div>
		<nav class="space-y-1">
			{#each nav as item}
				<a href={item.href}
					class={["flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
						page.url.pathname.startsWith(item.href)
							? "bg-blue-50 text-blue-700 font-medium"
							: "text-gray-700 hover:bg-gray-100"
					]}>
					<span>{item.icon}</span>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="mt-auto pt-6 border-t border-gray-200 mt-8">
			<p class="text-xs text-gray-400">{data.accounts?.length ?? 0} connected accounts</p>
		</div>
	</aside>
	<main class="flex-1 p-8">
		{@render children()}
	</main>
</div>
