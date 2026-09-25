# Backend & Database Architecture — Sayyad Mazahar Mehadi Portfolio

This directory contains all server-side assets, database schemas, Row Level Security (RLS) policies, and automated seeding scripts connecting the portfolio to **Supabase PostgreSQL**.

---

## Directory Structure

```text
backend/
├── db/
│   ├── schema.sql        # Full PostgreSQL database schema, triggers, and RLS policies
│   └── seed.sql          # Idempotent seed data for all 11 portfolio tables
├── scripts/
│   ├── migrate.js        # Automated direct PostgreSQL migration & seeder runner
│   └── seed.js           # Supabase REST API JavaScript seeder
├── config/
│   └── supabase.js       # Backend Supabase client helper
├── package.json          # Standalone backend package configuration
└── README.md             # Backend documentation (this file)
```

---

## Database Tables

The database schema supports the complete portfolio content lifecycle:

1. `public.profile` — Personal branding, headline, hero summaries, avatar/socials, and contact endpoints.
2. `public.about` — Profile paragraphs, academic degree, institution, and CGPA.
3. `public.projects` — All featured projects with slug, title, description, tech stack array, GitHub URL, live URL, and ordering.
4. `public.skills` — Categorized skills (AI/ML, Web, Cloud/DevOps, Languages) with display order.
5. `public.experiences` — Professional internships with organization, focus, and responsibilities.
6. `public.achievements` — Competitions, hackathons (SIH 2025), and leadership roles.
7. `public.education` — Academic foundation details.
8. `public.certifications` — Credentials and certifications (Infosys Springboard, Kaggle Agentic AI, Azure, ServiceNow).
9. `public.social_links` — Public profiles (GitHub, LinkedIn, Email).
10. `public.portfolio_settings` — Site metadata and theme toggles.
11. `public.resume_metadata` — Resume versioning, storage URL, and active flag.

---

## Row Level Security (RLS)

- **Public Visitors (Anonymous)**: Allowed read access (`SELECT`) to published portfolio content (`is_published = true` or public profile/about/settings).
- **Authenticated Admin**: Allowed full CRUD access (`INSERT`, `UPDATE`, `DELETE`) to manage all portfolio data.

---

## Migration & Seeding

To run the migration and seed the live database:

```bash
# From workspace root:
npm run db:migrate

# Or directly:
node backend/scripts/migrate.js
```
