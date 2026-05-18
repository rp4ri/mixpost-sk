import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user
		? { id: Number(session.user.id), name: session.user.name, email: session.user.email }
		: null;
	return resolve(event);
};
