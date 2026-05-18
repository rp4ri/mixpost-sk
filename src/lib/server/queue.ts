import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '$env/dynamic/private';

const connection = new IORedis(env.REDIS_URL ?? 'redis://localhost:6379', {
	maxRetriesPerRequest: null
});

export const postQueue = new Queue('post-publishing', { connection });
export const importQueue = new Queue('social-import', { connection });
export const metricsQueue = new Queue('metrics-processing', { connection });

export { connection, Worker };
