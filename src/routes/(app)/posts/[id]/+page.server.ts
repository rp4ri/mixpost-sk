import type { PageServerLoad, Actions } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, postAccounts, postVersions, tags, tagPost } from '$lib/server/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { postQueue } from '$lib/server/queue.js';

export const load: PageServerLoad = async ({ params }) => {
	const postId = parseInt(params.id);
	const [post] = await db.select().from(posts).where(eq(posts.id, postId));
	if (!post) throw error(404, 'Post not found');

	const versions = await db.select().from(postVersions).where(eq(postVersions.postId, postId));
	const accountLinks = await db.select().from(postAccounts).where(eq(postAccounts.postId, postId));
	const postTags = await db.select({ tagId: tagPost.tagId }).from(tagPost).where(eq(tagPost.postId, postId));
	const allTags = await db.select().from(tags);

	return {
		post: { ...post, versions, accounts: accountLinks, tagIds: postTags.map(t => t.tagId) },
		allTags
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const postId = parseInt(params.id);
		const data = await request.formData();
		const content = JSON.parse(data.get('content') as string ?? '[]');
		const accountIds = JSON.parse(data.get('accountIds') as string ?? '[]');
		const tagIds = JSON.parse(data.get('tagIds') as string ?? '[]');
		const scheduledAt = data.get('scheduledAt') as string | null;

		await db.update(posts).set({
			scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
			updatedAt: new Date()
		}).where(eq(posts.id, postId));

		// Update original version content
		await db.update(postVersions).set({ content })
			.where(and(eq(postVersions.postId, postId), eq(postVersions.isOriginal, 1)));

		// Sync tags
		await db.delete(tagPost).where(eq(tagPost.postId, postId));
		for (const tagId of tagIds) {
			await db.insert(tagPost).values({ tagId, postId });
		}

		return { success: true };
	},
	schedule: async ({ params }) => {
		const postId = parseInt(params.id);
		await db.update(posts).set({ status: 1, scheduleStatus: 0 }).where(eq(posts.id, postId));

		const accountLinks = await db.select().from(postAccounts).where(eq(postAccounts.postId, postId));
		for (const link of accountLinks) {
			await postQueue.add('publish', { postId, accountId: link.accountId }, {
				delay: 0,
				attempts: 3,
				backoff: { type: 'exponential', delay: 5000 }
			});
		}
		return { scheduled: true };
	}
};
