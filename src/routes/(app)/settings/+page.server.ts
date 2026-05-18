import type { PageServerLoad, Actions } from './$types.js';
import { db } from '$lib/server/db.js';
import { settings } from '$lib/server/schema/index.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allSettings = await db.select().from(settings);
	const settingsMap = Object.fromEntries(allSettings.map(s => [s.name, s.payload]));
	return { settings: settingsMap };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const entries = Object.fromEntries(data.entries());

		for (const [name, value] of Object.entries(entries)) {
			const existing = await db.select().from(settings).where(eq(settings.name, name));
			if (existing.length) {
				await db.update(settings).set({ payload: value }).where(eq(settings.name, name));
			} else {
				await db.insert(settings).values({ name, payload: value });
			}
		}
		return { success: true };
	}
};
