import type { PageServerLoad, Actions } from './$types.js';
import { db } from '$lib/server/db.js';
import { posts, postAccounts, postVersions, tags } from '$lib/server/schema/index.js';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allTags = await db.select().from(tags);
	return { allTags };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const content = JSON.parse(data.get('content') as string ?? '[]');
		const accountIds: number[] = JSON.parse(data.get('accountIds') as string ?? '[]');

		const [result] = await db.insert(posts).values({
			status: 0,
			scheduleStatus: 0
		}).returning({ id: posts.id });

		const postId = result.id;

		// Create original version
		await db.insert(postVersions).values({
			postId,
			accountId: 0,
			isOriginal: 1,
			content
		});

		// Link accounts
		for (const accountId of accountIds) {
			await db.insert(postAccounts).values({ postId, accountId });
		}

		throw redirect(303, `/posts/${postId}`);
	}
};
