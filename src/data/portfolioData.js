/**
 * Portfolio Raw Data: Sayyad Mazahar Mehadi
 * Stored independently of any UI, components, or presentation layer.
 */

export const personalInfo = {
  name: 'Sayyad Mazahar Mehadi',
  title: 'AI / LLM & Agentic Systems Engineer',
  education: 'B.Tech in Computer Science and Engineering · Lakireddy Balireddy College of Engineering (CGPA: 8.5)',
  focus: ['AI / ML / LLMs', 'Autonomous Agent Architectures', 'Full-Stack Systems', 'High-Performance Web Applications'],
  email: 'mazaharmazahar504@gmail.com',
  gmailComposeUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=mazaharmazahar504@gmail.com&su=${encodeURIComponent("Let's Talk").replace(/'/g, '%27')}`,
  github: 'https://github.com/sdmazaharmehadi7',
  linkedin: 'https://www.linkedin.com/in/sayyad-mazahar-mehadi/',
  resume: '/resume.pdf',
  summary: 'Computer Science student focused on AI agents, LLM applications, RAG systems, and modern full-stack development.'
};

export const contactUrls = {
  email: personalInfo.email,
  gmailCompose: personalInfo.gmailComposeUrl
};

export const aboutData = {
  title: 'About',
  paragraphs: [
    "I'm a Computer Science undergraduate focused on AI agents, LLM applications, RAG systems, and full-stack development.",
    "I enjoy turning emerging AI technologies and research ideas into practical software products."
  ],
  academic: {
    degree: 'B.Tech in Computer Science and Engineering',
    institution: 'Lakireddy Balireddy College of Engineering',
    cgpa: '8.5'
  }
};

export const skillsCategories = [
  {
    category: 'Languages',
    skills: ['C', 'C++', 'Python', 'Java', 'JavaScript']
  },
  {
    category: 'AI',
    skills: ['LLMs', 'AI Agents', 'Agentic AI', 'RAG', 'Machine Learning']
  },
  {
    category: 'Development',
    skills: ['React', 'Node.js', 'Express', 'REST APIs', 'MongoDB', 'PostgreSQL']
  },
  {
    category: 'Cloud & Tools',
    skills: ['Oracle Cloud', 'Microsoft Azure', 'Git', 'Docker', 'Qdrant']
  }
];

export const selectedProjects = [
  {
    num: '01',
    id: 'sovereign-ai-workbench',
    title: 'Sovereign AI Workbench',
    description: 'Offline/on-premise agentic AI workbench for confidential industrial documents using local open-weight models, RAG, Qdrant and multimodal processing.',
    technologies: ['Local LLMs', 'Ollama', 'Qdrant', 'RAG', 'Multimodal', 'Python', 'React'],
    githubUrl: 'https://github.com/sdmazaharmehadi7',
    liveUrl: null,
    previewType: 'workbench'
  },
  {
    num: '02',
    id: 'salesgenie-ai',
    title: 'SalesGenie AI',
    description: 'AI-powered sales forecasting and lead management platform using predictive analytics and full-stack technologies.',
    technologies: ['Predictive Analytics', 'Machine Learning', 'Full-Stack', 'Python', 'Next.js', 'PostgreSQL'],
    githubUrl: 'https://github.com/sdmazaharmehadi7/local_llm_chatbot',
    liveUrl: 'https://sales-genie-ai.vercel.app/login',
    previewType: 'forecast'
  },
  {
    num: '03',
    id: 'personal-ai-agent',
    title: 'Personal AI Agent',
    description: 'A personal AI agent designed to reason through tasks and use tools.',
    technologies: ['Agentic AI', 'Tool Calling', 'ReAct Loop', 'Python', 'LangChain', 'MCP'],
    githubUrl: 'https://github.com/sdmazaharmehadi7/Personal_Ai_Agent',
    liveUrl: null,
    previewType: 'agent'
  },
  {
    num: '04',
    id: 'mazzchat',
    title: 'MazzChat',
    description: 'Modern full-stack chat application.',
    technologies: ['React', 'Node.js', 'WebSockets', 'MongoDB', 'Tailwind CSS'],
    githubUrl: 'https://github.com/sdmazaharmehadi7/MazzChat',
    liveUrl: 'https://mazz-chat.vercel.app/login',
    previewType: 'chat'
  },
  {
    num: '05',
    id: 'get-me-a-chai',
    title: 'Get Me a Chai',
    description: 'Creator-support platform with Razorpay payment integration.',
    technologies: ['Next.js', 'Razorpay API', 'Authentication', 'Tailwind CSS', 'Full-Stack'],
    githubUrl: 'https://github.com/sdmazaharmehadi7/Patreon-Clone',
    liveUrl: 'https://get-me-a-chai-mocha-nine.vercel.app/',
    previewType: 'payment'
  },
  {
    num: '06',
    id: 'password-manager',
    title: 'Password Manager',
    description: 'Simple password management application with a minimal user experience.',
    technologies: ['React', 'Client-side Encryption', 'Minimal UX', 'LocalStorage', 'Auth'],
    githubUrl: 'https://github.com/sdmazaharmehadi7/Personal_Password_Manager',
    liveUrl: 'https://password-manager-woad-three.vercel.app/',
    previewType: 'security'
  }
];

export const experienceData = {
  internships: [
    {
      period: 'Internship',
      title: 'Infosys Springboard Internship 7.0',
      organization: 'Infosys Springboard',
      focus: 'Artificial Intelligence / AI',
      description: 'AI-focused internship experience centered on artificial intelligence, model fundamentals, and practical AI applications.'
    },
    {
      period: 'Internship',
      title: 'Java Programmer Intern',
      organization: 'ConquerE-Learning',
      focus: 'Software Development',
      description: 'Focused on Java programming, object-oriented design, and core software development practices.'
    },
    {
      period: 'Internship',
      title: 'Microsoft Azure Intern',
      organization: 'AICTE Emerging Technologies',
      focus: 'Cloud Technologies',
      description: 'Focused on Microsoft Azure cloud services, infrastructure management, and emerging cloud technologies.'
    },
    {
      period: 'Internship',
      title: 'ServiceNow Virtual Intern',
      organization: 'SmartBridge & AICTE',
      focus: 'Enterprise Technology',
      description: 'Focused on ServiceNow enterprise platforms, workflows, and cloud-based business technology.'
    }
  ],
  achievements: [
    {
      period: 'Hackathon',
      title: 'Smart India Hackathon (SIH) 2025',
      organization: 'National Level Innovation Hackathon',
      description: 'Selected participant in national hackathon addressing real-world problem statements through software innovation.'
    },
    {
      period: 'Program',
      title: 'Kaggle 5-Day Agentic AI Program',
      organization: 'Kaggle',
      description: 'Completed comprehensive agentic workflows track, including the Day Planner Agent capstone project.'
    },
    {
      period: 'Leadership',
      title: 'Laksya Technical Event Coordinator',
      organization: 'Lakireddy Balireddy College of Engineering',
      description: 'Coordinated technical symposium events, workshops, and competitive engineering activities.'
    }
  ],
  education: [
    {
      period: 'B.Tech',
      title: 'B.Tech in Computer Science and Engineering',
      organization: 'Lakireddy Balireddy College of Engineering',
      description: 'Undergraduate engineering studies with a strong foundation in algorithms, systems, and artificial intelligence.',
      score: 'CGPA: 8.5'
    }
  ]
};

// Backwards compatibility alias
export const skillsData = skillsCategories.map(s => ({ category: s.category, items: s.skills }));
export const projectsData = selectedProjects;
