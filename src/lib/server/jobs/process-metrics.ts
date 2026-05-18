import { db } from '../db.js';
import { accounts, metrics } from '../schema/index.js';
import { getProvider } from '../providers/registry.js';
import { eq } from 'drizzle-orm';

export async function processMetricsForAccount(accountId: number) {
	const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
	if (!account) return;

	const credentials = typeof account.accessToken === 'string'
		? JSON.parse(account.accessToken)
		: account.accessToken;
	const provider = getProvider(account.provider, credentials as Record<string, string>);

	const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
	const providerMetrics = await provider.getMetrics(account.providerId, since);

	for (const m of providerMetrics) {
		await db.insert(metrics).values({
			accountId,
			data: { impressions: m.impressions, engagements: m.engagements, followers: m.followers },
			date: m.date
		}).onConflictDoNothing();
	}
}

export async function processAllMetrics() {
	const allAccounts = await db.select().from(accounts).where(eq(accounts.authorized, true));
	for (const account of allAccounts) {
		try {
			await processMetricsForAccount(account.id);
		} catch (err) {
			console.error(`Failed to process metrics for account ${account.id}:`, err);
		}
	}
}
