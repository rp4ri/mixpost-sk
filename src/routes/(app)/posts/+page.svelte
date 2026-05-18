<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	let selectedPosts = $state<number[]>([]);

	const statusLabels: Record<number, string> = {
		0: 'Draft', 1: 'Scheduled', 2: 'Published', 3: 'Failed'
	};
	const statusColors: Record<number, string> = {
		0: 'bg-gray-100 text-gray-700',
		1: 'bg-yellow-100 text-yellow-700',
		2: 'bg-green-100 text-green-700',
		3: 'bg-red-100 text-red-700'
	};

	function toggleSelect(id: number) {
		if (selectedPosts.includes(id)) {
			selectedPosts = selectedPosts.filter(p => p !== id);
		} else {
			selectedPosts = [...selectedPosts, id];
		}
	}

	async function deleteSelected() {
		if (!selectedPosts.length) return;
		await fetch('/api/posts/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ postIds: selectedPosts })
		});
		selectedPosts = [];
		goto('/posts', { invalidateAll: true });
	}

	function getPreviewText(post: any): string {
		const version = post.versions?.find((v: any) => v.isOriginal === 1);
		if (!version?.content) return 'No content';
		const content = version.content as any[];
		return content.map((b: any) => b.body).join(' ').slice(0, 120) || 'No content';
	}
</script>

<div>
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">Posts</h2>
			<p class="text-sm text-gray-500 mt-1">{data.pagination.total} total posts</p>
		</div>
		<div class="flex gap-3">
			{#if selectedPosts.length}
				<button onclick={deleteSelected}
					class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
					Delete ({selectedPosts.length})
				</button>
			{/if}
			<a href="/posts/create"
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
				Create Post
			</a>
		</div>
	</div>

	<div class="mt-4 flex gap-2">
		{#each data.tags as tag}
			<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
				style="background-color: #{tag.hexColor}20; color: #{tag.hexColor}">
				{tag.name}
			</span>
		{/each}
	</div>

	<div class="mt-6 space-y-3">
		{#each data.posts as post}
			<div class="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
				<input type="checkbox" checked={selectedPosts.includes(post.id)}
					onchange={() => toggleSelect(post.id)}
					class="mt-1 rounded border-gray-300" />
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<span class={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusColors[post.status]].join(' ')}>
							{statusLabels[post.status]}
						</span>
						{#if post.scheduledAt}
							<span class="text-xs text-gray-500">
								{new Date(post.scheduledAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
							</span>
						{/if}
					</div>
					<p class="mt-1 text-sm text-gray-700 truncate">{getPreviewText(post)}</p>
					<div class="mt-2 flex gap-2">
						{#each post.accounts as pa}
							<span class="text-xs text-gray-400">Account #{pa.accountId}</span>
						{/each}
					</div>
				</div>
				<a href="/posts/{post.id}" class="text-sm text-blue-600 hover:underline shrink-0">Edit</a>
			</div>
		{:else}
			<div class="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
				<p class="text-gray-500">No posts yet</p>
				<a href="/posts/create" class="mt-2 inline-block text-blue-600 hover:underline">Create your first post</a>
			</div>
		{/each}
	</div>
</div>
