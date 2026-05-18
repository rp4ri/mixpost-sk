import { TwitterApi } from 'twitter-api-v2';
import type { SocialProvider, SocialPost, SocialAccount, SocialMetrics } from './base.js';
import { parseRateLimitHeaders, trackRateLimit } from './rate-limit.js';

export class TwitterProvider implements SocialProvider {
	readonly name = 'twitter';
	private client: TwitterApi;
	private uploadClient: TwitterApi;

	constructor(credentials: { accessToken: string; accessSecret: string; appKey: string; appSecret: string }) {
		this.client = new TwitterApi({
			appKey: credentials.appKey,
			appSecret: credentials.appSecret,
			accessToken: credentials.accessToken,
			accessSecret: credentials.accessSecret
		});
		this.uploadClient = this.client;
	}

	async getAccount(): Promise<SocialAccount> {
		const { data } = await this.client.v2.me({ 'user.fields': ['profile_image_url', 'created_at'] });
		return {
			id: data.id,
			name: data.name,
			username: data.username,
			imageUrl: (data.profile_image_url ?? '').replace('_normal', '_400x400')
		};
	}

	async publishPost(post: SocialPost): Promise<{ id: string }> {
		const params: Record<string, unknown> = { text: post.text };
		if (post.mediaIds?.length) {
			params.media = { media_ids: post.mediaIds };
		}
		const { data } = await this.client.v2.tweet(params as any);
		return { id: data.id };
	}

	async uploadMedia(buffer: Buffer, mimeType: string): Promise<string> {
		const isVideo = mimeType.startsWith('video/');
		const isGif = mimeType === 'image/gif';
		const mediaCategory = isGif ? 'tweet_gif' : isVideo ? 'tweet_video' : 'tweet_image';

		const mediaId = await this.client.v1.uploadMedia(buffer, {
			mimeType,
			additionalOwners: [],
			target: 'tweet',
			shared: false
		});
		return mediaId;
	}

	async getMetrics(accountId: string, since: Date): Promise<SocialMetrics[]> {
		const { data } = await this.client.v2.me({ 'user.fields': ['public_metrics'] });
		const pm = data.public_metrics;
		if (!pm) return [];
		return [{
			impressions: 0,
			engagements: pm.tweet_count ?? 0,
			followers: pm.followers_count ?? 0,
			date: new Date().toISOString().split('T')[0]
		}];
	}

	async getFollowerCount(): Promise<number> {
		const { data } = await this.client.v2.me({ 'user.fields': ['public_metrics'] });
		return data.public_metrics?.followers_count ?? 0;
	}

	async getUserTimeline(userId: string, sinceDate?: Date): Promise<Array<{ id: string; text: string; metrics: any; createdAt: string }>> {
		const params: Record<string, unknown> = {
			'tweet.fields': ['public_metrics', 'created_at', 'in_reply_to_user_id'],
			exclude: ['retweets', 'replies'],
			max_results: 100
		};
		if (sinceDate) {
			params.start_time = sinceDate.toISOString();
		}
		const timeline = await this.client.v2.userTimeline(userId, params as any);
		return (timeline.data?.data ?? []).map((t: any) => ({
			id: t.id,
			text: t.text,
			metrics: t.public_metrics,
			createdAt: t.created_at
		}));
	}
}

export function createTwitterProvider(credentials: Record<string, string>): SocialProvider {
	return new TwitterProvider({
		accessToken: credentials.accessToken ?? credentials.oauth_token,
		accessSecret: credentials.accessSecret ?? credentials.oauth_token_secret,
		appKey: credentials.appKey ?? process.env.TWITTER_CLIENT_ID ?? '',
		appSecret: credentials.appSecret ?? process.env.TWITTER_CLIENT_SECRET ?? ''
	});
}
