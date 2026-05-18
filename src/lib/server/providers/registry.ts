import type { SocialProvider } from './base.js';

type ProviderFactory = (credentials: Record<string, string>) => SocialProvider;

const providers = new Map<string, ProviderFactory>();

export function registerProvider(name: string, factory: ProviderFactory) {
	providers.set(name, factory);
}

export function getProvider(name: string, credentials: Record<string, string>): SocialProvider {
	const factory = providers.get(name);
	if (!factory) throw new Error(`Unknown provider: ${name}`);
	return factory(credentials);
}
