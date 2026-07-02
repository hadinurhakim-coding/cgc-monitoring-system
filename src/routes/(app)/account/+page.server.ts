import { fail } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole, type AuthContext } from "$lib/server/rbac.js";
import type { Actions, PageServerLoad } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ROLES = ["admin", "bpo", "viewer"] as const;
const USERS_SELECT = "id,email,full_name,role,division_id,is_active,created_at,updated_at";
const USERS_SELECT_LEGACY = "id,email,full_name,role,division_id,created_at";

type UserRole = (typeof USER_ROLES)[number];

type DivisionOption = {
	id: string;
	name: string;
};

type AccountUser = {
	id: string;
	email: string;
	fullName: string;
	role: UserRole;
	divisionId: string | null;
	divisionName: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string | null;
};

type ActionFailure = {
	error: string;
	intent:
		| "createUser"
		| "updateUser"
		| "deactivateUser"
		| "createDivision"
		| "updateDivision";
	values?: Record<string, string>;
};

function isUserRole(value: string): value is UserRole {
	return (USER_ROLES as readonly string[]).includes(value);
}

function formString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function badRequest(
	intent: ActionFailure["intent"],
	error: string,
	values?: Record<string, string>
): ReturnType<typeof fail<ActionFailure>> {
	return fail(400, { error, intent, values });
}

function forbidden(intent: ActionFailure["intent"]): ReturnType<typeof fail<ActionFailure>> {
	return fail(403, { error: "Anda tidak memiliki izin untuk mengelola akun.", intent });
}

function mapDivision(raw: Record<string, unknown>): DivisionOption {
	return {
		id: String(raw.id ?? ""),
		name: String(raw.name ?? "")
	};
}

function mapUser(
	raw: Record<string, unknown>,
	divisionsById: Map<string, string>
): AccountUser {
	const role = String(raw.role ?? "viewer");
	const divisionId = raw.division_id != null ? String(raw.division_id) : null;

	return {
		id: String(raw.id ?? ""),
		email: String(raw.email ?? ""),
		fullName: String(raw.full_name ?? ""),
		role: isUserRole(role) ? role : "viewer",
		divisionId,
		divisionName: divisionId ? (divisionsById.get(divisionId) ?? null) : null,
		isActive: raw.is_active !== false,
		createdAt: String(raw.created_at ?? ""),
		updatedAt: raw.updated_at != null ? String(raw.updated_at) : null
	};
}

async function loadDivisions(auth: AuthContext): Promise<{
	divisions: DivisionOption[];
	error: string | null;
}> {
	const admin = createAdminServerClient();
	let query = admin
		.from("divisions")
		.select("id,name")
		.order("name", { ascending: true });
	if (!isAdminRole(auth.role)) {
		if (!auth.divisionId) return { divisions: [], error: null };
		query = query.eq("id", auth.divisionId);
	}

	const { data, error } = await query;

	if (error) return { divisions: [], error: error.message };
	return { divisions: (data ?? []).map((row) => mapDivision(row as Record<string, unknown>)), error: null };
}

async function loadProfileRow(userId: string | null): Promise<{
	row: Record<string, unknown> | null;
	error: string | null;
}> {
	if (!userId) return { row: null, error: null };

	const admin = createAdminServerClient();
	const result = await admin
		.from("users")
		.select(USERS_SELECT)
		.eq("id", userId)
		.maybeSingle();

	if (!result.error) {
		return { row: result.data as Record<string, unknown> | null, error: null };
	}

	if (!result.error.message.includes("is_active")) {
		return { row: null, error: result.error.message };
	}

	const legacyResult = await admin
		.from("users")
		.select(USERS_SELECT_LEGACY)
		.eq("id", userId)
		.maybeSingle();

	return {
		row: legacyResult.data as Record<string, unknown> | null,
		error: legacyResult.error?.message ?? null
	};
}

async function loadUserRows(): Promise<{
	rows: Record<string, unknown>[];
	error: string | null;
}> {
	const admin = createAdminServerClient();
	const result = await admin
		.from("users")
		.select(USERS_SELECT)
		.order("created_at", { ascending: false });

	if (!result.error) {
		return { rows: (result.data ?? []) as Record<string, unknown>[], error: null };
	}

	if (!result.error.message.includes("is_active")) {
		return { rows: [], error: result.error.message };
	}

	const legacyResult = await admin
		.from("users")
		.select(USERS_SELECT_LEGACY)
		.order("created_at", { ascending: false });

	return {
		rows: (legacyResult.data ?? []) as Record<string, unknown>[],
		error: legacyResult.error?.message ?? null
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	const canManageUsers = hasPermission(locals.auth.role, "users:manage");

	const { divisions, error: divisionsError } = await loadDivisions(locals.auth);
	const divisionsById = new Map(divisions.map((division) => [division.id, division.name]));
	const { row: profileRow, error: profileError } = await loadProfileRow(locals.auth.userId);

	if (!canManageUsers) {
		return {
			canManageUsers,
			profile: profileRow ? mapUser(profileRow, divisionsById) : null,
			users: [] satisfies AccountUser[],
			divisions,
			loadError: profileError ?? divisionsError
		};
	}

	const { rows: userRows, error: usersError } = await loadUserRows();

	return {
		canManageUsers,
		profile: profileRow ? mapUser(profileRow, divisionsById) : null,
		users: userRows.map((row) => mapUser(row, divisionsById)),
		divisions,
		loadError: profileError ?? usersError ?? divisionsError
	};
};

export const actions: Actions = {
	createUser: async ({ request, locals }) => {
		if (!hasPermission(locals.auth.role, "users:manage")) return forbidden("createUser");

		const formData = await request.formData();
		const email = normalizeEmail(formString(formData, "email"));
		const fullName = formString(formData, "fullName");
		const role = formString(formData, "role");
		const divisionId = formString(formData, "divisionId");
		const values = { email, fullName, role, divisionId };

		if (!email || !EMAIL_REGEX.test(email)) {
			return badRequest("createUser", "Format email tidak valid.", values);
		}
		if (!isUserRole(role)) {
			return badRequest("createUser", "Role tidak valid.", values);
		}
		if (role !== "admin" && !divisionId) {
			return badRequest("createUser", "Divisi wajib dipilih untuk role BPO dan Viewer.", values);
		}

		const admin = createAdminServerClient();
		const { data: created, error: authError } = await admin.auth.admin.createUser({
			email,
			email_confirm: true,
			user_metadata: fullName ? { full_name: fullName } : undefined
		});

		if (authError || !created.user) {
			return badRequest("createUser", authError?.message ?? "Gagal membuat akun Supabase Auth.", values);
		}

		const { error: profileError } = await admin.from("users").insert({
			id: created.user.id,
			email,
			full_name: fullName || null,
			role,
			division_id: divisionId || null,
			is_active: true
		});

		if (profileError) {
			await admin.auth.admin.deleteUser(created.user.id);
			return badRequest("createUser", profileError.message, values);
		}

		return { success: "Akun berhasil dibuat.", intent: "createUser" as const };
	},

	updateUser: async ({ request, locals }) => {
		if (!hasPermission(locals.auth.role, "users:manage")) return forbidden("updateUser");

		const formData = await request.formData();
		const userId = formString(formData, "userId");
		const fullName = formString(formData, "fullName");
		const role = formString(formData, "role");
		const divisionId = formString(formData, "divisionId");
		const isActive = formData.get("isActive") === "on";
		const values = { userId, fullName, role, divisionId, isActive: String(isActive) };

		if (!userId) return badRequest("updateUser", "User tidak valid.", values);
		if (!isUserRole(role)) return badRequest("updateUser", "Role tidak valid.", values);
		if (role !== "admin" && !divisionId) {
			return badRequest("updateUser", "Divisi wajib dipilih untuk role BPO dan Viewer.", values);
		}
		if (userId === locals.auth.userId && !isActive) {
			return badRequest("updateUser", "Anda tidak bisa menonaktifkan akun sendiri dari form edit.", values);
		}

		const admin = createAdminServerClient();
		const { error } = await admin
			.from("users")
			.update({
				full_name: fullName || null,
				role,
				division_id: divisionId || null,
				is_active: isActive
			})
			.eq("id", userId);

		if (error) return badRequest("updateUser", error.message, values);
		return { success: "Akun berhasil diperbarui.", intent: "updateUser" as const };
	},

	deactivateUser: async ({ request, locals }) => {
		if (!hasPermission(locals.auth.role, "users:manage")) return forbidden("deactivateUser");

		const formData = await request.formData();
		const userId = formString(formData, "userId");
		if (!userId) return badRequest("deactivateUser", "User tidak valid.");
		if (userId === locals.auth.userId) {
			return badRequest("deactivateUser", "Anda tidak bisa menonaktifkan akun sendiri.");
		}

		const admin = createAdminServerClient();
		const { error } = await admin.from("users").update({ is_active: false }).eq("id", userId);

		if (error) return badRequest("deactivateUser", error.message);
		return { success: "Akses akun berhasil dinonaktifkan.", intent: "deactivateUser" as const };
	},

	createDivision: async ({ request, locals }) => {
		if (!hasPermission(locals.auth.role, "users:manage")) return forbidden("createDivision");

		const formData = await request.formData();
		const name = formString(formData, "name");
		if (!name) return badRequest("createDivision", "Nama divisi wajib diisi.", { name });

		const admin = createAdminServerClient();
		const { error } = await admin.from("divisions").insert({ name });

		if (error) return badRequest("createDivision", error.message, { name });
		return { success: "Divisi berhasil dibuat.", intent: "createDivision" as const };
	},

	updateDivision: async ({ request, locals }) => {
		if (!hasPermission(locals.auth.role, "users:manage")) return forbidden("updateDivision");

		const formData = await request.formData();
		const divisionId = formString(formData, "divisionId");
		const name = formString(formData, "name");
		const values = { divisionId, name };

		if (!divisionId) return badRequest("updateDivision", "Divisi tidak valid.", values);
		if (!name) return badRequest("updateDivision", "Nama divisi wajib diisi.", values);

		const admin = createAdminServerClient();
		const { error } = await admin.from("divisions").update({ name }).eq("id", divisionId);

		if (error) return badRequest("updateDivision", error.message, values);
		return { success: "Divisi berhasil diperbarui.", intent: "updateDivision" as const };
	}
};
