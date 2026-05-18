import { pgTable, serial, integer, json, date, timestamp, varchar, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { accounts } from './accounts.js';

export const importedPosts = pgTable('imported_posts', {
	id: serial('id').primaryKey(),
	accountId: integer('account_id').references(() => accounts.id).notNull(),
	providerPostId: varchar('provider_post_id', { length: 255 }).notNull(),
	content: json('content').notNull(),
	metrics: json('metrics').notNull(),
	createdAt: timestamp('created_at').defaultNow()
}, (table) => [
	uniqueIndex('imported_posts_account_provider_unq').on(table.accountId, table.providerPostId),
	index('imported_posts_account_idx').on(table.accountId),
	index('imported_posts_provider_post_idx').on(table.providerPostId)
]);

export const facebookInsights = pgTable('facebook_insights', {
	id: serial('id').primaryKey(),
	accountId: integer('account_id').references(() => accounts.id).notNull(),
	type: integer('type').notNull(),
	value: integer('value').notNull(),
	date: date('date').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
	uniqueIndex('fb_insights_account_type_date_unq').on(table.accountId, table.type, table.date),
	index('fb_insights_account_idx').on(table.accountId)
]);

export const metrics = pgTable('metrics', {
	id: serial('id').primaryKey(),
	accountId: integer('account_id').references(() => accounts.id).notNull(),
	data: json('data').notNull(),
	date: date('date').notNull()
}, (table) => [
	uniqueIndex('metrics_account_date_unq').on(table.accountId, table.date),
	index('metrics_account_idx').on(table.accountId)
]);

export const audience = pgTable('audience', {
	id: serial('id').primaryKey(),
	accountId: integer('account_id').references(() => accounts.id).notNull(),
	total: integer('total').default(0).notNull(),
	date: date('date').notNull()
}, (table) => [
	index('audience_account_date_idx').on(table.accountId, table.date)
]);
