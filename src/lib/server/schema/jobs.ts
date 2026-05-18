import { pgTable, serial, varchar, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';

export const failedJobs = pgTable('failed_jobs', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').defaultRandom().notNull().unique(),
	connection: varchar('connection', { length: 255 }).notNull(),
	queue: varchar('queue', { length: 255 }).notNull(),
	payload: text('payload').notNull(),
	exception: text('exception').notNull(),
	failedAt: timestamp('failed_at').defaultNow()
});

export const jobBatches = pgTable('job_batches', {
	id: varchar('id', { length: 255 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	totalJobs: integer('total_jobs').notNull(),
	pendingJobs: integer('pending_jobs').notNull(),
	failedJobs: integer('failed_jobs').notNull(),
	failedJobIds: text('failed_job_ids').notNull(),
	options: text('options'),
	cancelledAt: integer('cancelled_at'),
	createdAt: integer('created_at').notNull(),
	finishedAt: integer('finished_at')
});
