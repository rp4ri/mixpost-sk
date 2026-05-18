import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, postAccounts, postVersions, tagPost } from '$lib/server/schema/index.js';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const { postId } = await request.json();

	const [original] = await db.select().from(posts).where(eq(posts.id, postId));
	if (!original) return json({ error: 'Post not found' }, { status: 404 });

	const [newPost] = await db.insert(posts).values({
		status: 0,
		scheduleStatus: 0
	}).returning({ id: posts.id });

	const versions = await db.select().from(postVersions).where(eq(postVersions.postId, postId));
	for (const v of versions) {
		await db.insert(postVersions).values({
			postId: newPost.id,
			accountId: v.accountId,
			isOriginal: v.isOriginal,
			content: v.content
		});
	}

	const accounts = await db.select().from(postAccounts).where(eq(postAccounts.postId, postId));
	for (const a of accounts) {
		await db.insert(postAccounts).values({ postId: newPost.id, accountId: a.accountId });
	}

	const postTags = await db.select().from(tagPost).where(eq(tagPost.postId, postId));
	for (const t of postTags) {
		await db.insert(tagPost).values({ postId: newPost.id, tagId: t.tagId });
	}

	return json({ id: newPost.id });
};
