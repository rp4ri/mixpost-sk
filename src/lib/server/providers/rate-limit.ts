import IORedis from 'ioredis';

let redis: IORedis | null = null;

function getRedis(): IORedis {
	if (!redis) {
		redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
			maxRetriesPerRequest: null
		});
	}
	return redis;
}

export interface RateLimitInfo {
	limit: number;
	remaining: number;
	resetAt: number;
}

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
	const limit = headers.get('x-ratelimit-limit') ?? headers.get('x-rate-limit-limit');
	const remaining = headers.get('x-ratelimit-remaining') ?? headers.get('x-rate-limit-remaining');
	const reset = headers.get('x-ratelimit-reset') ?? headers.get('x-rate-limit-reset');

	if (!limit || !remaining || !reset) return null;

	const resetAt = reset.includes('T')
		? Math.floor(new Date(reset).getTime() / 1000)
		: parseInt(reset);

	return {
		limit: parseInt(limit),
		remaining: parseInt(remaining),
		resetAt
	};
}

export async function trackRateLimit(provider: string, endpoint: string, info: RateLimitInfo) {
	const key = `ratelimit:${provider}:${endpoint}`;
	const r = getRedis();
	await r.set(key, JSON.stringify(info), 'EX', Math.max(info.resetAt - Math.floor(Date.now() / 1000), 60));
}

export async function canMakeRequest(provider: string, endpoint: string): Promise<{ ok: boolean; retryAfter?: number }> {
	const key = `ratelimit:${provider}:${endpoint}`;
	const r = getRedis();
	const data = await r.get(key);
	if (!data) return { ok: true };

	const info: RateLimitInfo = JSON.parse(data);
	if (info.remaining < 2) {
		const retryAfter = Math.max(info.resetAt - Math.floor(Date.now() / 1000), 1);
		return { ok: false, retryAfter };
	}
	return { ok: true };
}
