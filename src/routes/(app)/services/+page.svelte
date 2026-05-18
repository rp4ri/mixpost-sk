<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();

	let editingService = $state('');

	const serviceConfigs = [
		{ name: 'twitter', label: 'Twitter / X', fields: ['client_id', 'client_secret'] },
		{ name: 'facebook', label: 'Facebook', fields: ['client_id', 'client_secret'] },
		{ name: 'unsplash', label: 'Unsplash (Stock Photos)', fields: ['client_id'] },
		{ name: 'tenor', label: 'Tenor (GIFs)', fields: ['client_id'] }
	];
</script>

<div class="max-w-2xl">
	<h2 class="text-2xl font-bold text-gray-900">Services</h2>
	<p class="text-sm text-gray-500 mt-1">Configure API keys for third-party services</p>

	<div class="mt-6 space-y-4">
		{#each serviceConfigs as svc}
			{@const existing = data.services.find((s: any) => s.name === svc.name)}
			<div class="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-medium text-gray-900">{svc.label}</h3>
						<p class="text-xs text-gray-500">{existing?.active ? 'Active' : 'Not configured'}</p>
					</div>
					<button onclick={() => editingService = editingService === svc.name ? '' : svc.name}
						class="text-sm text-blue-600 hover:underline">
						{editingService === svc.name ? 'Close' : 'Configure'}
					</button>
				</div>
				{#if editingService === svc.name}
					<form method="POST" action="?/save" use:enhance class="mt-4 space-y-3">
						<input type="hidden" name="name" value={svc.name} />
						{#each svc.fields as field}
							<div>
								<label class="block text-xs font-medium text-gray-600">{field}</label>
								<input type="password" name="config_{field}" required
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
							</div>
						{/each}
						<input type="hidden" name="configuration"
							value="" />
						<button type="submit"
							class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
							Save
						</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>
</div>
