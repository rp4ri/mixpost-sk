import { db } from '../db.js';
import { accounts, audience } from '../schema/index.js';
import { getProvider } from '../providers/registry.js';
import { eq } from 'drizzle-orm';

export async function importFollowersForAccount(accountId: number) {
	const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
	if (!account) return;

	const credentials = typeof account.accessToken === 'string'
		? JSON.parse(account.accessToken)
		: account.accessToken;
	const provider = getProvider(account.provider, credentials as Record<string, string>);

	const count = await provider.getFollowerCount();
	const today = new Date().toISOString().split('T')[0];

	await db.insert(audience).values({
		accountId,
		total: count,
		date: today
	}).onConflictDoNothing();
}

export async function importAllFollowers() {
	const allAccounts = await db.select().from(accounts).where(eq(accounts.authorized, true));
	for (const account of allAccounts) {
		try {
			await importFollowersForAccount(account.id);
		} catch (err) {
			console.error(`Failed to import followers for account ${account.id}:`, err);
		}
	}
}
