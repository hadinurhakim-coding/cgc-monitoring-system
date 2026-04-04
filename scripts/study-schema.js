import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function studySchema() {
  try {
    await client.connect();
    console.log('--- DATABASE SCHEMA OVERVIEW ---\n');

    // List all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Tables found:', tables.join(', '));
    console.log('\n--- DETAILED STRUCTURE ---');

    for (const table of tables) {
      console.log(`\nTable: ${table}`);
      const columnsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [table]);
      
      columnsRes.rows.forEach(col => {
        console.log(` - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ' DEFAULT ' + col.column_default : ''}`);
      });
    }

  } catch (err) {
    console.error('Error reading schema:', err);
  } finally {
    await client.end();
  }
}

studySchema();
