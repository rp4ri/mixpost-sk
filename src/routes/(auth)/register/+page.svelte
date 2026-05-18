<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister() {
		loading = true;
		error = '';
		const result = await authClient.signUp.email({ name, email, password });
		if (result.error) {
			error = result.error.message ?? 'Registration failed';
			loading = false;
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
		<h1 class="text-2xl font-bold text-gray-900">Create account</h1>
		<p class="mt-1 text-sm text-gray-500">Get started with Mixpost</p>

		{#if error}
			<div class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="mt-6 space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
				<input id="name" type="text" bind:value={name} required
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input id="email" type="email" bind:value={email} required
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<input id="password" type="password" bind:value={password} required minlength="8"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
			</div>
			<button type="submit" disabled={loading}
				class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
				{loading ? 'Creating account...' : 'Create account'}
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-gray-500">
			Already have an account? <a href="/login" class="text-blue-600 hover:underline">Sign in</a>
		</p>
	</div>
</div>
