import { pgTable, serial, varchar, text, json, boolean, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	configuration: text('configuration').notNull(),
	active: boolean('active').default(false).notNull()
});

export const accounts = pgTable('accounts', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').defaultRandom().notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	username: varchar('username', { length: 255 }),
	media: json('media'),
	provider: varchar('provider', { length: 255 }).notNull(),
	providerId: varchar('provider_id', { length: 255 }).notNull(),
	data: json('data'),
	authorized: boolean('authorized').default(false).notNull(),
	accessToken: text('access_token').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
	uniqueIndex('accounts_provider_provider_id_unq').on(table.provider, table.providerId)
]);
