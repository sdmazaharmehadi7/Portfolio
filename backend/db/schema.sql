-- ==============================================================================
-- Backend Database Schema: PostgreSQL & Supabase
-- Portfolio content management schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profile Table
-- ------------------------------------------------------------------------------
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'Sayyad Mazahar Mehadi',
  brand_name text not null default 'MAZAHAR',
  title text not null default 'AI / LLM & Agentic Systems Engineer',
  eyebrow text not null default 'AI • FULL-STACK • AGENTIC SYSTEMS',
  headline text not null default 'Building intelligent
software for the
real world.',
  summary text not null default 'Computer Science student focused on AI agents, LLM applications, RAG systems, and modern full-stack development.',
  email text not null default 'mazaharmazahar504@gmail.com',
  gmail_compose_url text not null default 'https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk',
  github_url text not null default 'https://github.com/sdmazaharmehadi7',
  linkedin_url text not null default 'https://www.linkedin.com/in/sayyad-mazahar-mehadi/',
  resume_url text not null default '/resume.pdf',
  footer_location text not null default 'Bengaluru / Online',
  footer_tagline text not null default 'Monochrome Technical Edition',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 2. About Table
-- ------------------------------------------------------------------------------
create table if not exists public.about (
  id uuid primary key default gen_random_uuid(),
  tag text not null default '// PROFILE // BACKGROUND',
  title text not null default 'About',
  paragraphs text[] not null default array[
    'I''m a Computer Science undergraduate focused on AI agents, LLM applications, RAG systems, and full-stack development.',
    'I enjoy turning emerging AI technologies and research ideas into practical software products.'
  ],
  academic_degree text not null default 'B.Tech in Computer Science and Engineering',
  academic_institution text not null default 'Lakireddy Balireddy College of Engineering',
  academic_cgpa text not null default '8.5',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 3. Projects Table
-- ------------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  num text not null, -- '01', '02', '03', etc.
  slug text unique not null,
  title text not null,
  description text not null,
  technologies text[] not null default '{}',
  github_url text,
  live_url text,
  preview_type text not null default 'workbench', -- 'workbench', 'forecast', 'agent', 'chat', 'payment', 'security'
  image_url text,
  display_order int not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 4. Skills Table
-- ------------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- 'Languages', 'AI', 'Development', 'Cloud & Tools'
  skills text[] not null default '{}',
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 5. Experiences Table (Internships & Work)
-- ------------------------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  period text not null default 'Internship',
  title text not null,
  organization text not null,
  focus text,
  description text not null,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 6. Achievements Table
-- ------------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  period text not null default 'Hackathon',
  title text not null,
  organization text not null,
  description text not null,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 7. Education Table
-- ------------------------------------------------------------------------------
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  period text not null default 'B.Tech',
  title text not null,
  organization text not null,
  score text default 'CGPA: 8.5',
  description text not null,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 8. Certifications Table
-- ------------------------------------------------------------------------------
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issue_date text,
  credential_url text,
  credential_id text,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 9. Social Links Table
-- ------------------------------------------------------------------------------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  is_external boolean not null default true,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 10. Portfolio Settings Table
-- ------------------------------------------------------------------------------
create table if not exists public.portfolio_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ------------------------------------------------------------------------------
-- 11. Resume Metadata Table
-- ------------------------------------------------------------------------------
create table if not exists public.resume_metadata (
  id uuid primary key default gen_random_uuid(),
  filename text not null default 'Sayyad_Mazahar_Mehadi_Resume.pdf',
  file_url text not null default '/resume.pdf',
  file_size text default '57 KB',
  file_version text default '1.0.0',
  is_active boolean not null default true,
  uploaded_at timestamp with time zone default now() not null
);

-- ==============================================================================
-- Updated_at Trigger
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profile_updated_at on public.profile;
create trigger set_profile_updated_at before update on public.profile for each row execute function public.handle_updated_at();

drop trigger if exists set_about_updated_at on public.about;
create trigger set_about_updated_at before update on public.about for each row execute function public.handle_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects for each row execute function public.handle_updated_at();

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at before update on public.skills for each row execute function public.handle_updated_at();

drop trigger if exists set_experiences_updated_at on public.experiences;
create trigger set_experiences_updated_at before update on public.experiences for each row execute function public.handle_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements for each row execute function public.handle_updated_at();

drop trigger if exists set_education_updated_at on public.education;
create trigger set_education_updated_at before update on public.education for each row execute function public.handle_updated_at();

drop trigger if exists set_certifications_updated_at on public.certifications;
create trigger set_certifications_updated_at before update on public.certifications for each row execute function public.handle_updated_at();

drop trigger if exists set_social_links_updated_at on public.social_links;
create trigger set_social_links_updated_at before update on public.social_links for each row execute function public.handle_updated_at();

drop trigger if exists set_portfolio_settings_updated_at on public.portfolio_settings;
create trigger set_portfolio_settings_updated_at before update on public.portfolio_settings for each row execute function public.handle_updated_at();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Public: Read published content
-- Authenticated: Full CRUD (Insert, Update, Delete)
-- ==============================================================================

alter table public.profile enable row level security;
alter table public.about enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.achievements enable row level security;
alter table public.education enable row level security;
alter table public.certifications enable row level security;
alter table public.social_links enable row level security;
alter table public.portfolio_settings enable row level security;
alter table public.resume_metadata enable row level security;

-- Policies for public SELECT
drop policy if exists "Allow public read on profile" on public.profile;
create policy "Allow public read on profile" on public.profile for select using (true);
drop policy if exists "Allow auth admin all on profile" on public.profile;
create policy "Allow auth admin all on profile" on public.profile for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on about" on public.about;
create policy "Allow public read on about" on public.about for select using (true);
drop policy if exists "Allow auth admin all on about" on public.about;
create policy "Allow auth admin all on about" on public.about for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on projects" on public.projects;
create policy "Allow public read on projects" on public.projects for select using (is_published = true);
drop policy if exists "Allow auth admin all on projects" on public.projects;
create policy "Allow auth admin all on projects" on public.projects for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on skills" on public.skills;
create policy "Allow public read on skills" on public.skills for select using (is_published = true);
drop policy if exists "Allow auth admin all on skills" on public.skills;
create policy "Allow auth admin all on skills" on public.skills for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on experiences" on public.experiences;
create policy "Allow public read on experiences" on public.experiences for select using (is_published = true);
drop policy if exists "Allow auth admin all on experiences" on public.experiences;
create policy "Allow auth admin all on experiences" on public.experiences for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on achievements" on public.achievements;
create policy "Allow public read on achievements" on public.achievements for select using (is_published = true);
drop policy if exists "Allow auth admin all on achievements" on public.achievements;
create policy "Allow auth admin all on achievements" on public.achievements for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on education" on public.education;
create policy "Allow public read on education" on public.education for select using (is_published = true);
drop policy if exists "Allow auth admin all on education" on public.education;
create policy "Allow auth admin all on education" on public.education for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on certifications" on public.certifications;
create policy "Allow public read on certifications" on public.certifications for select using (is_published = true);
drop policy if exists "Allow auth admin all on certifications" on public.certifications;
create policy "Allow auth admin all on certifications" on public.certifications for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on social_links" on public.social_links;
create policy "Allow public read on social_links" on public.social_links for select using (is_published = true);
drop policy if exists "Allow auth admin all on social_links" on public.social_links;
create policy "Allow auth admin all on social_links" on public.social_links for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on portfolio_settings" on public.portfolio_settings;
create policy "Allow public read on portfolio_settings" on public.portfolio_settings for select using (true);
drop policy if exists "Allow auth admin all on portfolio_settings" on public.portfolio_settings;
create policy "Allow auth admin all on portfolio_settings" on public.portfolio_settings for all to authenticated using (true) with check (true);

drop policy if exists "Allow public read on resume_metadata" on public.resume_metadata;
create policy "Allow public read on resume_metadata" on public.resume_metadata for select using (is_active = true);
drop policy if exists "Allow auth admin all on resume_metadata" on public.resume_metadata;
create policy "Allow auth admin all on resume_metadata" on public.resume_metadata for all to authenticated using (true) with check (true);

-- ==============================================================================
-- Storage Buckets Configuration
-- ==============================================================================
insert into storage.buckets (id, name, public)
values
  ('resumes', 'resumes', true),
  ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow public download of resumes" on storage.objects;
create policy "Allow public download of resumes" on storage.objects for select using (bucket_id = 'resumes');
drop policy if exists "Allow auth admin manage resumes" on storage.objects;
create policy "Allow auth admin manage resumes" on storage.objects for all to authenticated using (bucket_id = 'resumes') with check (bucket_id = 'resumes');

drop policy if exists "Allow public download of portfolio assets" on storage.objects;
create policy "Allow public download of portfolio assets" on storage.objects for select using (bucket_id = 'portfolio-assets');
drop policy if exists "Allow auth admin manage portfolio assets" on storage.objects;
create policy "Allow auth admin manage portfolio assets" on storage.objects for all to authenticated using (bucket_id = 'portfolio-assets') with check (bucket_id = 'portfolio-assets');

