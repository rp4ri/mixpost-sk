<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let content = $state([{ body: '', media: [] }]);
	let selectedAccounts = $state<number[]>([]);
	let selectedTags = $state<number[]>([]);
	let scheduledAt = $state('');

	function addBlock() {
		content = [...content, { body: '', media: [] }];
	}

	function removeBlock(index: number) {
		content = content.filter((_, i) => i !== index);
	}

	function toggleAccount(id: number) {
		if (selectedAccounts.includes(id)) {
			selectedAccounts = selectedAccounts.filter(a => a !== id);
		} else {
			selectedAccounts = [...selectedAccounts, id];
		}
	}

	function toggleTag(id: number) {
		if (selectedTags.includes(id)) {
			selectedTags = selectedTags.filter(t => t !== id);
		} else {
			selectedTags = [...selectedTags, id];
		}
	}
</script>

<div class="max-w-3xl">
	<h2 class="text-2xl font-bold text-gray-900">Create Post</h2>

	<form method="POST" use:enhance class="mt-6 space-y-6">
		<input type="hidden" name="content" value={JSON.stringify(content)} />
		<input type="hidden" name="accountIds" value={JSON.stringify(selectedAccounts)} />
		<input type="hidden" name="tagIds" value={JSON.stringify(selectedTags)} />

		<div class="space-y-4">
			{#each content as block, i}
				<div class="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
					<div class="flex justify-between items-center mb-2">
						<span class="text-xs font-medium text-gray-500">Block {i + 1}</span>
						{#if content.length > 1}
							<button type="button" onclick={() => removeBlock(i)}
								class="text-xs text-red-500 hover:underline">Remove</button>
						{/if}
					</div>
					<textarea bind:value={block.body} rows="4" placeholder="Write your post content..."
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
					<div class="mt-2 flex justify-between text-xs text-gray-400">
						<span>{block.body.length} characters</span>
					</div>
				</div>
			{/each}
			<button type="button" onclick={addBlock}
				class="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-600">
				+ Add content block
			</button>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700">Schedule</label>
			<input type="datetime-local" bind:value={scheduledAt} name="scheduledAt"
				class="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
		</div>

		{#if data.allTags?.length}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
				<div class="flex flex-wrap gap-2">
					{#each data.allTags as tag}
						<button type="button" onclick={() => toggleTag(tag.id)}
							class={["rounded-full px-3 py-1 text-xs font-medium border transition-colors",
								selectedTags.includes(tag.id) ? "border-current" : "border-transparent opacity-60"
							]}
							style="background-color: #{tag.hexColor}20; color: #{tag.hexColor}">
							{tag.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div class="flex gap-3 pt-4">
			<button type="submit"
				class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
				Create Post
			</button>
			<a href="/posts" class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
				Cancel
			</a>
		</div>
	</form>
</div>
