import { auth } from '$lib/server/auth.js';
import { toSvelteKitHandler } from 'better-auth/svelte-kit';
import type { RequestHandler } from './$types.js';

const handler = toSvelteKitHandler(auth);

export const GET: RequestHandler = async (event) => handler(event);
export const POST: RequestHandler = async (event) => handler(event);
