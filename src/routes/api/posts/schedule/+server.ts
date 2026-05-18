import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, postAccounts } from '$lib/server/schema/index.js';
import { eq } from 'drizzle-orm';
import { postQueue } from '$lib/server/queue.js';

export const POST: RequestHandler = async ({ request }) => {
	const { postId, scheduledAt } = await request.json();

	await db.update(posts).set({
		status: 1,
		scheduleStatus: 0,
		scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
	}).where(eq(posts.id, postId));

	const accountLinks = await db.select().from(postAccounts).where(eq(postAccounts.postId, postId));
	const delay = scheduledAt ? Math.max(0, new Date(scheduledAt).getTime() - Date.now()) : 0;

	for (const link of accountLinks) {
		await postQueue.add('publish', { postId, accountId: link.accountId }, {
			delay,
			attempts: 3,
			backoff: { type: 'exponential', delay: 5000 }
		});
	}

	return json({ success: true });
};
