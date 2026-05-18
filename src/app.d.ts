declare global {
	namespace App {
		interface Locals {
			user: {
				id: number;
				name: string;
				email: string;
			} | null;
		}
	}
}

export {};
