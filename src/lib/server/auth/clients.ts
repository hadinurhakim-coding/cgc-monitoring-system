/**
 * Supabase client factories — server-side only.
 * Satu file, satu tanggung jawab: membuat instance Supabase client.
 */
import { createClient } from "@supabase/supabase-js";
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL
} from "$env/static/private";

/** Client anonim — untuk operasi auth (signIn, verifyOtp, refreshSession). */
export function createAnonServerClient() {
	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

/** Client dengan JWT user saat ini — mematuhi RLS di Supabase. */
export function createUserServerClient(accessToken: string) {
	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		global: {
			headers: { Authorization: `Bearer ${accessToken}` }
		},
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

/** Client service role — melewati RLS, hanya untuk operasi admin/server. */
export function createAdminServerClient() {
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
