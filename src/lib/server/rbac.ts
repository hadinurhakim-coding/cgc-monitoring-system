/**
 * FIX: ARCH-04 — Role-Based Access Control (RBAC) di tingkat aplikasi.
 * Sebelumnya `role` diambil di hooks.server.ts tapi tidak pernah digunakan
 * untuk proteksi authorization endpoint.
 */

export type UserRole = "admin" | "bpo" | "viewer" | null;
export type AuthContext = App.Locals["auth"];

type Permission = "assessment:read" | "assessment:write" | "users:manage" | "dashboard:read";

const ROLE_PERMISSIONS: Record<Exclude<UserRole, null>, Permission[]> = {
	admin: ["assessment:read", "assessment:write", "users:manage", "dashboard:read"],
	bpo: ["assessment:read", "assessment:write", "dashboard:read"],
	viewer: ["assessment:read", "dashboard:read"]
};

/**
 * Cek apakah user memiliki permission tertentu berdasarkan role-nya.
 */
export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
	if (!role) return false;
	if (!(role in ROLE_PERMISSIONS)) return false;
	return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS].includes(permission);
}

export function isAdminRole(role: string | null | undefined): boolean {
	return role === "admin";
}

export function isAuthenticated(auth: AuthContext): boolean {
	return Boolean(auth.isAuthenticated && auth.userId);
}

export function canAccessDivision(auth: AuthContext, divisionId: string | null | undefined): boolean {
	if (!isAuthenticated(auth)) return false;
	if (isAdminRole(auth.role)) return true;
	if (auth.role !== "bpo" && auth.role !== "viewer") return false;
	return Boolean(auth.divisionId && divisionId && auth.divisionId === divisionId);
}

export function scopedDivisionId(auth: AuthContext): string | null {
	if (!isAuthenticated(auth) || isAdminRole(auth.role)) return null;
	return auth.divisionId;
}

/**
 * Helper error guard untuk authorization.
 */
export function requirePermission(role: string | null | undefined, permission: Permission): void {
	if (!hasPermission(role, permission)) {
		throw new Error(`Insufficient permissions: access to ${permission} is denied.`);
	}
}
