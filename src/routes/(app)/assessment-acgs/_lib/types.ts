/** Satu baris pertanyaan di grid Assessment ACGS (payload server + field resolusi). */
export interface AssessmentItem {
	type: string;
	level_label?: string;
	part_id?: string;
	section_id?: string;
	item_id?: string;
	label?: string;
	name_en?: string;
	name_id?: string;
	full_name_en?: string;
	full_name_id?: string;
	question_en?: string;
	question_id?: string;
	implementation?: string;
	evidence?: string;
	status?: string;
	recommendation?: string;
	level?: string;
	part?: string;
	section?: string;
	uid?: string;
	id?: string;
	row_uid?: string;
	sort_order?: number | null;
	acgs_subtitle_context?: { name_en?: string | null; name_id?: string | null } | null;
	acgs_resolved_level?: { label?: string | null } | null;
	acgs_resolved_part?: {
		item_id?: string | null;
		id?: string | null;
		part_id?: string | null;
		name_id?: string | null;
		full_name_en?: string | null;
		full_name_id?: string | null;
	} | null;
	acgs_resolved_section?: {
		item_id?: string | null;
		id?: string | null;
		name_en?: string | null;
		name_id?: string | null;
	} | null;
}
