import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { publishPostToAccount } from './publish-post.js';
import { importFollowersForAccount, importAllFollowers } from './import-followers.js';
import { importPostsForAccount } from './import-posts.js';
import { processMetricsForAccount, processAllMetrics } from './process-metrics.js';
import { importFacebookInsights } from './facebook-insights.js';
import { db } from '../db.js';
import { posts, postAccounts } from '../schema/index.js';
import { eq, and } from 'drizzle-orm';

let initialized = false;

export function startWorkers() {
	if (initialized) return;
	initialized = true;

	const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
		maxRetriesPerRequest: null
	});

	new Worker('post-publishing', async (job) => {
		const { postId, accountId } = job.data;
		try {
			await publishPostToAccount(postId, accountId);
			await db.update(postAccounts)
				.set({ errors: null })
				.where(and(eq(postAccounts.postId, postId), eq(postAccounts.accountId, accountId)));
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Unknown error';
			await db.update(postAccounts)
				.set({ errors: [errorMsg] })
				.where(and(eq(postAccounts.postId, postId), eq(postAccounts.accountId, accountId)));
			throw err;
		}
	}, {
		connection,
		concurrency: 3,
		limiter: { max: 10, duration: 60000 }
	});

	new Worker('social-import', async (job) => {
		switch (job.name) {
			case 'import-followers':
				await importFollowersForAccount(job.data.accountId);
				break;
			case 'import-all-followers':
				await importAllFollowers();
				break;
			case 'import-posts':
				await importPostsForAccount(job.data.accountId);
				break;
			case 'import-facebook-insights':
				await importFacebookInsights(job.data.accountId);
				break;
			case 'prune-failed-jobs':
				console.log('Pruning failed jobs...');
				break;
		}
	}, {
		connection,
		concurrency: 2
	});

	new Worker('metrics-processing', async (job) => {
		switch (job.name) {
			case 'process-metrics':
				await processMetricsForAccount(job.data.accountId);
				break;
			case 'process-all-metrics':
				await processAllMetrics();
				break;
		}
	}, {
		connection,
		concurrency: 2
	});

	console.log('BullMQ workers started: post-publishing, social-import, metrics-processing');
}
