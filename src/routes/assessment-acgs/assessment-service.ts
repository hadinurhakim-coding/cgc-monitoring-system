import { supabase } from "$lib/supabaseClient.js";

export type UpsertAnswerInput = {
	row_uid?: string;
	id?: string;
	implementation?: string;
	evidence?: string;
	status?: string;
	recommendation?: string;
};

// Client-side updates on flat `acgs_assessments` (RLS + authenticated user).
export async function upsertAnswer(data: UpsertAnswerInput) {
	const rowUid = data.row_uid ?? data.id;
	if (!rowUid) {
		return { error: new Error("row_uid or id (uuid) is required") };
	}

	const { row_uid: _rw, id: _id, ...fields } = data;

  if (fields.status) {
    fields.status = fields.status.toLowerCase();
  }

  const { error } = await supabase
    .from('acgs_assessments')
    .update({
        ...fields,
        updated_at: new Date().toISOString()
    })
    .eq('uid', rowUid);

  return { error };
}

export async function uploadEvidence(file: File, folder: string = 'gcg-evidence') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('gcg-evidence')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) return { data: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('gcg-evidence')
    .getPublicUrl(filePath);

  return { data: publicUrl, error: null };
}
