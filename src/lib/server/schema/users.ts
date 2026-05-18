import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	rememberToken: varchar('remember_token', { length: 100 }),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
	email: varchar('email', { length: 255 }).primaryKey(),
	token: varchar('token', { length: 255 }).notNull(),
	createdAt: timestamp('created_at')
});

export const sessions = pgTable('sessions', {
	id: varchar('id', { length: 64 }).primaryKey(),
	userId: serial('user_id').references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});
