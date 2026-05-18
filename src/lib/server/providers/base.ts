export interface SocialPost {
	text: string;
	mediaIds?: string[];
}

export interface SocialAccount {
	id: string;
	name: string;
	username: string;
	imageUrl: string;
}

export interface SocialMetrics {
	impressions: number;
	engagements: number;
	followers: number;
	date: string;
}

export interface SocialProvider {
	readonly name: string;
	getAccount(): Promise<SocialAccount>;
	publishPost(post: SocialPost): Promise<{ id: string }>;
	uploadMedia(buffer: Buffer, mimeType: string): Promise<string>;
	getMetrics(accountId: string, since: Date): Promise<SocialMetrics[]>;
	getFollowerCount(): Promise<number>;
}
