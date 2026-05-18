import { pgTable, serial, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { posts } from './posts.js';

export const tags = pgTable('tags', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').defaultRandom().notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	hexColor: varchar('hex_color', { length: 6 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const tagPost = pgTable('tag_post', {
	id: serial('id').primaryKey(),
	tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
	postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull()
});
