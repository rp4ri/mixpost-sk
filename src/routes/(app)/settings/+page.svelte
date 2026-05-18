<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
</script>

<div class="max-w-2xl">
	<h2 class="text-2xl font-bold text-gray-900">Settings</h2>
	<p class="text-sm text-gray-500 mt-1">Application configuration</p>

	<form method="POST" use:enhance class="mt-6 space-y-6">
		<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
			<h3 class="font-medium text-gray-900">General</h3>
			<div>
				<label class="block text-sm font-medium text-gray-700">Timezone</label>
				<select name="timezone" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
					<option value="UTC">UTC</option>
					<option value="America/La_Paz">America/La_Paz (BOT)</option>
					<option value="America/Sao_Paulo">America/Sao_Paulo (BRT)</option>
					<option value="America/New_York">America/New_York (ET)</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700">Time Format</label>
				<select name="time_format" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
					<option value="12">12-hour</option>
					<option value="24">24-hour</option>
				</select>
			</div>
		</div>

		<button type="submit"
			class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
			Save Settings
		</button>
	</form>
</div>
