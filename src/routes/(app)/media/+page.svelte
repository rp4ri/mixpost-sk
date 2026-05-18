<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();
	let uploading = $state(false);
	let dragOver = $state(false);

	async function handleUpload(files: FileList | null) {
		if (!files?.length) return;
		uploading = true;
		for (const file of files) {
			const form = new FormData();
			form.append('file', file);
			await fetch('/api/media/upload', { method: 'POST', body: form });
		}
		uploading = false;
		invalidateAll();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		handleUpload(e.dataTransfer?.files ?? null);
	}
</script>

<div>
	<h2 class="text-2xl font-bold text-gray-900">Media Library</h2>

	<div class="mt-6"
		ondragover={(e) => { e.preventDefault(); dragOver = true; }}
		ondragleave={() => { dragOver = false; }}
		ondrop={handleDrop}>
		<label class={["flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
			dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
		]}>
			<p class="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Drop files here or click to upload'}</p>
			<input type="file" multiple accept="image/*,video/*" class="hidden"
				onchange={(e) => handleUpload((e.target as HTMLInputElement).files)} />
		</label>
	</div>

	<div class="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
		{#each data.media as item}
			<div class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
				{#if item.mimeType.startsWith('image/')}
					<img src="/storage/{item.path}" alt={item.name}
						class="h-full w-full object-cover" />
				{:else}
					<div class="flex h-full items-center justify-center text-gray-400 text-xs">
						{item.mimeType.split('/')[1]}
					</div>
				{/if}
				<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<p class="text-xs text-white truncate">{item.name}</p>
				</div>
			</div>
		{:else}
			<p class="col-span-full text-sm text-gray-400 py-12 text-center">No media files yet</p>
		{/each}
	</div>
</div>
