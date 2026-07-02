/**
 * Session resolution dari cookies — server-side only.
 * Satu file, satu tanggung jawab: resolve auth state dari cookies ke `event.locals.auth`.
 *
 * Delegates ke:
 * - `clients.ts` untuk Supabase client instances
 * - `cookies.ts` untuk cookie read/write/clear
 * - `audit-binding.ts` untuk IP/UA validation saat token refresh
 */
import type { RequestEvent } from "@sveltejs/kit";
import type { User } from "@supabase/supabase-js";

import { createAnonServerClient, createAdminServerClient } from "./clients.js";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, setAuthCookies, clearAuthCookies } from "./cookies.js";
import { auditBindingAllows, safeGetClientAddress } from "./audit-binding.js";

export async function resolveAuthFromCookies(event: RequestEvent): Promise<void> {
	const accessToken = event.cookies.get(ACCESS_TOKEN_COOKIE);
	const refreshToken = event.cookies.get(REFRESH_TOKEN_COOKIE);

	if (!accessToken && !refreshToken) {
		return;
	}

	const anonClient = createAnonServerClient();
	let resolvedAccessToken = accessToken ?? "";
	let resolvedRefreshToken = refreshToken ?? "";
	let authUser: User | null = null;
	let didRefresh = false;

	if (accessToken) {
		const { data: userData, error: userError } = await anonClient.auth.getUser(accessToken);
		authUser = userData.user;

		if (!authUser && refreshToken && userError) {
			const { data: refreshed, error: refreshError } = await anonClient.auth.refreshSession({
				refresh_token: refreshToken
			});
			didRefresh = true;
			if (!refreshError && refreshed.session?.access_token && refreshed.session?.refresh_token) {
				resolvedAccessToken = refreshed.session.access_token;
				resolvedRefreshToken = refreshed.session.refresh_token;
				authUser = refreshed.user ?? null;
			} else {
				authUser = null;
			}
		}
	} else if (refreshToken) {
		const { data: refreshed, error: refreshError } = await anonClient.auth.refreshSession({
			refresh_token: refreshToken
		});
		didRefresh = true;
		if (!refreshError && refreshed.session?.access_token && refreshed.session?.refresh_token) {
			resolvedAccessToken = refreshed.session.access_token;
			resolvedRefreshToken = refreshed.session.refresh_token;
			authUser = refreshed.user ?? null;
		}
	}

	if (!authUser) {
		clearAuthCookies(event.cookies);
		return;
	}

	if (didRefresh) {
		const adminClient = createAdminServerClient();
		const { data: audit } = await adminClient
			.from("auth_login_audits")
			.select("ip_address, user_agent")
			.eq("user_id", authUser.id)
			.maybeSingle();

		const storedIp = audit?.ip_address != null ? String(audit.ip_address) : null;
		const storedUa = audit?.user_agent != null ? String(audit.user_agent) : null;

		if (storedIp !== null && storedUa !== null && storedUa.length > 0) {
			const currentIp = safeGetClientAddress(event);
			const currentUa = event.request.headers.get("user-agent") ?? "";
			if (currentIp !== null && !auditBindingAllows(storedIp, storedUa, currentIp, currentUa)) {
				clearAuthCookies(event.cookies);
				return;
			}
		}

		setAuthCookies(event.cookies, resolvedAccessToken, resolvedRefreshToken);
	}

	const adminClient = createAdminServerClient();
	const { data: userRow } = await adminClient
		.from("users")
		.select("id,email,role,division_id,is_active")
		.eq("id", authUser.id)
		.maybeSingle();

	if (!userRow || userRow.is_active === false) {
		clearAuthCookies(event.cookies);
		return;
	}

	event.locals.auth = {
		userId: authUser.id,
		email: authUser.email ?? null,
		role: userRow.role ?? null,
		divisionId: userRow.division_id ?? null,
		isAuthenticated: true
	};
}
