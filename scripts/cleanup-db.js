import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres (Cleanup)');

    const tablesToDrop = [
      'acgs_assessment_answers',
      'acgs_parts',
      'acgs_questions',
      'acgs_sections'
    ];

    for (const table of tablesToDrop) {
      console.log(`Dropping table: ${table}...`);
      await client.query(`DROP TABLE IF EXISTS public."${table}" CASCADE;`);
    }

    console.log('Cleanup completed successfully.');
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await client.end();
  }
}

cleanup();
