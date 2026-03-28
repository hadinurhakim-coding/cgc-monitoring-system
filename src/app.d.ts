// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: {
				userId: string | null;
				email: string | null;
				role: string | null;
				divisionId: string | null;
				accessToken: string | null;
				refreshToken: string | null;
				isAuthenticated: boolean;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
