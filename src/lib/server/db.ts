import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index.js';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

const sql = building ? undefined! : neon(env.DATABASE_URL!);
export const db = building ? undefined! : drizzle(sql, { schema });
