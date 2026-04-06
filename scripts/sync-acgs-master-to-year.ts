/**
 * Terapkan teks struktur dari master (`assessment-data` → `buildFlatRowsForYear`) ke **satu tahun**
 * di `acgs_assessments` saja. Tahun lain tidak disentuh.
 *
 * Kolom yang di-update (dari master): type, level_label, part_id, section_id, item_id, label,
 * name_en, name_id, full_name_en, full_name_id, question_en, question_id, updated_at.
 * Kolom jawaban **tidak** diubah: implementation, evidence, status, recommendation.
 *
 * Pencocokan baris: `sort_order` di DB harus sama dengan indeks master (0 … n−1), seperti hasil seed.
 *
 * Usage:
 *   bun run sync:acgs:year 2028
 *   bun run scripts/sync-acgs-master-to-year.ts 2028
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { buildFlatRowsForYear } from "../src/routes/(app)/assessment-acgs/acgs-defaults.js";

dotenv.config();

type DbRow = { uid: string; type: string | null; sort_order: number | null };

function structuralPatch(m: Record<string, unknown>): Record<string, unknown> {
	return {
		type: m.type,
		level_label: m.level_label ?? null,
		part_id: m.part_id ?? null,
		section_id: m.section_id ?? null,
		item_id: m.item_id ?? null,
		label: m.label ?? null,
		name_en: m.name_en ?? null,
		name_id: m.name_id ?? null,
		full_name_en: m.full_name_en ?? null,
		full_name_id: m.full_name_id ?? null,
		question_en: m.question_en ?? null,
		question_id: m.question_id ?? null,
		updated_at: new Date().toISOString()
	};
}

async function main() {
	const yearArg = process.argv[2];
	if (!yearArg || !/^\d{4}$/.test(yearArg)) {
		console.error("Usage: bun run scripts/sync-acgs-master-to-year.ts <YYYY>");
		process.exit(1);
	}
	const year = parseInt(yearArg, 10);

	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
		process.exit(1);
	}

	const supabase = createClient(url, key);
	const masterRows = buildFlatRowsForYear(year);

	const { data: dbRows, error: selErr } = await supabase
		.from("acgs_assessments")
		.select("uid, type, sort_order")
		.eq("year", year)
		.order("sort_order", { ascending: true });

	if (selErr) {
		console.error(selErr.message);
		process.exit(1);
	}

	if (!dbRows?.length) {
		console.error(`Tidak ada baris untuk year=${year}. Isi tahun itu dulu (buka halaman assessment atau seed).`);
		process.exit(1);
	}

	const bySort = new Map<number, DbRow>();
	for (const r of dbRows as DbRow[]) {
		if (r.sort_order == null || Number.isNaN(Number(r.sort_order))) continue;
		bySort.set(Number(r.sort_order), r);
	}

	let updated = 0;
	let skipped = 0;

	for (let i = 0; i < masterRows.length; i++) {
		const m = masterRows[i]!;
		const db = bySort.get(i);
		if (!db) {
			console.warn(`Lewati sort_order=${i}: tidak ada baris DB`);
			skipped++;
			continue;
		}
		const mt = String(m.type ?? "").toLowerCase();
		const dt = String(db.type ?? "").toLowerCase();
		if (mt !== dt) {
			console.warn(`Lewati sort_order=${i}: type DB "${db.type}" ≠ master "${m.type}"`);
			skipped++;
			continue;
		}

		const { error: upErr } = await supabase
			.from("acgs_assessments")
			.update(structuralPatch(m))
			.eq("uid", db.uid);

		if (upErr) {
			console.error(`Update gagal sort_order=${i} uid=${db.uid}:`, upErr.message);
			process.exit(1);
		}
		updated++;
	}

	if (dbRows.length !== masterRows.length) {
		console.warn(
			`Jumlah baris DB (${dbRows.length}) ≠ master (${masterRows.length}). ` +
				"Hanya indeks yang punya pasangan sort_order yang di-update."
		);
	}

	console.log(`Selesai. Tahun ${year}: ${updated} baris di-update, ${skipped} dilewati.`);
}

main();
