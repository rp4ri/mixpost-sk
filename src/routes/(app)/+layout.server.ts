import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';
import { accounts } from '$lib/server/schema/index.js';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const socialAccounts = await db.select().from(accounts).where(eq(accounts.authorized, true));

	return {
		user: locals.user,
		accounts: socialAccounts.map(a => ({
			id: a.id,
			uuid: a.uuid,
			name: a.name,
			username: a.username,
			provider: a.provider,
			imageUrl: (a.media as any)?.url ?? ''
		}))
	};
};
