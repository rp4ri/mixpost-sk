import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

export const auth = building ? undefined! : betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	baseURL: env.APP_URL,
	secret: env.SESSION_SECRET,
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		twitter: {
			clientId: env.TWITTER_CLIENT_ID!,
			clientSecret: env.TWITTER_CLIENT_SECRET!
		},
		facebook: {
			clientId: env.FACEBOOK_APP_ID!,
			clientSecret: env.FACEBOOK_APP_SECRET!
		}
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5
		}
	}
});
