import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';
import { startWorkers } from '$lib/server/jobs/workers.js';
import { startScheduler } from '$lib/server/scheduler.js';
import { building } from '$app/environment';

if (!building) {
	try {
		startWorkers();
		startScheduler();
	} catch {
		console.warn('Workers/scheduler not started (Redis may not be available)');
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user
		? { id: Number(session.user.id), name: session.user.name, email: session.user.email }
		: null;
	return resolve(event);
};
