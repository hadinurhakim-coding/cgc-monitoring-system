import { createAdminServerClient } from "$lib/server/auth.js";

// This server service uses the FLAT acgs_assessments table which contains 
// both master data (titles, levels, parts) and answers in a single denormalized structure.
export async function getAssessmentData(year: number, divisionId?: string) {
  const adminDb = createAdminServerClient();
  
  console.log(`Fetching assessment data for year: ${year}...`);

  // We query from the flat acgs_assessments table
  const { data, error } = await adminDb
    .from('acgs_assessments')
    .select('*')
    .eq('year', year)
    .order('sort_order');

  if (error) {
    console.error('Error fetching flat assessment data:', error);
    return { data: [], error: error };
  }

  if (!data || data.length === 0) {
    console.warn(`No data found for year ${year} in flat table.`);
    return { data: [], error: null };
  }

  // Pre-process data for UI compatibility
  const result = data.map(item => {
    // If it's a question, ensure the status is mapped to the format the UI expects (YES/NO/NA)
    if (item.type === 'question') {
      let uiStatus = '';
      if (item.status) {
        uiStatus = item.status.toUpperCase();
      }
      return {
        ...item,
        id: item.uid || item.id, // Use UID/ID consistently
        status: uiStatus
      };
    }
    return {
      ...item,
      id: item.uid || item.id
    };
  });

  // For the flat table, 'assessmentId' isn't a separate header, 
  // but we can return the year as a pseudo-identifier or use the first row's ID 
  // if we need it for something. 
  return { 
    data: result, 
    assessmentId: `flat-${year}` 
  };
}
