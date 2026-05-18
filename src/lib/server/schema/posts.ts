import { pgTable, serial, uuid, smallint, timestamp, integer, varchar, json } from 'drizzle-orm/pg-core';
import { accounts } from './accounts.js';

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').defaultRandom().notNull().unique(),
	status: smallint('status').default(0).notNull(),
	scheduleStatus: smallint('schedule_status').default(0).notNull(),
	scheduledAt: timestamp('scheduled_at'),
	publishedAt: timestamp('published_at'),
	deletedAt: timestamp('deleted_at'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const postAccounts = pgTable('post_accounts', {
	id: serial('id').primaryKey(),
	postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
	accountId: integer('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
	providerPostId: varchar('provider_post_id', { length: 255 }),
	data: json('data'),
	errors: json('errors')
});

export const postVersions = pgTable('post_versions', {
	id: serial('id').primaryKey(),
	postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
	accountId: integer('account_id').notNull(),
	isOriginal: smallint('is_original').default(0).notNull(),
	content: json('content')
});
