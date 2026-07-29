/**
 * Browser-side Supabase client — untuk Realtime subscriptions.
 * Menggunakan public anon key; autentikasi via access token dari cookie server.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";

let browserClient: SupabaseClient | null = null;
let realtimeAccessToken = "";

export async function createBrowserSupabase(accessToken: string): Promise<SupabaseClient> {
	browserClient ??= createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: { autoRefreshToken: false, persistSession: false }
	});

	if (realtimeAccessToken !== accessToken) {
		await browserClient.realtime.setAuth(accessToken);
		realtimeAccessToken = accessToken;
	}

	return browserClient;
}
