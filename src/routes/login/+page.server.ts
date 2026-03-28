import { fail } from "@sveltejs/kit";
import { createClient } from "@supabase/supabase-js";
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL
} from "$env/static/private";
import type { Actions } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

export const actions: Actions = {
	default: async ({ request, url }) => {
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
				emailRedirectTo: `${url.origin}/`,
				shouldCreateUser: false
			}
		});

		if (magicLinkError) {
			console.error("Magic link send failed:", magicLinkError.message);

			let errorMessage = "Gagal mengirim magic link. Silakan coba lagi.";

			// Handle specific Supabase error messages
			if (magicLinkError.message.toLowerCase().includes("rate limit")) {
				errorMessage = "Terlalu banyak permintaan pengiriman email. Silakan tunggu beberapa saat.";
			} else if (magicLinkError.message) {
				// Tampilkan pesan error spesifik jika ada (misal dari SMTP)
				errorMessage = `Gagal mengirim: ${magicLinkError.message}`;
			}

			return fail(400, {
				error: errorMessage,
				email
			});
		}

		return {
			success: "Magic link berhasil dikirim. Silakan cek email Anda.",
			email
		};
	}
};
