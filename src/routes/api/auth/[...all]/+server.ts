import { auth } from '$lib/server/auth.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async (event) => svelteKitHandler({ event, resolve: () => auth.handler(event.request) });
export const POST: RequestHandler = async (event) => svelteKitHandler({ event, resolve: () => auth.handler(event.request) });
