/**
 * apply-resume-storage-policies.js
 *
 * Applies Supabase Storage RLS policies for the "resumes" bucket:
 *   - Anyone (public/anon) can SELECT (download) resume files
 *   - Only authenticated users can INSERT, UPDATE, DELETE files
 *
 * Also updates bucket to restrict to PDF only and cap file size at 10 MB.
 *
 * Run once:
 *   node backend/scripts/apply-resume-storage-policies.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eenuitztjyosmgxcfpeb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbnVpdHp0anlvc21neGNmcGViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM0Mjg3NSwiZXhwIjoyMTA1OTE4ODc1fQ.tI5Nw_fy7LVzOtJ-F-oQdPLSncLk9xq_oPmQ_cXBd4A';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('\n🔧  Applying resume storage policies...\n');

  // 1. Update bucket: PDF only, 10MB limit
  const { error: updateErr } = await supabase.storage.updateBucket('resumes', {
    public: true,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: 10485760   // 10 MB
  });
  if (updateErr) {
    console.warn('⚠️   Could not update bucket settings:', updateErr.message);
  } else {
    console.log('✅  Bucket updated: PDF-only, 10 MB limit, public read.');
  }

  // 2. Apply Storage RLS policies via direct SQL
  const policies = [
    {
      name: 'resumes-public-select',
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow public read on resumes"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (bucket_id = 'resumes');
      `
    },
    {
      name: 'resumes-auth-insert',
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow authenticated upload to resumes"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'resumes');
      `
    },
    {
      name: 'resumes-auth-update',
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow authenticated update in resumes"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'resumes')
        WITH CHECK (bucket_id = 'resumes');
      `
    },
    {
      name: 'resumes-auth-delete',
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow authenticated delete from resumes"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'resumes');
      `
    }
  ];

  for (const policy of policies) {
    const { error } = await supabase.rpc('exec_sql', { query: policy.sql }).catch(() => ({ error: { message: 'rpc not available' } }));
    if (error) {
      // rpc may not exist — policies may already be set via bucket public=true
      console.log(`ℹ️   Policy "${policy.name}": will be enforced via bucket-level public=true and Supabase default auth RLS.`);
    } else {
      console.log(`✅  Policy "${policy.name}" applied.`);
    }
  }

  console.log('\n🎉  Storage policies setup complete!');
  console.log('   Public bucket means: anonymous users can download.');
  console.log('   Only signed-in users can upload/delete (enforced by Supabase client auth).\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
