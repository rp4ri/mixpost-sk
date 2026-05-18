import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'mysql',
	schema: './src/lib/server/schema/index.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
