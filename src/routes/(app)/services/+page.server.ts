import type { PageServerLoad, Actions } from './$types.js';
import { db } from '$lib/server/db.js';
import { services } from '$lib/server/schema/index.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allServices = await db.select().from(services);
	return {
		services: allServices.map(s => ({
			id: s.id,
			name: s.name,
			active: s.active,
			hasConfig: !!s.configuration
		}))
	};
};

export const actions: Actions = {
	save: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const configuration = data.get('configuration') as string;

		const [existing] = await db.select().from(services).where(eq(services.name, name));
		if (existing) {
			await db.update(services).set({ configuration, active: true }).where(eq(services.name, name));
		} else {
			await db.insert(services).values({ name, configuration, active: true });
		}
		return { success: true };
	}
};
