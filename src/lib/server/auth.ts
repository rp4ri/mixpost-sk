import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { users } from './schema/index.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

export async function getUserByEmail(email: string) {
	const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
	return user ?? null;
}

export async function createUser(name: string, email: string, password: string) {
	const passwordHash = await hashPassword(password);
	const [result] = await db.insert(users).values({ name, email, password: passwordHash });
	return result.insertId;
}
