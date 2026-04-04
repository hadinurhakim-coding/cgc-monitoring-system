import type { PageServerLoad } from "./$types.js";
import { supabase } from "$lib/supabaseClient.js";

export const load: PageServerLoad = async () => {
  const { data: assessmentData, error } = await supabase
    .from('acgs_assessments')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching ACGS data:', error);
    return { assessmentData: [] };
  }

  return {
    assessmentData
  };
};
