/**
 * Provision / Update Single Admin Account in Supabase Auth
 * Usage: node backend/scripts/create-admin.js [email] [password]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(backendDir, '..');

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

const email = process.argv[2] || process.env.ADMIN_EMAIL || 'mazaharmazahar504@gmail.com';
const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Mazahar@123';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eenuitztjyosmgxcfpeb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SnvMfAQdB04IIJAh0VHRgw_I97Zyq5j';

async function main() {
  console.log('====================================================');
  console.log(` Provisioning Single Admin User: ${email}`);
  console.log('====================================================');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Try signing up (if not exists)
  const signupRes = await supabase.auth.signUp({
    email,
    password
  });

  if (signupRes.error && !signupRes.error.message.includes('already registered')) {
    console.log('SignUp note:', signupRes.error.message);
  }

  // 2. Direct database connection to confirm email and update password
  const client = new Client({
    host: process.env.DB_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres.eenuitztjyosmgxcfpeb',
    password: process.env.DB_PASSWORD || 'Mazahar@123',
    database: process.env.DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Ensure email is confirmed and password hash is set
    await client.query(`
      UPDATE auth.users
      SET 
        encrypted_password = extensions.crypt($1, extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = '{"role":"admin","name":"Sayyad Mazahar Mehadi"}'::jsonb,
        updated_at = now()
      WHERE email = $2;
    `, [password, email]);

    console.log(' Verified & confirmed in auth.users.');

    await client.end();

    // 3. Test verification login
    const testLogin = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (testLogin.error) {
      console.error('❌ Verification login failed:', testLogin.error.message);
    } else {
      console.log('🎉 Single Administrator authenticated successfully with Supabase Auth!');
      console.log('   Admin Email:', testLogin.data.user.email);
    }
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

main();
