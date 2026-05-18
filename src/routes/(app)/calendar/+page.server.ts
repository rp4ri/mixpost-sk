import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, postVersions } from '$lib/server/schema/index.js';
import { and, gte, lte, isNull, isNotNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const date = url.searchParams.get('date') ?? new Date().toISOString().split('T')[0];
	const type = url.searchParams.get('type') ?? 'month';

	const start = new Date(date);
	const end = new Date(date);
	if (type === 'month') {
		start.setDate(1);
		end.setMonth(end.getMonth() + 1, 0);
	} else {
		const day = start.getDay();
		start.setDate(start.getDate() - day);
		end.setDate(end.getDate() + (6 - day));
	}

	const scheduledPosts = await db.select().from(posts)
		.where(and(
			isNull(posts.deletedAt),
			isNotNull(posts.scheduledAt),
			gte(posts.scheduledAt, start),
			lte(posts.scheduledAt, end)
		));

	return { posts: scheduledPosts, date, type };
};
