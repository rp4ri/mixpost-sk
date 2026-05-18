import type { SocialProvider, SocialPost, SocialAccount, SocialMetrics } from './base.js';
import { parseRateLimitHeaders, trackRateLimit } from './rate-limit.js';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface FacebookCredentials {
	pageId: string;
	pageAccessToken: string;
	userAccessToken?: string;
}

async function graphApi(path: string, options: RequestInit & { params?: Record<string, string> } = {}, accessToken: string): Promise<any> {
	const url = new URL(`${GRAPH_URL}${path}`);
	if (options.params) {
		for (const [k, v] of Object.entries(options.params)) {
			url.searchParams.set(k, v);
		}
	}
	url.searchParams.set('access_token', accessToken);

	const res = await fetch(url, options);
	const rl = parseRateLimitHeaders(res.headers);
	if (rl) await trackRateLimit('facebook', path, rl);

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(`Facebook API error: ${err?.error?.message ?? res.statusText}`);
	}
	return res.json();
}

export class FacebookProvider implements SocialProvider {
	readonly name = 'facebook';
	private creds: FacebookCredentials;

	constructor(creds: FacebookCredentials) {
		this.creds = creds;
	}

	async getAccount(): Promise<SocialAccount> {
		const data = await graphApi(`/${this.creds.pageId}`, {
			params: { fields: 'id,name,username,picture{url}' }
		}, this.creds.pageAccessToken);
		return {
			id: data.id,
			name: data.name,
			username: data.username ?? '',
			imageUrl: data.picture?.data?.url ?? ''
		};
	}

	async publishPost(post: SocialPost): Promise<{ id: string }> {
		if (post.mediaIds?.length) {
			const attachedMedia = post.mediaIds.map(id => ({ media_fbid: id }));
			const data = await graphApi(`/${this.creds.pageId}/feed`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: post.text,
					attached_media: attachedMedia
				})
			}, this.creds.pageAccessToken);
			return { id: data.id };
		}

		const data = await graphApi(`/${this.creds.pageId}/feed`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message: post.text })
		}, this.creds.pageAccessToken);
		return { id: data.id };
	}

	async uploadMedia(buffer: Buffer, mimeType: string): Promise<string> {
		if (mimeType.startsWith('video/')) {
			return this.uploadVideo(buffer, mimeType);
		}
		return this.uploadImage(buffer);
	}

	private async uploadImage(buffer: Buffer): Promise<string> {
		const form = new FormData();
		form.append('source', new Blob([buffer]), 'image.jpg');
		form.append('published', 'false');
		form.append('access_token', this.creds.pageAccessToken);

		const res = await fetch(`${GRAPH_URL}/${this.creds.pageId}/photos`, {
			method: 'POST',
			body: form
		});
		const data = await res.json();
		if (!res.ok) throw new Error(`Facebook photo upload: ${data?.error?.message}`);
		return data.id;
	}

	private async uploadVideo(buffer: Buffer, mimeType: string): Promise<string> {
		// Phase 1: Init
		const initData = await graphApi(`/${this.creds.pageId}/videos`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ upload_phase: 'start', file_size: buffer.length })
		}, this.creds.pageAccessToken);

		const { upload_session_id, start_offset, end_offset } = initData;

		// Phase 2: Transfer chunks
		let offset = parseInt(start_offset);
		let endOff = parseInt(end_offset);
		while (offset < endOff) {
			const chunk = buffer.subarray(offset, endOff);
			const form = new FormData();
			form.append('upload_phase', 'transfer');
			form.append('upload_session_id', upload_session_id);
			form.append('start_offset', String(offset));
			form.append('video_file_chunk', new Blob([chunk]), 'chunk.mp4');
			form.append('access_token', this.creds.pageAccessToken);

			const res = await fetch(`${GRAPH_URL}/${this.creds.pageId}/videos`, {
				method: 'POST',
				body: form
			});
			const data = await res.json();
			offset = parseInt(data.start_offset);
			endOff = parseInt(data.end_offset);
		}

		// Phase 3: Finish
		const finishData = await graphApi(`/${this.creds.pageId}/videos`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				upload_phase: 'finish',
				upload_session_id
			})
		}, this.creds.pageAccessToken);

		return finishData.video_id ?? initData.video_id;
	}

	async getMetrics(_accountId: string, since: Date): Promise<SocialMetrics[]> {
		const sinceStr = Math.floor(since.getTime() / 1000).toString();
		const untilStr = Math.floor(Date.now() / 1000).toString();

		const data = await graphApi(`/${this.creds.pageId}/insights`, {
			params: {
				metric: 'page_post_engagements,page_posts_impressions',
				period: 'day',
				since: sinceStr,
				until: untilStr
			}
		}, this.creds.pageAccessToken);

		const metrics: SocialMetrics[] = [];
		const engagements = data.data?.find((d: any) => d.name === 'page_post_engagements');
		const impressions = data.data?.find((d: any) => d.name === 'page_posts_impressions');

		if (engagements?.values) {
			for (let i = 0; i < engagements.values.length; i++) {
				metrics.push({
					engagements: engagements.values[i]?.value ?? 0,
					impressions: impressions?.values?.[i]?.value ?? 0,
					followers: 0,
					date: engagements.values[i]?.end_time?.split('T')[0] ?? ''
				});
			}
		}
		return metrics;
	}

	async getFollowerCount(): Promise<number> {
		const data = await graphApi(`/${this.creds.pageId}`, {
			params: { fields: 'fan_count,followers_count' }
		}, this.creds.pageAccessToken);
		return data.followers_count ?? data.fan_count ?? 0;
	}

	static async getPages(userAccessToken: string): Promise<Array<{ id: string; name: string; username: string; imageUrl: string; accessToken: string }>> {
		const data = await graphApi('/me/accounts', {
			params: { fields: 'id,name,username,picture{url},access_token', limit: '200' }
		}, userAccessToken);
		return (data.data ?? []).map((p: any) => ({
			id: p.id,
			name: p.name,
			username: p.username ?? '',
			imageUrl: p.picture?.data?.url ?? '',
			accessToken: p.access_token
		}));
	}

	static async exchangeForLongLivedToken(shortToken: string, appId: string, appSecret: string): Promise<string> {
		const data = await graphApi('/oauth/access_token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				grant_type: 'fb_exchange_token',
				client_id: appId,
				client_secret: appSecret,
				fb_exchange_token: shortToken
			})
		}, shortToken);
		return data.access_token;
	}
}

export function createFacebookProvider(credentials: Record<string, string>): SocialProvider {
	return new FacebookProvider({
		pageId: credentials.pageId ?? credentials.provider_id,
		pageAccessToken: credentials.pageAccessToken ?? credentials.access_token,
		userAccessToken: credentials.userAccessToken
	});
}
