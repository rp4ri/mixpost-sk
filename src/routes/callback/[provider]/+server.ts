import { redirect, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db.js';
import { accounts } from '$lib/server/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { getProvider } from '$lib/server/providers/registry.js';

export const GET: RequestHandler = async ({ params, url }) => {
	const provider = params.provider;

	if (provider === 'facebook') {
		const code = url.searchParams.get('code');
		if (!code) throw redirect(302, '/accounts?error=no_code');

		// Exchange code for token (simplified - production needs full flow)
		return new Response(null, { status: 302, headers: { Location: '/accounts?connected=facebook' } });
	}

	if (provider === 'twitter') {
		const oauthToken = url.searchParams.get('oauth_token');
		const oauthVerifier = url.searchParams.get('oauth_verifier');
		if (!oauthToken || !oauthVerifier) throw redirect(302, '/accounts?error=no_verifier');

		return new Response(null, { status: 302, headers: { Location: '/accounts?connected=twitter' } });
	}

	if (provider === 'mastodon') {
		const code = url.searchParams.get('code');
		if (!code) throw redirect(302, '/accounts?error=no_code');

		return new Response(null, { status: 302, headers: { Location: '/accounts?connected=mastodon' } });
	}

	throw redirect(302, '/accounts');
};
