/**
 * Portfolio Data Seeder Script
 * Migrates existing website data into Supabase via @supabase/supabase-js
 * Usage: node scripts/seed.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read environment variables from .env or .env.local if present
function loadEnv() {
  const envPaths = ['.env', '.env.local', '.env.development'];
  for (const p of envPaths) {
    const fullPath = path.join(rootDir, p);
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

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project-id')) {
  console.log(`
ℹ️  Supabase URL or Key not set in environment or .env file.
To execute this seeder directly via JavaScript:
1. Ensure your .env file contains:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-key
2. Run: npm run db:seed

Alternatively, you can run the SQL migration directly in Supabase Dashboard SQL Editor:
  backend/db/schema.sql
  backend/db/seed.sql
`);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 Starting portfolio migration to Supabase...');

  // 1. Profile
  console.log('-> Seeding profile...');
  const { error: profileErr } = await supabase.from('profile').upsert({
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Sayyad Mazahar Mehadi',
    brand_name: 'MAZAHAR',
    title: 'AI / LLM & Agentic Systems Engineer',
    eyebrow: 'AI • FULL-STACK • AGENTIC SYSTEMS',
    headline: 'Building intelligent\nsoftware for the\nreal world.',
    summary: 'Computer Science student focused on AI agents, LLM applications, RAG systems, and modern full-stack development.',
    email: 'mazaharmazahar504@gmail.com',
    gmail_compose_url: 'https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk',
    github_url: 'https://github.com/sdmazaharmehadi7',
    linkedin_url: 'https://www.linkedin.com/in/sayyad-mazahar-mehadi/',
    resume_url: '/resume.pdf',
    footer_location: 'Bengaluru / Online',
    footer_tagline: 'Monochrome Technical Edition'
  });
  if (profileErr) console.error('Profile seed warning:', profileErr.message);

  // 2. About
  console.log('-> Seeding about...');
  const { error: aboutErr } = await supabase.from('about').upsert({
    id: '00000000-0000-0000-0000-000000000002',
    tag: '// PROFILE // BACKGROUND',
    title: 'About',
    paragraphs: [
      "I'm a Computer Science undergraduate focused on AI agents, LLM applications, RAG systems, and full-stack development.",
      "I enjoy turning emerging AI technologies and research ideas into practical software products."
    ],
    academic_degree: 'B.Tech in Computer Science and Engineering',
    academic_institution: 'Lakireddy Balireddy College of Engineering',
    academic_cgpa: '8.5'
  });
  if (aboutErr) console.error('About seed warning:', aboutErr.message);

  // 3. Projects
  console.log('-> Seeding 6 projects...');
  const projectsData = [
    {
      num: '01',
      slug: 'sovereign-ai-workbench',
      title: 'Sovereign AI Workbench',
      description: 'Offline/on-premise agentic AI workbench for confidential industrial documents using local open-weight models, RAG, Qdrant and multimodal processing.',
      technologies: ['Local LLMs', 'Ollama', 'Qdrant', 'RAG', 'Multimodal', 'Python', 'React'],
      github_url: 'https://github.com/sdmazaharmehadi7',
      live_url: null,
      preview_type: 'workbench',
      display_order: 1,
      is_featured: true,
      is_published: true
    },
    {
      num: '02',
      slug: 'salesgenie-ai',
      title: 'SalesGenie AI',
      description: 'AI-powered sales forecasting and lead management platform using predictive analytics and full-stack technologies.',
      technologies: ['Predictive Analytics', 'Machine Learning', 'Full-Stack', 'Python', 'Next.js', 'PostgreSQL'],
      github_url: 'https://github.com/sdmazaharmehadi7/local_llm_chatbot',
      live_url: 'https://sales-genie-ai.vercel.app/login',
      preview_type: 'forecast',
      display_order: 2,
      is_featured: true,
      is_published: true
    },
    {
      num: '03',
      slug: 'personal-ai-agent',
      title: 'Personal AI Agent',
      description: 'A personal AI agent designed to reason through tasks and use tools.',
      technologies: ['Agentic AI', 'Tool Calling', 'ReAct Loop', 'Python', 'LangChain', 'MCP'],
      github_url: 'https://github.com/sdmazaharmehadi7/Personal_Ai_Agent',
      live_url: null,
      preview_type: 'agent',
      display_order: 3,
      is_featured: true,
      is_published: true
    },
    {
      num: '04',
      slug: 'mazzchat',
      title: 'MazzChat',
      description: 'Modern full-stack chat application.',
      technologies: ['React', 'Node.js', 'WebSockets', 'MongoDB', 'Tailwind CSS'],
      github_url: 'https://github.com/sdmazaharmehadi7/MazzChat',
      live_url: 'https://mazz-chat.vercel.app/login',
      preview_type: 'chat',
      display_order: 4,
      is_featured: false,
      is_published: true
    },
    {
      num: '05',
      slug: 'get-me-a-chai',
      title: 'Get Me a Chai',
      description: 'Creator-support platform with Razorpay payment integration.',
      technologies: ['Next.js', 'Razorpay API', 'Authentication', 'Tailwind CSS', 'Full-Stack'],
      github_url: 'https://github.com/sdmazaharmehadi7/Patreon-Clone',
      live_url: 'https://get-me-a-chai-mocha-nine.vercel.app/',
      preview_type: 'payment',
      display_order: 5,
      is_featured: false,
      is_published: true
    },
    {
      num: '06',
      slug: 'password-manager',
      title: 'Password Manager',
      description: 'Simple password management application with a minimal user experience.',
      technologies: ['React', 'Client-side Encryption', 'Minimal UX', 'LocalStorage', 'Auth'],
      github_url: 'https://github.com/sdmazaharmehadi7/Personal_Password_Manager',
      live_url: 'https://password-manager-woad-three.vercel.app/',
      preview_type: 'security',
      display_order: 6,
      is_featured: false,
      is_published: true
    }
  ];

  for (const p of projectsData) {
    const { error } = await supabase.from('projects').upsert(p, { onConflict: 'slug' });
    if (error) console.error(`Project ${p.title} error:`, error.message);
  }

  // 4. Skills
  console.log('-> Seeding 4 skill categories...');
  const skillsData = [
    { category: 'Languages', skills: ['C', 'C++', 'Python', 'Java', 'JavaScript'], display_order: 1, is_published: true },
    { category: 'AI', skills: ['LLMs', 'AI Agents', 'Agentic AI', 'RAG', 'Machine Learning'], display_order: 2, is_published: true },
    { category: 'Development', skills: ['React', 'Node.js', 'Express', 'REST APIs', 'MongoDB', 'PostgreSQL'], display_order: 3, is_published: true },
    { category: 'Cloud & Tools', skills: ['Oracle Cloud', 'Microsoft Azure', 'Git', 'Docker', 'Qdrant'], display_order: 4, is_published: true }
  ];
  for (const s of skillsData) {
    const { error } = await supabase.from('skills').upsert(s, { onConflict: 'category' });
    if (error) console.error(`Skills ${s.category} error:`, error.message);
  }

  // 5. Experiences
  console.log('-> Seeding 4 internships...');
  const expData = [
    {
      period: 'Internship',
      title: 'Infosys Springboard Internship 7.0',
      organization: 'Infosys Springboard',
      focus: 'Artificial Intelligence / AI',
      description: 'AI-focused internship experience centered on artificial intelligence, model fundamentals, and practical AI applications.',
      display_order: 1,
      is_published: true
    },
    {
      period: 'Internship',
      title: 'Java Programmer Intern',
      organization: 'ConquerE-Learning',
      focus: 'Software Development',
      description: 'Focused on Java programming, object-oriented design, and core software development practices.',
      display_order: 2,
      is_published: true
    },
    {
      period: 'Internship',
      title: 'Microsoft Azure Intern',
      organization: 'AICTE Emerging Technologies',
      focus: 'Cloud Technologies',
      description: 'Focused on Microsoft Azure cloud services, infrastructure management, and emerging cloud technologies.',
      display_order: 3,
      is_published: true
    },
    {
      period: 'Internship',
      title: 'ServiceNow Virtual Intern',
      organization: 'SmartBridge & AICTE',
      focus: 'Enterprise Technology',
      description: 'Focused on ServiceNow enterprise platforms, workflows, and cloud-based business technology.',
      display_order: 4,
      is_published: true
    }
  ];
  for (const e of expData) {
    const { error } = await supabase.from('experiences').upsert(e, { onConflict: 'title' });
    if (error) console.error(`Experience ${e.title} error:`, error.message);
  }

  // 6. Achievements
  console.log('-> Seeding 3 achievements...');
  const achData = [
    {
      period: 'Hackathon',
      title: 'Smart India Hackathon (SIH) 2025',
      organization: 'National Level Innovation Hackathon',
      description: 'Selected participant in national hackathon addressing real-world problem statements through software innovation.',
      display_order: 1,
      is_published: true
    },
    {
      period: 'Program',
      title: 'Kaggle 5-Day Agentic AI Program',
      organization: 'Kaggle',
      description: 'Completed comprehensive agentic workflows track, including the Day Planner Agent capstone project.',
      display_order: 2,
      is_published: true
    },
    {
      period: 'Leadership',
      title: 'Laksya Technical Event Coordinator',
      organization: 'Lakireddy Balireddy College of Engineering',
      description: 'Coordinated technical symposium events, workshops, and competitive engineering activities.',
      display_order: 3,
      is_published: true
    }
  ];
  for (const a of achData) {
    const { error } = await supabase.from('achievements').upsert(a, { onConflict: 'title' });
    if (error) console.error(`Achievement ${a.title} error:`, error.message);
  }

  // 7. Education
  console.log('-> Seeding education...');
  const { error: eduErr } = await supabase.from('education').upsert({
    period: 'B.Tech',
    title: 'B.Tech in Computer Science and Engineering',
    organization: 'Lakireddy Balireddy College of Engineering',
    score: 'CGPA: 8.5',
    description: 'Undergraduate engineering studies with a strong foundation in algorithms, systems, and artificial intelligence.',
    display_order: 1,
    is_published: true
  }, { onConflict: 'title' });
  if (eduErr) console.error('Education error:', eduErr.message);

  // 8. Certifications
  console.log('-> Seeding certifications...');
  const certsData = [
    {
      title: 'Infosys Springboard Internship 7.0 — AI Certification',
      issuer: 'Infosys Springboard',
      issue_date: '2025',
      credential_url: 'https://infyspringboard.onwingspan.com',
      display_order: 1,
      is_published: true
    },
    {
      title: 'Kaggle 5-Day Agentic AI Program Certificate',
      issuer: 'Kaggle',
      issue_date: '2025',
      credential_url: 'https://www.kaggle.com',
      display_order: 2,
      is_published: true
    },
    {
      title: 'Microsoft Azure Emerging Technologies Certificate',
      issuer: 'AICTE Emerging Technologies',
      issue_date: '2024',
      credential_url: 'https://aicte-india.org',
      display_order: 3,
      is_published: true
    },
    {
      title: 'ServiceNow Virtual Internship Certificate',
      issuer: 'SmartBridge & AICTE',
      issue_date: '2024',
      credential_url: 'https://smartbridge.com',
      display_order: 4,
      is_published: true
    }
  ];
  for (const c of certsData) {
    const { error } = await supabase.from('certifications').upsert(c, { onConflict: 'title' });
    if (error) console.error(`Certification ${c.title} error:`, error.message);
  }

  // 9. Social Links
  console.log('-> Seeding social links...');
  const socialData = [
    { platform: 'GitHub', label: 'GitHub', url: 'https://github.com/sdmazaharmehadi7', is_external: true, display_order: 1, is_published: true },
    { platform: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/sayyad-mazahar-mehadi/', is_external: true, display_order: 2, is_published: true },
    { platform: 'Email', label: 'Email Me', url: 'https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk', is_external: true, display_order: 3, is_published: true },
    { platform: 'Resume', label: 'Resume', url: '/resume.pdf', is_external: true, display_order: 4, is_published: true }
  ];
  for (const sl of socialData) {
    const { error } = await supabase.from('social_links').upsert(sl, { onConflict: 'platform' });
    if (error) console.error(`Social link ${sl.platform} error:`, error.message);
  }

  // 10. Portfolio Settings
  console.log('-> Seeding portfolio settings...');
  const settingsData = [
    {
      key: 'site_metadata',
      value: {
        title: 'Sayyad Mazahar Mehadi — AI / LLM & Agentic Systems',
        description: 'Sayyad Mazahar Mehadi — Computer Science undergraduate, AI/ML/LLM enthusiast, Full-stack developer, and Agentic AI systems engineer.'
      },
      description: 'Site-wide meta title and SEO description'
    },
    {
      key: 'hero_config',
      value: {
        eyebrow: 'AI • FULL-STACK • AGENTIC SYSTEMS',
        headline: 'Building intelligent\nsoftware for the\nreal world.',
        show_vis: true,
        show_work_cta: true,
        show_github_cta: true
      },
      description: 'Hero section display configurations'
    },
    {
      key: 'contact_config',
      value: {
        email: 'mazaharmazahar504@gmail.com',
        gmail_compose_url: 'https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=Let%27s%20Talk',
        heading: "Let's build something\ninteresting.",
        subtitle: 'Open to internships, collaborations, AI projects,\nand interesting engineering opportunities.'
      },
      description: 'Contact section text and destination URLs'
    },
    {
      key: 'footer_config',
      value: {
        copyright: '© 2026 Sayyad Mazahar Mehadi',
        location: 'Bengaluru / Online',
        edition: 'Monochrome Technical Edition'
      },
      description: 'Footer copyright and edition tag'
    }
  ];
  for (const st of settingsData) {
    const { error } = await supabase.from('portfolio_settings').upsert(st, { onConflict: 'key' });
    if (error) console.error(`Setting ${st.key} error:`, error.message);
  }

  // 11. Resume Metadata
  console.log('-> Seeding resume metadata...');
  const { error: resErr } = await supabase.from('resume_metadata').upsert({
    filename: 'Sayyad_Mazahar_Mehadi_Resume.pdf',
    file_url: '/resume.pdf',
    file_size: '57 KB',
    file_version: '1.0.0',
    is_active: true
  });
  if (resErr) console.error('Resume metadata error:', resErr.message);

  console.log('✅ Seeding complete! All portfolio content successfully staged.');
}

seed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
