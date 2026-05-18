import { pgTable, serial, uuid, varchar, json, bigint, timestamp } from 'drizzle-orm/pg-core';

export const media = pgTable('media', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').defaultRandom().notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	mimeType: varchar('mime_type', { length: 255 }).notNull(),
	disk: varchar('disk', { length: 255 }).notNull(),
	path: varchar('path', { length: 255 }).notNull(),
	data: json('data'),
	size: bigint('size', { mode: 'number' }).notNull(),
	sizeTotal: bigint('size_total', { mode: 'number' }).notNull(),
	conversions: json('conversions'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
