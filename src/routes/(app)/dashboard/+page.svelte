<script lang="ts">
	let { data } = $props();

	const audienceLabels = $derived(data.audienceData?.map((d: any) => d.date) ?? []);
	const audienceValues = $derived(data.audienceData?.map((d: any) => d.total) ?? []);
</script>

<div>
	<h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
	<p class="text-sm text-gray-500 mt-1">Overview of your social media activity</p>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
		<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
			<p class="text-sm font-medium text-gray-500">Total Posts</p>
			<p class="text-3xl font-bold text-gray-900 mt-1">{data.stats.totalPosts}</p>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
			<p class="text-sm font-medium text-gray-500">Connected Accounts</p>
			<p class="text-3xl font-bold text-gray-900 mt-1">{data.stats.totalAccounts}</p>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
			<p class="text-sm font-medium text-gray-500">Audience (30d)</p>
			<p class="text-3xl font-bold text-gray-900 mt-1">
				{audienceValues.length ? audienceValues[0] : 0}
			</p>
		</div>
	</div>

	<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
			<h3 class="text-lg font-semibold text-gray-900">Audience Growth</h3>
			<div class="mt-4 h-48 flex items-end gap-1">
				{#each audienceValues as value, i}
					<div class="flex-1 bg-blue-200 rounded-t transition-all hover:bg-blue-400"
						style="height: {Math.max(4, (value / (Math.max(...audienceValues) || 1)) * 100)}%"
						title="{audienceLabels[i]}: {value}">
					</div>
				{/each}
				{#if !audienceValues.length}
					<p class="text-sm text-gray-400 w-full text-center py-16">No audience data yet</p>
				{/if}
			</div>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
			<h3 class="text-lg font-semibold text-gray-900">Recent Metrics</h3>
			<div class="mt-4 space-y-3">
				{#each data.metricsData?.slice(0, 5) ?? [] as metric}
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">{metric.date}</span>
						<span class="font-medium text-gray-900">{JSON.stringify(metric.data)}</span>
					</div>
				{:else}
					<p class="text-sm text-gray-400 py-8 text-center">No metrics data yet</p>
				{/each}
			</div>
		</div>
	</div>
</div>
