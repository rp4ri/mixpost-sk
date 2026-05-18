import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db.js';
import { services } from '$lib/server/schema/index.js';
import { eq } from 'drizzle-orm';
import { MastodonProvider } from '$lib/server/providers/mastodon.js';

export const POST: RequestHandler = async ({ params, request, url }) => {
	const provider = params.provider;
	const callbackUrl = `${url.origin}/callback/${provider}`;

	if (provider === 'twitter') {
		// Twitter OAuth 1.0a - redirect to authorize
		const [service] = await db.select().from(services).where(eq(services.name, 'twitter'));
		if (!service) return json({ error: 'Twitter not configured' }, { status: 400 });
		const config = JSON.parse(service.configuration);
		// Using twitter-api-v2 for OAuth
		const { TwitterApi } = await import('twitter-api-v2');
		const client = new TwitterApi({ appKey: config.client_id, appSecret: config.client_secret });
		const { url: authUrl, oauth_token, oauth_token_secret } = await client.generateAuthLink(callbackUrl);
		// Store tokens temporarily (in practice, use a session or Redis)
		return json({ redirectUrl: authUrl, oauthToken: oauth_token });
	}

	if (provider === 'facebook') {
		const [service] = await db.select().from(services).where(eq(services.name, 'facebook'));
		if (!service) return json({ error: 'Facebook not configured' }, { status: 400 });
		const config = JSON.parse(service.configuration);
		const scopes = 'pages_show_list,read_insights,pages_manage_posts,pages_read_engagement';
		const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scopes}&response_type=code`;
		return json({ redirectUrl: authUrl });
	}

	if (provider === 'mastodon') {
		const body = await request.json();
		const serverUrl = body.serverUrl;
		if (!serverUrl) return json({ error: 'Server URL required' }, { status: 400 });

		const app = await MastodonProvider.createOAuthApp(serverUrl, callbackUrl);
		const authUrl = MastodonProvider.getAuthorizationUrl(serverUrl, app.clientId, callbackUrl);

		// Store app credentials for callback
		return json({
			redirectUrl: authUrl,
			clientId: app.clientId,
			clientSecret: app.clientSecret,
			serverUrl
		});
	}

	return json({ error: 'Unknown provider' }, { status: 400 });
};
