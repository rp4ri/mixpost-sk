import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');
	if (sessionToken) {
		// TODO: validate session and populate event.locals.user
	}
	return resolve(event);
};
