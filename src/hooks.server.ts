import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';
import { building, dev } from '$app/environment';
import { env } from '$env/dynamic/private';

if (!building && env.REDIS_URL) {
	import('$lib/server/jobs/workers.js').then(m => m.startWorkers()).catch(() =>
		console.warn('Workers not started (Redis unavailable)')
	);
	import('$lib/server/scheduler.js').then(m => m.startScheduler()).catch(() =>
		console.warn('Scheduler not started (Redis unavailable)')
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user
		? { id: Number(session.user.id), name: session.user.name, email: session.user.email }
		: null;
	return resolve(event);
};
