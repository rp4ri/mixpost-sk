import { db } from '../db.js';
import { accounts, importedPosts } from '../schema/index.js';
import { getProvider } from '../providers/registry.js';
import { eq } from 'drizzle-orm';
import { TwitterProvider } from '../providers/twitter.js';
import { MastodonProvider } from '../providers/mastodon.js';

export async function importPostsForAccount(accountId: number) {
	const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
	if (!account) return;

	const credentials = typeof account.accessToken === 'string'
		? JSON.parse(account.accessToken)
		: account.accessToken;

	let posts: Array<{ id: string; content: any; metrics: any; createdAt: string }> = [];

	if (account.provider === 'twitter') {
		const provider = new TwitterProvider(credentials as any);
		const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
		const timeline = await provider.getUserTimeline(account.providerId, threeMonthsAgo);
		posts = timeline.map(t => ({
			id: t.id,
			content: { text: t.text },
			metrics: t.metrics,
			createdAt: t.createdAt
		}));
	} else if (account.provider === 'mastodon') {
		const provider = new MastodonProvider(
			(credentials as any).serverUrl ?? (credentials as any).server_url,
			(credentials as any).accessToken ?? (credentials as any).access_token
		);
		const statuses = await provider.getUserStatuses(account.providerId);
		posts = statuses.map(s => ({
			id: s.id,
			content: { html: s.content },
			metrics: s.metrics,
			createdAt: s.createdAt
		}));
	}

	for (const post of posts) {
		await db.insert(importedPosts).values({
			accountId,
			providerPostId: post.id,
			content: post.content,
			metrics: post.metrics
		}).onConflictDoNothing();
	}
}
