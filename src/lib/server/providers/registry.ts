import type { SocialProvider } from './base.js';
import { createTwitterProvider } from './twitter.js';
import { createFacebookProvider } from './facebook.js';
import { createMastodonProvider } from './mastodon.js';

type ProviderFactory = (credentials: Record<string, string>) => SocialProvider;

const providers: Record<string, ProviderFactory> = {
	twitter: createTwitterProvider,
	facebook: createFacebookProvider,
	facebook_page: createFacebookProvider,
	mastodon: createMastodonProvider
};

export function getProvider(name: string, credentials: Record<string, string>): SocialProvider {
	const factory = providers[name];
	if (!factory) throw new Error(`Unknown provider: ${name}`);
	return factory(credentials);
}

export function getSupportedProviders(): string[] {
	return Object.keys(providers);
}
