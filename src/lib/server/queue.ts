import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

let connection: IORedis;
let postQueue: Queue;
let importQueue: Queue;
let metricsQueue: Queue;

if (!building && env.REDIS_URL) {
	connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
	postQueue = new Queue('post-publishing', { connection });
	importQueue = new Queue('social-import', { connection });
	metricsQueue = new Queue('metrics-processing', { connection });
}

export { connection, postQueue, importQueue, metricsQueue, Worker };
