-- ==============================================================================
-- Portfolio Seed Data (Idempotent)
-- Source of Truth: Existing Portfolio Website for Sayyad Mazahar Mehadi
-- ==============================================================================

-- 1. Profile Table (Single active profile)
insert into public.profile (
  id,
  full_name,
  brand_name,
  title,
  eyebrow,
  headline,
  summary,
  email,
  gmail_compose_url,
  github_url,
  linkedin_url,
  resume_url,
  footer_location,
  footer_tagline
) values (
  '00000000-0000-0000-0000-000000000001',
  'Sayyad Mazahar Mehadi',
  'MAZAHAR',
  'AI / LLM & Agentic Systems Engineer',
  'AI • FULL-STACK • AGENTIC SYSTEMS',
  'Building intelligent
software for the
real world.',
  'Computer Science student focused on AI agents, LLM applications, RAG systems, and modern full-stack development.',
  'mazaharmazahar504@gmail.com',
  'https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk',
  'https://github.com/sdmazaharmehadi7',
  'https://www.linkedin.com/in/sayyad-mazahar-mehadi/',
  '/resume.pdf',
  'Bengaluru / Online',
  'Monochrome Technical Edition'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  brand_name = excluded.brand_name,
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  headline = excluded.headline,
  summary = excluded.summary,
  email = excluded.email,
  gmail_compose_url = excluded.gmail_compose_url,
  github_url = excluded.github_url,
  linkedin_url = excluded.linkedin_url,
  resume_url = excluded.resume_url,
  footer_location = excluded.footer_location,
  footer_tagline = excluded.footer_tagline,
  updated_at = now();

-- 2. About Table
insert into public.about (
  id,
  tag,
  title,
  paragraphs,
  academic_degree,
  academic_institution,
  academic_cgpa
) values (
  '00000000-0000-0000-0000-000000000002',
  '// PROFILE // BACKGROUND',
  'About',
  array[
    'I''m a Computer Science undergraduate focused on AI agents, LLM applications, RAG systems, and full-stack development.',
    'I enjoy turning emerging AI technologies and research ideas into practical software products.'
  ],
  'B.Tech in Computer Science and Engineering',
  'Lakireddy Balireddy College of Engineering',
  '8.5'
)
on conflict (id) do update set
  tag = excluded.tag,
  title = excluded.title,
  paragraphs = excluded.paragraphs,
  academic_degree = excluded.academic_degree,
  academic_institution = excluded.academic_institution,
  academic_cgpa = excluded.academic_cgpa,
  updated_at = now();

-- 3. Projects Table (All 6 Visible Selected Projects)
insert into public.projects (
  slug,
  num,
  title,
  description,
  technologies,
  github_url,
  live_url,
  preview_type,
  image_url,
  display_order,
  is_featured,
  is_published
) values
(
  'sovereign-ai-workbench',
  '01',
  'Sovereign AI Workbench',
  'Offline/on-premise agentic AI workbench for confidential industrial documents using local open-weight models, RAG, Qdrant and multimodal processing.',
  array['Local LLMs', 'Ollama', 'Qdrant', 'RAG', 'Multimodal', 'Python', 'React'],
  'https://github.com/sdmazaharmehadi7',
  null,
  'workbench',
  null,
  1,
  true,
  true
),
(
  'salesgenie-ai',
  '02',
  'SalesGenie AI',
  'AI-powered sales forecasting and lead management platform using predictive analytics and full-stack technologies.',
  array['Predictive Analytics', 'Machine Learning', 'Full-Stack', 'Python', 'Next.js', 'PostgreSQL'],
  'https://github.com/sdmazaharmehadi7/local_llm_chatbot',
  'https://sales-genie-ai.vercel.app/login',
  'forecast',
  null,
  2,
  true,
  true
),
(
  'personal-ai-agent',
  '03',
  'Personal AI Agent',
  'A personal AI agent designed to reason through tasks and use tools.',
  array['Agentic AI', 'Tool Calling', 'ReAct Loop', 'Python', 'LangChain', 'MCP'],
  'https://github.com/sdmazaharmehadi7/Personal_Ai_Agent',
  null,
  'agent',
  null,
  3,
  true,
  true
),
(
  'mazzchat',
  '04',
  'MazzChat',
  'Modern full-stack chat application.',
  array['React', 'Node.js', 'WebSockets', 'MongoDB', 'Tailwind CSS'],
  'https://github.com/sdmazaharmehadi7/MazzChat',
  'https://mazz-chat.vercel.app/login',
  'chat',
  null,
  4,
  false,
  true
),
(
  'get-me-a-chai',
  '05',
  'Get Me a Chai',
  'Creator-support platform with Razorpay payment integration.',
  array['Next.js', 'Razorpay API', 'Authentication', 'Tailwind CSS', 'Full-Stack'],
  'https://github.com/sdmazaharmehadi7/Patreon-Clone',
  'https://get-me-a-chai-mocha-nine.vercel.app/',
  'payment',
  null,
  5,
  false,
  true
),
(
  'password-manager',
  '06',
  'Password Manager',
  'Simple password management application with a minimal user experience.',
  array['React', 'Client-side Encryption', 'Minimal UX', 'LocalStorage', 'Auth'],
  'https://github.com/sdmazaharmehadi7/Personal_Password_Manager',
  'https://password-manager-woad-three.vercel.app/',
  'security',
  null,
  6,
  false,
  true
)
on conflict (slug) do update set
  num = excluded.num,
  title = excluded.title,
  description = excluded.description,
  technologies = excluded.technologies,
  github_url = excluded.github_url,
  live_url = excluded.live_url,
  preview_type = excluded.preview_type,
  image_url = excluded.image_url,
  display_order = excluded.display_order,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

-- 4. Skills Table (All 4 Categories & Items)
delete from public.skills;
insert into public.skills (category, skills, display_order, is_published)
values
  ('Languages', array['C', 'C++', 'Python', 'Java', 'JavaScript'], 1, true),
  ('AI', array['LLMs', 'AI Agents', 'Agentic AI', 'RAG', 'Machine Learning'], 2, true),
  ('Development', array['React', 'Node.js', 'Express', 'REST APIs', 'MongoDB', 'PostgreSQL'], 3, true),
  ('Cloud & Tools', array['Oracle Cloud', 'Microsoft Azure', 'Git', 'Docker', 'Qdrant'], 4, true);

-- 5. Experiences Table (All 4 Visible Internships)
delete from public.experiences;
insert into public.experiences (period, title, organization, focus, description, display_order, is_published)
values
(
  'Internship',
  'Infosys Springboard Internship 7.0',
  'Infosys Springboard',
  'Artificial Intelligence / AI',
  'AI-focused internship experience centered on artificial intelligence, model fundamentals, and practical AI applications.',
  1,
  true
),
(
  'Internship',
  'Java Programmer Intern',
  'ConquerE-Learning',
  'Software Development',
  'Focused on Java programming, object-oriented design, and core software development practices.',
  2,
  true
),
(
  'Internship',
  'Microsoft Azure Intern',
  'AICTE Emerging Technologies',
  'Cloud Technologies',
  'Focused on Microsoft Azure cloud services, infrastructure management, and emerging cloud technologies.',
  3,
  true
),
(
  'Internship',
  'ServiceNow Virtual Intern',
  'SmartBridge & AICTE',
  'Enterprise Technology',
  'Focused on ServiceNow enterprise platforms, workflows, and cloud-based business technology.',
  4,
  true
);

-- 6. Achievements Table (All 3 Visible Achievements & Competitions)
delete from public.achievements;
insert into public.achievements (period, title, organization, description, display_order, is_published)
values
(
  'Hackathon',
  'Smart India Hackathon (SIH) 2025',
  'National Level Innovation Hackathon',
  'Selected participant in national hackathon addressing real-world problem statements through software innovation.',
  1,
  true
),
(
  'Program',
  'Kaggle 5-Day Agentic AI Program',
  'Kaggle',
  'Completed comprehensive agentic workflows track, including the Day Planner Agent capstone project.',
  2,
  true
),
(
  'Leadership',
  'Laksya Technical Event Coordinator',
  'Lakireddy Balireddy College of Engineering',
  'Coordinated technical symposium events, workshops, and competitive engineering activities.',
  3,
  true
);

-- 7. Education Table (Academic Foundation)
delete from public.education;
insert into public.education (period, title, organization, score, description, display_order, is_published)
values
(
  'B.Tech',
  'B.Tech in Computer Science and Engineering',
  'Lakireddy Balireddy College of Engineering',
  'CGPA: 8.5',
  'Undergraduate engineering studies with a strong foundation in algorithms, systems, and artificial intelligence.',
  1,
  true
);

-- 8. Certifications Table (All Visible Programs & Certifications)
delete from public.certifications;
insert into public.certifications (title, issuer, issue_date, credential_url, display_order, is_published)
values
(
  'Infosys Springboard Internship 7.0 — AI Certification',
  'Infosys Springboard',
  '2025',
  'https://infyspringboard.onwingspan.com',
  1,
  true
),
(
  'Kaggle 5-Day Agentic AI Program Certificate',
  'Kaggle',
  '2025',
  'https://www.kaggle.com',
  2,
  true
),
(
  'Microsoft Azure Emerging Technologies Certificate',
  'AICTE Emerging Technologies',
  '2024',
  'https://aicte-india.org',
  3,
  true
),
(
  'ServiceNow Virtual Internship Certificate',
  'SmartBridge & AICTE',
  '2024',
  'https://smartbridge.com',
  4,
  true
);

-- 9. Social Links Table (All Visible Links)
delete from public.social_links;
insert into public.social_links (platform, label, url, is_external, display_order, is_published)
values
  ('GitHub', 'GitHub', 'https://github.com/sdmazaharmehadi7', true, 1, true),
  ('LinkedIn', 'LinkedIn', 'https://www.linkedin.com/in/sayyad-mazahar-mehadi/', true, 2, true),
  ('Email', 'Email Me', 'https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk', true, 3, true),
  ('Resume', 'Resume', '/resume.pdf', true, 4, true);

-- 10. Portfolio Settings Table (Site Configurations)
insert into public.portfolio_settings (key, value, description)
values
  (
    'site_metadata',
    '{"title": "Sayyad Mazahar Mehadi — AI / LLM & Agentic Systems", "description": "Sayyad Mazahar Mehadi — Computer Science undergraduate, AI/ML/LLM enthusiast, Full-stack developer, and Agentic AI systems engineer."}'::jsonb,
    'Site-wide meta title and SEO description'
  ),
  (
    'hero_config',
    '{"eyebrow": "AI • FULL-STACK • AGENTIC SYSTEMS", "headline": "Building intelligent\\nsoftware for the\\nreal world.", "show_vis": true, "show_work_cta": true, "show_github_cta": true}'::jsonb,
    'Hero section display configurations'
  ),
  (
    'contact_config',
    '{"email": "mazaharmazahar504@gmail.com", "gmail_compose_url": "https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk", "heading": "Let''s build something\\ninteresting.", "subtitle": "Open to internships, collaborations, AI projects,\\nand interesting engineering opportunities."}'::jsonb,
    'Contact section text and destination URLs'
  ),
  (
    'footer_config',
    '{"copyright": "© 2026 Sayyad Mazahar Mehadi", "location": "Bengaluru / Online", "edition": "Monochrome Technical Edition"}'::jsonb,
    'Footer copyright and edition tag'
  )
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  updated_at = now();

-- 11. Resume Metadata Table (Active Resume Record)
delete from public.resume_metadata;
insert into public.resume_metadata (filename, file_url, file_size, file_version, is_active)
values
  ('Sayyad_Mazahar_Mehadi_Resume.pdf', '/resume.pdf', '57 KB', '1.0.0', true);
