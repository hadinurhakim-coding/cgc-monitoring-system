/**
 * Browser-side Supabase client — untuk Realtime subscriptions.
 * Menggunakan public anon key; autentikasi via access token dari cookie server.
 */
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";

export function createBrowserSupabase(accessToken: string) {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			headers: { Authorization: `Bearer ${accessToken}` }
		},
		auth: { autoRefreshToken: false, persistSession: false }
	});
}
