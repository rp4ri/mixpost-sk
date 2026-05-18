import { db } from '../db.js';
import { posts, postAccounts, postVersions, accounts } from '../schema/index.js';
import { getProvider } from '../providers/registry.js';
import { eq, and } from 'drizzle-orm';
import type { SocialPost } from '../providers/base.js';

export async function publishPostToAccount(postId: number, accountId: number) {
	const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
	if (!account) throw new Error(`Account ${accountId} not found`);

	const credentials = typeof account.accessToken === 'string'
		? JSON.parse(account.accessToken)
		: account.accessToken;
	const provider = getProvider(account.provider, credentials as Record<string, string>);

	const [version] = await db.select().from(postVersions)
		.where(and(eq(postVersions.postId, postId), eq(postVersions.accountId, accountId)));

	const originalVersion = version ??
		(await db.select().from(postVersions)
			.where(and(eq(postVersions.postId, postId), eq(postVersions.isOriginal, 1))))[0];

	if (!originalVersion) throw new Error(`No content version for post ${postId}`);

	const content = originalVersion.content as Array<{ body: string; media: any[] }> | null;
	if (!content?.length) throw new Error('Empty post content');

	const text = content.map(block => block.body).join('\n').trim();
	const mediaItems = content.flatMap(block => block.media ?? []);

	const mediaIds: string[] = [];
	for (const item of mediaItems) {
		if (item.url) {
			const res = await fetch(item.url);
			const buffer = Buffer.from(await res.arrayBuffer());
			const id = await provider.uploadMedia(buffer, item.mime_type ?? 'image/jpeg');
			mediaIds.push(id);
		}
	}

	const socialPost: SocialPost = { text, mediaIds };
	const result = await provider.publishPost(socialPost);

	await db.update(postAccounts)
		.set({ providerPostId: result.id, errors: null })
		.where(and(eq(postAccounts.postId, postId), eq(postAccounts.accountId, accountId)));

	return result;
}
