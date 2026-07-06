/**
 * Seed master ACGS normalized.
 *
 * Mengisi/memperbarui `public.acgs_items` dari source TypeScript
 * `assessment-master.ts`. Tidak menyentuh jawaban tahunan di
 * `public.acgs_assessment_answers`.
 *
 * Usage:
 *   bun run seed:acgs
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
	assessmentData,
	type AssessmentItem
} from "../src/routes/(app)/assessment-acgs/_data/assessment-master.js";

dotenv.config();

function nullable(value: string | null | undefined): string | null {
	const text = value ?? null;
	return text === "" ? null : text;
}

function itemRow(item: AssessmentItem, index: number): Record<string, unknown> {
	return {
		type: String(item.type ?? ""),
		sort_order: index,
		level_label: nullable(item.level),
		part_id: nullable(item.part),
		section_id: nullable(item.section),
		item_id: nullable(item.id),
		label: nullable(item.label),
		name_en: nullable(item.name_en),
		name_id: nullable(item.name_id),
		full_name_en: nullable(item.full_name_en),
		full_name_id: nullable(item.full_name_id),
		question_en: nullable(item.question_en),
		question_id: nullable(item.question_id),
		is_active: true
	};
}

async function upsertChunks(
	supabase: ReturnType<typeof createClient>,
	rows: Record<string, unknown>[]
): Promise<Error | null> {
	const chunkSize = 100;
	for (let i = 0; i < rows.length; i += chunkSize) {
		const chunk = rows.slice(i, i + chunkSize);
		const { error } = await supabase.from("acgs_items").upsert(chunk, {
			onConflict: "sort_order"
		});
		if (error) return new Error(`Chunk ${i / chunkSize + 1}: ${error.message}`);
	}
	return null;
}

async function main(): Promise<void> {
	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
		process.exit(1);
	}

	const supabase = createClient(url, key);
	const rows = assessmentData.map(itemRow);
	const error = await upsertChunks(supabase, rows);
	if (error) {
		console.error(error.message);
		process.exit(1);
	}

	console.log(`Selesai seed ${rows.length} master item ACGS ke acgs_items.`);
}

main();
