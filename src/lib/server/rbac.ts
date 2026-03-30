/**
 * FIX: ARCH-04 — Role-Based Access Control (RBAC) di tingkat aplikasi.
 * Sebelumnya `role` diambil di hooks.server.ts tapi tidak pernah digunakan
 * untuk proteksi authorization endpoint.
 */

type UserRole = "admin" | "bpo" | "viewer" | null;

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
	const r = role as Exclude<UserRole, null>;
	return ROLE_PERMISSIONS[r]?.includes(permission) ?? false;
}

/**
 * Helper error guard untuk authorization.
 */
export function requirePermission(role: string | null | undefined, permission: Permission): void {
	if (!hasPermission(role, permission)) {
		throw new Error(`Insufficient permissions: access to ${permission} is denied.`);
	}
}
