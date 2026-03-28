import { createClient } from "@supabase/supabase-js";
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL
} from "$env/static/private";

export const ACCESS_TOKEN_COOKIE = "gcg-access-token";
export const REFRESH_TOKEN_COOKIE = "gcg-refresh-token";

export function createAnonServerClient() {
	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

export function createAdminServerClient() {
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
