import pg from 'pg';
import dotenv from 'dotenv';
import { assessmentData } from '../src/routes/assessment-acgs/assessment-data.js';

dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres (Migration)');

    // Clear and start fresh
    await client.query('TRUNCATE table public.acgs_assessments');

    console.log(`Starting migration of ${assessmentData.length} items...`);
    
    // In-groups of 100 for better performance without hitting limits
    const BATCH_SIZE = 100;
    for (let i = 0; i < assessmentData.length; i += BATCH_SIZE) {
      const batch = assessmentData.slice(i, i + BATCH_SIZE);
      
      const values = batch.map((item, idx) => [
        item.type,
        i + idx, // sort_order
        item.level || null,
        item.part || null,
        item.section || null,
        item.id || null,
        item.label || null,
        item.name_en || null,
        item.name_id || null,
        item.full_name_en || null,
        item.full_name_id || null,
        item.question_en || null,
        item.question_id || null,
        '',      // implementation
        '',      // evidence
        '',      // status
        ''       // recommendation
      ]);

      const queryText = `
        INSERT INTO public.acgs_assessments (
          type, sort_order, level_label, part_id, section_id, item_id, label, 
          name_en, name_id, full_name_en, full_name_id, question_en, question_id,
          implementation, evidence, status, recommendation
        ) VALUES ${values.map((_, idx) => `($${idx * 17 + 1}, $${idx * 17 + 2}, $${idx * 17 + 3}, $${idx * 17 + 4}, $${idx * 17 + 5}, $${idx * 17 + 6}, $${idx * 17 + 7}, $${idx * 17 + 8}, $${idx * 17 + 9}, $${idx * 17 + 10}, $${idx * 17 + 11}, $${idx * 17 + 12}, $${idx * 17 + 13}, $${idx * 17 + 14}, $${idx * 17 + 15}, $${idx * 17 + 16}, $${idx * 17 + 17})`).join(', ')}`;

      const flatValues = values.flat();
      await client.query(queryText, flatValues);
      process.stdout.write(`Moved ${i + batch.length}/${assessmentData.length} items...\r`);
    }
    
    console.log('\nMigration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
