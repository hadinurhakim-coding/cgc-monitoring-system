import { assessmentData } from '../src/routes/assessment-acgs/assessment-data';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding ACGS Assessment data with Year 2026...');

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('acgs_assessments')
    .delete()
    .neq('type', 'completely_non_existent'); // Delete all

  if (deleteError) {
    console.error('Error clearing table:', deleteError);
  }

  const rows = assessmentData.map((item, index) => ({
    type: item.type,
    sort_order: index,
    year: 2026, // Include year!
    level_label: (item as any).level || null,
    part_id: (item as any).part || null,
    section_id: (item as any).section || null,
    item_id: item.id || null,
    label: item.label || null,
    name_en: item.name_en || null,
    name_id: item.name_id || null,
    full_name_en: item.full_name_en || null,
    full_name_id: item.full_name_id || null,
    question_en: item.question_en || null,
    question_id: item.question_id || null,
    implementation: item.implementation || '',
    evidence: item.evidence || '',
    status: item.status || '',
    recommendation: item.recommendation || ''
  }));

  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('acgs_assessments')
      .insert(chunk);
    
    if (error) {
      console.error(`Error inserting chunk ${i / chunkSize}:`, error);
    } else {
      console.log(`Inserted chunk ${i / chunkSize + 1}/${Math.ceil(rows.length / chunkSize)}`);
    }
  }

  console.log('Seeding completed successfully with Year 2026.');
}

seed();
