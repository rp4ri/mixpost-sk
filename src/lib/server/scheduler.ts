import cron from 'node-cron';
import { importQueue, metricsQueue } from './queue.js';

export function startScheduler() {
	cron.schedule('0 */6 * * *', async () => {
		await metricsQueue.add('process-all-metrics', {});
	});

	cron.schedule('0 2 * * *', async () => {
		await importQueue.add('import-all-followers', {});
	});

	cron.schedule('0 3 * * *', async () => {
		await importQueue.add('prune-failed-jobs', {});
	});
}
