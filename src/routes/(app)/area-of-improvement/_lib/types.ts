export const STATUS_REKOMENDASI_OPTIONS = [
	"Telah ditindaklanjuti 100%",
	"On Progress",
	"Tidak dapat ditindaklanjuti 100%",
	"Belum ditindaklanjuti",
] as const;

export type StatusRekomendasi = (typeof STATUS_REKOMENDASI_OPTIONS)[number];

export interface AoiItem {
	uid: string;
	year: number;
	sort_order: number | null;
	division_id: string | null;
	aoi_code: string;
	area_of_improvement: string;
	level_label: string;
	part_id: string;
	section_id: string;
	standar_label: string;
	fakta_temuan: string;
	rekomendasi: string;
	tindak_lanjut_rekomendasi: string;
	pic: string;
	target_waktu_penyelesaian: string;
	status_rekomendasi: StatusRekomendasi;
	eviden: string;
	keterangan: string;
	created_at: string;
	updated_at: string;
	followup_updated_at: string;
	created_by: string | null;
	updated_by: string | null;
}

export function isValidStatusRekomendasi(value: unknown): value is StatusRekomendasi {
	return (
		typeof value === "string" &&
		(STATUS_REKOMENDASI_OPTIONS as readonly string[]).includes(value)
	);
}
