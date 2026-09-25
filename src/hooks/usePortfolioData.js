import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  personalInfo as fallbackPersonalInfo,
  aboutData as fallbackAboutData,
  skillsCategories as fallbackSkillsCategories,
  selectedProjects as fallbackProjects,
  experienceData as fallbackExperienceData
} from '../data/portfolioData';

/**
 * Resilient Portfolio Data Hook
 * Pulls dynamic content from Supabase when configured;
 * transparently falls back to hardcoded data with zero downtime or layout shift.
 */
export function usePortfolioData() {
  const [data, setData] = useState({
    profile: fallbackPersonalInfo,
    about: fallbackAboutData,
    skills: fallbackSkillsCategories,
    projects: fallbackProjects,
    experiences: fallbackExperienceData.internships,
    achievements: fallbackExperienceData.achievements,
    education: fallbackExperienceData.education,
    certifications: [],
    resumeUrl: fallbackPersonalInfo.resume,
    isLive: false,
    loading: isSupabaseConfigured
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let isMounted = true;

    async function fetchPortfolioData() {
      try {
        const [
          profileRes,
          aboutRes,
          projectsRes,
          skillsRes,
          experiencesRes,
          achievementsRes,
          educationRes,
          certificationsRes,
          resumeRes
        ] = await Promise.allSettled([
          supabase.from('profile').select('*').limit(1).maybeSingle(),
          supabase.from('about').select('*').limit(1).maybeSingle(),
          supabase.from('projects').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('skills').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('experiences').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('achievements').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('education').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('certifications').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('resume_metadata').select('*').eq('is_active', true).limit(1).maybeSingle()
        ]);

        if (!isMounted) return;

        setData((prev) => {
          // Format profile
          const p = profileRes.status === 'fulfilled' && profileRes.value.data;
          const profile = p
            ? {
                name: p.full_name || prev.profile.name,
                brandName: p.brand_name || 'MAZAHAR',
                title: p.title || prev.profile.title,
                eyebrow: p.eyebrow || prev.profile.eyebrow,
                headline: p.headline || prev.profile.headline,
                summary: p.summary || prev.profile.summary,
                email: p.email || prev.profile.email,
                gmailComposeUrl: p.gmail_compose_url || prev.profile.gmailComposeUrl,
                github: p.github_url || prev.profile.github,
                linkedin: p.linkedin_url || prev.profile.linkedin,
                resume: p.resume_url || prev.profile.resume
              }
            : prev.profile;

          // Format about
          const a = aboutRes.status === 'fulfilled' && aboutRes.value.data;
          const about = a
            ? {
                title: a.title || prev.about.title,
                paragraphs: a.paragraphs?.length ? a.paragraphs : prev.about.paragraphs,
                academic: {
                  degree: a.academic_degree || prev.about.academic.degree,
                  institution: a.academic_institution || prev.about.academic.institution,
                  cgpa: a.academic_cgpa || prev.about.academic.cgpa
                }
              }
            : prev.about;

          // Format projects
          const proj = projectsRes.status === 'fulfilled' && projectsRes.value.data;
          const projects = proj?.length
            ? proj.map((item) => ({
                num: item.num,
                id: item.slug,
                title: item.title,
                description: item.description,
                technologies: item.technologies || [],
                githubUrl: item.github_url,
                liveUrl: item.live_url,
                previewType: item.preview_type || 'workbench'
              }))
            : prev.projects;

          // Format skills
          const sk = skillsRes.status === 'fulfilled' && skillsRes.value.data;
          const skills = sk?.length
            ? sk.map((item) => ({
                category: item.category,
                skills: item.skills || []
              }))
            : prev.skills;

          // Format experiences
          const exp = experiencesRes.status === 'fulfilled' && experiencesRes.value.data;
          const experiences = exp?.length ? exp : prev.experiences;

          // Format achievements
          const ach = achievementsRes.status === 'fulfilled' && achievementsRes.value.data;
          const achievements = ach?.length ? ach : prev.achievements;

          // Format education
          const edu = educationRes.status === 'fulfilled' && educationRes.value.data;
          const education = edu?.length ? edu : prev.education;

          // Format certifications
          const cert = certificationsRes.status === 'fulfilled' && certificationsRes.value.data;
          const certifications = cert?.length ? cert : [];

          // Format resume URL
          const r = resumeRes.status === 'fulfilled' && resumeRes.value.data;
          const resumeUrl = r?.file_url || profile.resume || '/resume.pdf';

          return {
            profile,
            about,
            projects,
            skills,
            experiences,
            achievements,
            education,
            certifications,
            resumeUrl,
            isLive: Boolean(p || proj?.length),
            loading: false
          };
        });
      } catch (err) {
        console.warn('Supabase fetch failed; seamlessly using static fallback data:', err);
        if (isMounted) {
          setData((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    fetchPortfolioData();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
