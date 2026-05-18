import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';
import { media } from '$lib/server/schema/index.js';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const perPage = 30;

	const items = await db.select().from(media)
		.orderBy(desc(media.createdAt))
		.limit(perPage)
		.offset((page - 1) * perPage);

	return { media: items, pagination: { page, perPage } };
};
