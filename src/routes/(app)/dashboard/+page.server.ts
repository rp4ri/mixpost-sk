import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, accounts, audience, metrics } from '$lib/server/schema/index.js';
import { eq, desc, gte, sql, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	const [postCount] = await db.select({ count: sql<number>`count(*)` })
		.from(posts).where(isNull(posts.deletedAt));

	const [accountCount] = await db.select({ count: sql<number>`count(*)` })
		.from(accounts).where(eq(accounts.authorized, true));

	const recentAudience = await db.select()
		.from(audience)
		.where(gte(audience.date, thirtyDaysAgo))
		.orderBy(desc(audience.date))
		.limit(30);

	const recentMetrics = await db.select()
		.from(metrics)
		.where(gte(metrics.date, thirtyDaysAgo))
		.orderBy(desc(metrics.date))
		.limit(30);

	return {
		stats: {
			totalPosts: postCount?.count ?? 0,
			totalAccounts: accountCount?.count ?? 0
		},
		audienceData: recentAudience,
		metricsData: recentMetrics
	};
};
