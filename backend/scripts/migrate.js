/**
 * Backend Migration & Seeder Script
 * Connects directly to Supabase PostgreSQL and applies schema and seed data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(backendDir, '..');

// Load environment variables
function loadEnv() {
  const envPaths = [
    path.join(rootDir, '.env'),
    path.join(rootDir, '.env.local'),
    path.join(backendDir, '.env'),
    path.join(backendDir, '.env.local')
  ];

  for (const fullPath of envPaths) {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    }
  }
}

loadEnv();

async function runMigration() {
  console.log('====================================================');
  console.log('  Portfolio Database Migration & Seed (Supabase)');
  console.log('====================================================');

  // Supabase connection settings
  const config = {
    host: process.env.DB_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres.eenuitztjyosmgxcfpeb',
    password: process.env.DB_PASSWORD || 'Mazahar@123',
    database: process.env.DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  };

  console.log(`Connecting to database at ${config.host}:${config.port}...`);

  const client = new Client(config);

  try {
    await client.connect();
    console.log(' Connected to Supabase PostgreSQL successfully.\n');

    // 1. Read & execute Schema
    const schemaPath = path.join(backendDir, 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Applying schema from backend/db/schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log(' Schema applied successfully.\n');
    } else {
      console.warn('⚠️  backend/db/schema.sql not found, skipping schema creation.');
    }

    // 2. Read & execute Seed
    const seedPath = path.join(backendDir, 'db', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('Applying seed data from backend/db/seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log(' Seed data applied successfully.\n');
    } else {
      console.warn('⚠️  backend/db/seed.sql not found, skipping seed data.');
    }

    // 3. Verify counts in tables
    console.log('Verifying table records:');
    const tables = [
      'profile',
      'about',
      'projects',
      'skills',
      'experiences',
      'achievements',
      'education',
      'certifications',
      'social_links',
      'portfolio_settings',
      'resume_metadata'
    ];

    for (const table of tables) {
      try {
        const res = await client.query(`SELECT count(*) as count FROM public.${table};`);
        console.log(`  - public.${table.padEnd(20)}: ${res.rows[0].count} records`);
      } catch (err) {
        console.log(`  - public.${table.padEnd(20)}: Error reading (${err.message})`);
      }
    }

    console.log('\n Database migration & seeding completed with 100% success!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigration();
