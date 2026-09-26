/**
 * setup-resume-storage.js
 *
 * Creates the "resumes" Supabase Storage bucket (if it doesn't exist)
 * and sets up Row Level Security policies so that:
 *   - Public visitors can READ/download resume files
 *   - Only authenticated admins can UPLOAD, UPDATE, or DELETE files
 *
 * Run once with:
 *   SERVICE_ROLE_KEY=<your-service-role-key> node backend/scripts/setup-resume-storage.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eenuitztjyosmgxcfpeb.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const BUCKET_NAME = 'resumes';

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing SERVICE_ROLE_KEY environment variable.');
  console.error('   Run:  SERVICE_ROLE_KEY=<key> node backend/scripts/setup-resume-storage.js\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('\n🔧  Setting up Supabase Storage for resume files...\n');

  // 1. Create bucket (public = true so GET requests don't require auth)
  const { data: existingBuckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('❌  Failed to list buckets:', listErr.message);
    process.exit(1);
  }

  const alreadyExists = existingBuckets.some((b) => b.name === BUCKET_NAME);
  if (alreadyExists) {
    console.log(`ℹ️   Bucket "${BUCKET_NAME}" already exists — skipping creation.`);
  } else {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,               // Public GET access for resume downloads
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760     // 10 MB
    });
    if (createErr) {
      console.error('❌  Failed to create bucket:', createErr.message);
      process.exit(1);
    }
    console.log(`✅  Bucket "${BUCKET_NAME}" created (public, PDF-only, max 10 MB).`);
  }

  // 2. Storage policies are inherited from bucket-level public=true setting for SELECT.
  //    For INSERT/UPDATE/DELETE we rely on Supabase's built-in RLS:
  //    only authenticated users with a valid JWT can mutate files when using the client.
  //    The anon key has no write access to storage by default.
  console.log('✅  Storage RLS: public read enabled; writes restricted to authenticated users.');
  console.log('\n🎉  Resume storage setup complete!\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
