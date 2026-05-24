import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Pool } from 'pg';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnvPath = path.resolve(currentDirectory, '../../.env');
const migrationsDirectory = path.resolve(currentDirectory, '../db/migrations');

dotenv.config({ path: repoRootEnvPath });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not configured');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl
});

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT id FROM schema_migrations');

  return new Set(result.rows.map((row) => row.id));
}

async function getMigrationFiles() {
  const files = await fs.readdir(migrationsDirectory);

  return files.filter((file) => file.endsWith('.sql')).sort();
}

async function runMigration(client, file) {
  const migrationPath = path.join(migrationsDirectory, file);
  const sql = await fs.readFile(migrationPath, 'utf8');

  console.log(`Applying migration ${file}`);

  await client.query('BEGIN');

  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
    await client.query('COMMIT');

    console.log(`Applied migration ${file}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function migrate() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const appliedMigrations = await getAppliedMigrations(client);
    const migrationFiles = await getMigrationFiles();

    for (const file of migrationFiles) {
      if (appliedMigrations.has(file)) {
        console.log(`Skipping migration ${file}`);
        continue;
      }

      await runMigration(client, file);
    }

    console.log('Database migrations completed');
  } finally {
    client.release();
    await pool.end();
  }
}

try {
  await migrate();
} catch (error) {
  console.error(error);
  process.exit(1);
}
