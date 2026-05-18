<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let content = $state(data.post.versions?.find((v: any) => v.isOriginal === 1)?.content ?? [{ body: '', media: [] }]);
	let selectedTags = $state<number[]>(data.post.tagIds ?? []);
	let scheduledAt = $state(data.post.scheduledAt ? new Date(data.post.scheduledAt).toISOString().slice(0, 16) : '');

	const statusLabels: Record<number, string> = {
		0: 'Draft', 1: 'Scheduled', 2: 'Published', 3: 'Failed'
	};

	async function schedulePost() {
		await fetch('/api/posts/schedule', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ postId: data.post.id, scheduledAt: scheduledAt || null })
		});
		goto('/posts', { invalidateAll: true });
	}

	async function duplicatePost() {
		const res = await fetch('/api/posts/duplicate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ postId: data.post.id })
		});
		const { id } = await res.json();
		goto(`/posts/${id}`);
	}
</script>

<div class="max-w-3xl">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">Edit Post</h2>
			<span class="text-sm text-gray-500">Status: {statusLabels[data.post.status]}</span>
		</div>
		<div class="flex gap-2">
			<button onclick={duplicatePost}
				class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
				Duplicate
			</button>
			<button onclick={schedulePost}
				class="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
				{scheduledAt ? 'Schedule' : 'Publish Now'}
			</button>
		</div>
	</div>

	<form method="POST" action="?/update" use:enhance class="mt-6 space-y-6">
		<input type="hidden" name="content" value={JSON.stringify(content)} />
		<input type="hidden" name="accountIds" value={JSON.stringify(data.post.accounts?.map((a: any) => a.accountId) ?? [])} />
		<input type="hidden" name="tagIds" value={JSON.stringify(selectedTags)} />

		{#each content as block, i}
			<div class="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
				<textarea bind:value={(content[i] as any).body} rows="4"
					class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
				<span class="text-xs text-gray-400">{(block as any).body?.length ?? 0} chars</span>
			</div>
		{/each}

		<div>
			<label class="block text-sm font-medium text-gray-700">Schedule</label>
			<input type="datetime-local" bind:value={scheduledAt} name="scheduledAt"
				class="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
		</div>

		<button type="submit"
			class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
			Save Changes
		</button>
	</form>
</div>
