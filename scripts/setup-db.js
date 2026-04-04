import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres');

    // Create table (drop if exists for clean start since we're migrating)
    console.log('Dropping existing table if any...');
    await client.query(`DROP TABLE IF EXISTS public.acgs_assessments CASCADE;`);

    console.log('Creating table...');
    await client.query(`
      CREATE TABLE public.acgs_assessments (
        uid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type TEXT NOT NULL,
        sort_order INT NOT NULL,
        level_label TEXT,
        part_id TEXT,
        section_id TEXT,
        item_id TEXT,
        label TEXT,
        name_en TEXT,
        name_id TEXT,
        full_name_en TEXT,
        full_name_id TEXT,
        question_en TEXT,
        question_id TEXT,
        implementation TEXT DEFAULT '',
        evidence TEXT DEFAULT '',
        status TEXT DEFAULT '',
        recommendation TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Creating indexes...');
    await client.query(`CREATE INDEX idx_acgs_type ON public.acgs_assessments(type);`);
    await client.query(`CREATE INDEX idx_acgs_item_id ON public.acgs_assessments(item_id);`);
    await client.query(`CREATE INDEX idx_acgs_sort_order ON public.acgs_assessments(sort_order);`);

    console.log('Table acgs_assessments created successfully.');
  } catch (err) {
    console.error('Error setting up table:', err);
  } finally {
    await client.end();
  }
}

setup();
