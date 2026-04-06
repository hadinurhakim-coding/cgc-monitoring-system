/**
 * Seed tunggal ACGS: **menghapus seluruh** isi `acgs_assessments`, lalu insert ulang dari master
 * (`assessment-data` → `buildFlatRowsForYear`). Hanya untuk dev / reset penuh — di produksi
 * jangan menjalankan ini jika perlu mempertahankan jawaban tahun-tahun lalu.
 *
 * Tahun yang di-seed:
 *   - Argumen CLI `2024 2025 2026`, atau
 *   - Env `ACGS_SEED_YEARS` (koma/spasi), atau
 *   - Satu tahun dari `ACGS_TEMPLATE_YEAR` (default 2026).
 *
 * Tahun template (`ACGS_TEMPLATE_YEAR`) dipakai aplikasi saat auto-populate tahun baru (clone snapshot);
 * seed script hanya memakainya sebagai default tahun jika tidak ada argumen/env tahun.
 *
 * Usage:
 *   bun run seed:acgs
 *   bun run scripts/seed-db.ts 2024 2025 2026
 *
 * Butuh SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY di .env
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { buildFlatRowsForYear } from "../src/routes/(app)/assessment-acgs/acgs-defaults.js";

dotenv.config();

const DUMMY_UUID = "00000000-0000-0000-0000-000000000000";

function parseYears(): number[] {
	const argv = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a));
	if (argv.length > 0) return argv.map((y) => parseInt(y, 10));

	const envList = process.env.ACGS_SEED_YEARS?.split(/[\s,]+/)
		.map((s) => s.trim())
		.filter((a) => /^\d{4}$/.test(a))
		.map((y) => parseInt(y, 10));
	if (envList?.length) return envList;

	const raw = process.env.ACGS_TEMPLATE_YEAR ?? "2026";
	const y = parseInt(raw, 10);
	return Number.isFinite(y) && y >= 2000 && y <= 2200 ? [y] : [2026];
}

async function wipeAcgs(supabase: ReturnType<typeof createClient>): Promise<Error | null> {
	const { error } = await supabase.from("acgs_assessments").delete().neq("uid", DUMMY_UUID);
	return error ? new Error(error.message) : null;
}

async function insertChunks(
	supabase: ReturnType<typeof createClient>,
	rows: Record<string, unknown>[]
): Promise<Error | null> {
	const chunkSize = 100;
	for (let i = 0; i < rows.length; i += chunkSize) {
		const chunk = rows.slice(i, i + chunkSize);
		const { error } = await supabase.from("acgs_assessments").insert(chunk);
		if (error) return new Error(`Chunk ${i / chunkSize + 1}: ${error.message}`);
	}
	return null;
}

async function main() {
	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
		process.exit(1);
	}

	const years = parseYears();
	const supabase = createClient(url, key);

	console.log("Menghapus semua baris acgs_assessments…");
	const wipeErr = await wipeAcgs(supabase);
	if (wipeErr) {
		console.error(wipeErr.message);
		process.exit(1);
	}

	for (const year of years) {
		const rows = buildFlatRowsForYear(year);
		console.log(`Menyisipkan ${rows.length} baris untuk tahun ${year}…`);
		const insErr = await insertChunks(supabase, rows);
		if (insErr) {
			console.error(insErr.message);
			process.exit(1);
		}
	}

	console.log("Selesai. Tahun:", years.join(", "));
}

main();
