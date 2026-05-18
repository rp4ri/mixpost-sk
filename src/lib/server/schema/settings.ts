import { pgTable, serial, varchar, json } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	payload: json('payload').notNull()
});
