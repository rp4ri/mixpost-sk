import { db } from '../db.js';
import { accounts, facebookInsights } from '../schema/index.js';
import { eq } from 'drizzle-orm';
import { FacebookProvider } from '../providers/facebook.js';

export async function importFacebookInsights(accountId: number) {
	const [account] = await db.select().from(accounts)
		.where(eq(accounts.id, accountId));
	if (!account || account.provider !== 'facebook_page') return;

	const credentials = typeof account.accessToken === 'string'
		? JSON.parse(account.accessToken)
		: account.accessToken;
	const provider = new FacebookProvider({
		pageId: account.providerId,
		pageAccessToken: (credentials as any).pageAccessToken ?? (credentials as any).access_token
	});

	const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
	const metricsData = await provider.getMetrics(account.providerId, since);

	for (const m of metricsData) {
		await db.insert(facebookInsights).values({
			accountId,
			type: 1,
			value: m.engagements,
			date: m.date
		}).onConflictDoNothing();

		await db.insert(facebookInsights).values({
			accountId,
			type: 2,
			value: m.impressions,
			date: m.date
		}).onConflictDoNothing();
	}
}
