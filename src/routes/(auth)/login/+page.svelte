<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';
		const result = await authClient.signIn.email({ email, password });
		if (result.error) {
			error = result.error.message ?? 'Login failed';
			loading = false;
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
		<h1 class="text-2xl font-bold text-gray-900">Sign in</h1>
		<p class="mt-1 text-sm text-gray-500">Sign in to manage your social accounts</p>

		{#if error}
			<div class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="mt-6 space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input id="email" type="email" bind:value={email} required
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<input id="password" type="password" bind:value={password} required
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
			</div>
			<button type="submit" disabled={loading}
				class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
				{loading ? 'Signing in...' : 'Sign in'}
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-gray-500">
			Don't have an account? <a href="/register" class="text-blue-600 hover:underline">Register</a>
		</p>
	</div>
</div>
