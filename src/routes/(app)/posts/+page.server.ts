import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, postAccounts, postVersions, tags, tagPost } from '$lib/server/schema/index.js';
import { eq, desc, isNull, and, like, inArray, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const status = url.searchParams.get('status');
	const keyword = url.searchParams.get('keyword');
	const tagId = url.searchParams.get('tag');
	const accountId = url.searchParams.get('account');
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const perPage = 20;

	let query = db.select().from(posts).where(isNull(posts.deletedAt)).orderBy(desc(posts.createdAt));

	const conditions = [isNull(posts.deletedAt)];
	if (status) conditions.push(eq(posts.status, parseInt(status)));

	const allPosts = await db.select()
		.from(posts)
		.where(and(...conditions))
		.orderBy(desc(posts.createdAt))
		.limit(perPage)
		.offset((page - 1) * perPage);

	const postIds = allPosts.map(p => p.id);
	const versions = postIds.length
		? await db.select().from(postVersions).where(inArray(postVersions.postId, postIds))
		: [];
	const postAccountLinks = postIds.length
		? await db.select().from(postAccounts).where(inArray(postAccounts.postId, postIds))
		: [];

	const allTags = await db.select().from(tags).orderBy(tags.name);

	const [{ count: totalCount }] = await db.select({ count: sql<number>`count(*)` })
		.from(posts).where(and(...conditions));

	return {
		posts: allPosts.map(p => ({
			...p,
			versions: versions.filter(v => v.postId === p.id),
			accounts: postAccountLinks.filter(a => a.postId === p.id)
		})),
		tags: allTags,
		pagination: { page, perPage, total: totalCount ?? 0 }
	};
};
