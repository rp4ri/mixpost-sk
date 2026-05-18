import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts } from '$lib/server/schema/index.js';
import { eq, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const { postIds } = await request.json();

	if (!postIds?.length) return json({ error: 'No posts specified' }, { status: 400 });

	// Soft delete
	await db.update(posts)
		.set({ deletedAt: new Date() })
		.where(inArray(posts.id, postIds));

	return json({ deleted: postIds.length });
};
