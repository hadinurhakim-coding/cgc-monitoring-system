import { supabase } from "$lib/supabaseClient.js";

// This client-side service uses the FLAT acgs_assessments table
export async function upsertAnswer(data: { id: string; [key: string]: any }) {
  const { id, ...fields } = data;
  
  // Map uppercase YES/NO to lower case
  if (fields.status) {
    fields.status = fields.status.toLowerCase();
  }

  // Fields should be what's in the table: implementation, evidence, status, recommendation
  const { error } = await supabase
    .from('acgs_assessments')
    .update({
        ...fields,
        updated_at: new Date().toISOString()
    })
    .eq('uid', id); // We use 'id' passed from the UI, which we mapped to 'uid' earlier

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

export async function createAssessment(year: number, divisionId?: string) {
  // In the FLAT schema, creating an assessment for a new year 
  // often means CLONING the master structure (type: subtitle, level, part, section, question)
  // from a previous year. 
  console.warn("createAssessment for flat schema not yet fully implemented via UI cloning.");
  return { data: null, error: 'Not implemented' };
}
