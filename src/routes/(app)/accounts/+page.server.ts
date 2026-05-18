import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';
import { accounts } from '$lib/server/schema/index.js';

export const load: PageServerLoad = async () => {
	const allAccounts = await db.select().from(accounts);
	return {
		socialAccounts: allAccounts.map(a => ({
			id: a.id,
			uuid: a.uuid,
			name: a.name,
			username: a.username,
			provider: a.provider,
			providerId: a.providerId,
			authorized: a.authorized,
			imageUrl: (a.media as any)?.url ?? '',
			createdAt: a.createdAt
		}))
	};
};
