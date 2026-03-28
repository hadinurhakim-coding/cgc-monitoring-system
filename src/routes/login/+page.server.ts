import { fail } from "@sveltejs/kit";
import { createAdminServerClient, createAnonServerClient } from "$lib/server/auth.js";
import type { Actions } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminClient = createAdminServerClient();
const authClient = createAnonServerClient();

export const actions: Actions = {
	default: async ({ request, url }) => {
		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath =
			redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
				? redirectTo
				: "/dashboard";
		const formData = await request.formData();
		const rawEmail = formData.get("email");
		const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, {
				error: "Format email tidak valid.",
				email
			});
		}

		const { data: registeredUser, error: lookupError } = await adminClient
			.from("users")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (lookupError) {
			console.error("User lookup failed:", lookupError.message);
			return fail(500, {
				error: "Terjadi gangguan sistem. Coba lagi beberapa saat."
			});
		}

		if (!registeredUser) {
			return fail(404, {
				error: "Email belum terdaftar. Hubungi admin untuk aktivasi akun.",
				email
			});
		}

		const { error: magicLinkError } = await authClient.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
				shouldCreateUser: false
			}
		});

		if (magicLinkError) {
			console.error("Magic link send failed:", magicLinkError.message);
			return fail(400, {
				error: "Gagal mengirim magic link. Silakan coba lagi.",
				email
			});
		}

		return {
			success: "Magic link berhasil dikirim. Silakan cek email Anda.",
			email
		};
	}
};
