import cron from 'node-cron';
import { importQueue, metricsQueue } from './queue.js';

export function startScheduler() {
	// Process metrics for all accounts every 6 hours
	cron.schedule('0 */6 * * *', async () => {
		await metricsQueue.add('process-all-metrics', {});
		console.log('Scheduled: process-all-metrics');
	});

	// Import follower counts daily at 2 AM
	cron.schedule('0 2 * * *', async () => {
		await importQueue.add('import-all-followers', {});
		console.log('Scheduled: import-all-followers');
	});

	// Prune failed jobs daily at 3 AM
	cron.schedule('0 3 * * *', async () => {
		await importQueue.add('prune-failed-jobs', {});
		console.log('Scheduled: prune-failed-jobs');
	});

	console.log('Scheduler started: metrics (6h), followers (daily 2AM), prune (daily 3AM)');
}
