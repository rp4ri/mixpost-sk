import { createRestAPIClient, type mastodon } from 'masto';
import type { SocialProvider, SocialPost, SocialAccount, SocialMetrics } from './base.js';
import { parseRateLimitHeaders, trackRateLimit } from './rate-limit.js';
import { randomUUID } from 'crypto';

export class MastodonProvider implements SocialProvider {
	readonly name = 'mastodon';
	private client: mastodon.rest.Client;
	private serverUrl: string;

	constructor(serverUrl: string, accessToken: string) {
		this.serverUrl = serverUrl;
		this.client = createRestAPIClient({
			url: serverUrl,
			accessToken
		});
	}

	async getAccount(): Promise<SocialAccount> {
		const account = await this.client.v1.accounts.verifyCredentials();
		return {
			id: account.id,
			name: account.displayName || account.username,
			username: account.acct,
			imageUrl: account.avatar
		};
	}

	async publishPost(post: SocialPost): Promise<{ id: string }> {
		const status = await this.client.v1.statuses.create({
			status: post.text,
			mediaIds: post.mediaIds ?? [],
			visibility: 'public'
		}, {
			requestInit: {
				headers: { 'Idempotency-Key': randomUUID() }
			}
		} as any);
		return { id: status.id };
	}

	async uploadMedia(buffer: Buffer, mimeType: string): Promise<string> {
		const blob = new Blob([buffer], { type: mimeType });
		const file = new File([blob], `upload.${mimeType.split('/')[1]}`, { type: mimeType });
		const attachment = await this.client.v2.media.create({ file });

		// Poll for async processing if URL is not yet available
		if (!attachment.url && attachment.id) {
			let attempts = 0;
			while (attempts < 30) {
				await new Promise(resolve => setTimeout(resolve, 1000));
				try {
					const status = await this.client.v1.media.$select(attachment.id).get();
					if (status.url) return attachment.id;
				} catch { /* still processing */ }
				attempts++;
			}
		}
		return attachment.id;
	}

	async getMetrics(_accountId: string, _since: Date): Promise<SocialMetrics[]> {
		const account = await this.client.v1.accounts.verifyCredentials();
		return [{
			impressions: 0,
			engagements: account.statusesCount ?? 0,
			followers: account.followersCount ?? 0,
			date: new Date().toISOString().split('T')[0]
		}];
	}

	async getFollowerCount(): Promise<number> {
		const account = await this.client.v1.accounts.verifyCredentials();
		return account.followersCount ?? 0;
	}

	async getUserStatuses(userId: string, limit = 40): Promise<Array<{ id: string; content: string; createdAt: string; metrics: any }>> {
		const statuses = await this.client.v1.accounts.$select(userId).statuses.list({
			excludeReplies: true,
			excludeReblogs: true,
			limit
		});
		return statuses.map(s => ({
			id: s.id,
			content: s.content,
			createdAt: s.createdAt,
			metrics: {
				reblogsCount: s.reblogsCount,
				favouritesCount: s.favouritesCount,
				repliesCount: s.repliesCount
			}
		}));
	}

	static async createOAuthApp(serverUrl: string, redirectUri: string): Promise<{ clientId: string; clientSecret: string }> {
		const res = await fetch(`${serverUrl}/api/v1/apps`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				client_name: 'Mixpost',
				redirect_uris: redirectUri,
				scopes: 'read write',
				website: process.env.APP_URL ?? ''
			})
		});
		const data = await res.json();
		return { clientId: data.client_id, clientSecret: data.client_secret };
	}

	static getAuthorizationUrl(serverUrl: string, clientId: string, redirectUri: string): string {
		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			scope: 'read write',
			response_type: 'code'
		});
		return `${serverUrl}/oauth/authorize?${params}`;
	}

	static async exchangeCode(serverUrl: string, clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
		const res = await fetch(`${serverUrl}/oauth/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
				code,
				scope: 'read write'
			})
		});
		const data = await res.json();
		return data.access_token;
	}
}

export function createMastodonProvider(credentials: Record<string, string>): SocialProvider {
	return new MastodonProvider(
		credentials.serverUrl ?? credentials.server_url,
		credentials.accessToken ?? credentials.access_token
	);
}
