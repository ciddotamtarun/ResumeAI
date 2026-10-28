import { ResumeBuilderData, SectionKey } from '@/types/builder';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'summary',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'awards',
  'volunteer',
  'languages',
];

export const DEFAULT_ENABLED_SECTIONS: Record<SectionKey, boolean> = {
  summary: true,
  experience: true,
  projects: true,
  skills: true,
  education: true,
  certifications: true,
  awards: false,
  volunteer: false,
  languages: true,
};

export const SAMPLE_RESUME_DATA: ResumeBuilderData = {
  id: 'draft-sample-1',
  title: 'Senior Full Stack Engineer Resume',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  template: 'modern',
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  enabledSections: { ...DEFAULT_ENABLED_SECTIONS },
  contact: {
    fullName: 'Alex Vance',
    jobTitle: 'Senior Full Stack Software Engineer',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    github: 'github.com/alexvance',
    website: 'alexvance.dev',
  },
  summary:
    'Innovative and outcome-driven Senior Full Stack Engineer with 5+ years of experience architecting high-scale distributed systems, low-latency microservices, and reactive web applications. Passionate about engineering velocity, robust API design, and intuitive user experiences.',
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'Apex Cloud Systems',
      employmentType: 'Full-time',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '',
      current: true,
      bullets: [
        'Architected and deployed high-throughput event ingestion pipelines processing 45M+ daily requests using Next.js, Node.js, and Redis.',
        'Reduced p99 server response times by 42% through query optimization, Redis tiered caching, and PostgreSQL index tuning.',
        'Mentored a cohort of 6 mid-level engineers, instilling best practices in automated CI/CD workflows and clean code architecture.',
      ],
    },
    {
      id: 'exp-2',
      jobTitle: 'Software Engineer',
      company: 'Stratosphere Technologies',
      employmentType: 'Full-time',
      location: 'Austin, TX',
      startDate: '2019-08',
      endDate: '2022-02',
      current: false,
      bullets: [
        'Engineered responsive client dashboards in React and TypeScript that improved user session duration by 28%.',
        'Implemented OAuth2 and JWT role-based access control protecting over 120,000 corporate user accounts.',
        'Collaborated with product and UX teams to launch 14 major customer-facing features on schedule.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2015-08',
      endDate: '2019-05',
      current: false,
      gpa: '3.85 / 4.0',
      description: 'Dean’s Honor List. Coursework in Distributed Systems, Algorithms, and Cloud Computing.',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevPulse — Real-Time Telemetry & Observability Suite',
      description: 'Open-source distributed microservices monitoring dashboard with real-time anomaly alerts.',
      technologies: ['TypeScript', 'Next.js', 'Go', 'Docker', 'PostgreSQL'],
      projectUrl: 'https://devpulse.io',
      githubUrl: 'https://github.com/alexvance/devpulse',
      bullets: [
        'Integrated WebSocket streaming and OpenTelemetry collectors with sub-50ms render latency.',
        'Secured 1,400+ GitHub stars and adoption by over 30 development teams.',
      ],
    },
    {
      id: 'proj-2',
      title: 'DocuQuery — AI Semantic Document Retrieval',
      description: 'Vector-search powered document question-answering tool built for engineering handbooks.',
      technologies: ['React', 'Python', 'FastAPI', 'Pinecone', 'OpenAI'],
      projectUrl: '',
      githubUrl: 'https://github.com/alexvance/docuquery',
      bullets: [
        'Implemented hybrid lexical-semantic search delivering 94% relevant answer retrieval across 10,000+ technical docs.',
      ],
    },
  ],
  skills: {
    technical: [
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'Node.js',
      'Python',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'GraphQL',
      'Docker',
      'AWS (S3, ECS, Lambda)',
      'Git / CI/CD',
      'Tailwind CSS',
    ],
    soft: [
      'Technical Leadership',
      'Cross-Functional Collaboration',
      'System Architecture',
      'Agile / Scrum',
      'Mentorship & Code Reviews',
      'Problem Solving',
    ],
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023-06',
      url: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-2',
      name: 'Professional Scrum Master (PSM I)',
      issuer: 'Scrum.org',
      date: '2022-11',
      url: '',
    },
  ],
  awards: [
    {
      id: 'award-1',
      title: 'Excellence in Engineering Award',
      issuer: 'Apex Cloud Systems',
      date: '2023-12',
      description: 'Recognized for pioneering the internal multi-tenant cache layer that saved $80k annually in cloud infrastructure.',
    },
  ],
  volunteer: [
    {
      id: 'vol-1',
      role: 'Volunteer Coding Mentor',
      organization: 'Code for the Future',
      startDate: '2021-01',
      endDate: '',
      current: true,
      description: 'Mentoring underrepresented students through foundational algorithms and web development coursework.',
    },
  ],
  languages: [
    { id: 'lang-1', language: 'English', proficiency: 'Native' },
    { id: 'lang-2', language: 'Spanish', proficiency: 'Professional' },
  ],
};

export const EMPTY_RESUME_DATA: ResumeBuilderData = {
  id: '',
  title: 'Untitled Resume',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  template: 'classic',
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  enabledSections: { ...DEFAULT_ENABLED_SECTIONS },
  contact: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
  },
  certifications: [],
  awards: [],
  volunteer: [],
  languages: [],
};

/**
 * Calculates a 0-100 completion percentage based on completeness of core resume fields
 */
export function calculateResumeScore(data: ResumeBuilderData): number {
  let score = 0;
  const max = 100;

  // Contact info (25 pts)
  if (data.contact.fullName.trim()) score += 8;
  if (data.contact.jobTitle.trim()) score += 5;
  if (data.contact.email.trim()) score += 4;
  if (data.contact.phone.trim()) score += 3;
  if (data.contact.location.trim()) score += 3;
  if (data.contact.linkedin.trim() || data.contact.github.trim()) score += 2;

  // Summary (15 pts)
  if (data.summary.trim().length > 60) score += 15;
  else if (data.summary.trim().length > 20) score += 8;

  // Experience (30 pts)
  if (data.experience.length >= 2) score += 30;
  else if (data.experience.length === 1) score += 20;

  // Education (15 pts)
  if (data.education.length >= 1) score += 15;

  // Skills (10 pts)
  if (data.skills.technical.length >= 4) score += 7;
  else if (data.skills.technical.length >= 1) score += 4;
  if (data.skills.soft.length >= 2) score += 3;

  // Projects or extras (5 pts)
  if (data.projects.length >= 1 || data.certifications.length >= 1) score += 5;

  return Math.min(max, score);
}

/**
 * Formats structured resume data into clear, standard plain text suitable for ATS analysis
 */
export function resumeToPlainText(data: ResumeBuilderData): string {
  const parts: string[] = [];

  // Header / Contact
  const name = data.contact.fullName || 'Candidate';
  const title = data.contact.jobTitle ? `\n${data.contact.jobTitle}` : '';
  const contactItems = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
    data.contact.website,
  ].filter(Boolean);

  parts.push(`${name.toUpperCase()}${title}\n${contactItems.join(' | ')}`);

  // Order based sections
  for (const section of data.sectionOrder) {
    if (!data.enabledSections[section]) continue;

    switch (section) {
      case 'summary':
        if (data.summary.trim()) {
          parts.push(`\nPROFESSIONAL SUMMARY\n${data.summary.trim()}`);
        }
        break;

      case 'experience':
        if (data.experience.length > 0) {
          const expText = data.experience
            .map((exp) => {
              const dates = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
              const meta = [exp.company, exp.location, dates].filter(Boolean).join(' | ');
              const bullets = exp.bullets
                .filter((b) => b.trim())
                .map((b) => `• ${b}`)
                .join('\n');
              return `${exp.jobTitle}\n${meta}${bullets ? `\n${bullets}` : ''}`;
            })
            .join('\n\n');
          parts.push(`\nWORK EXPERIENCE\n${expText}`);
        }
        break;

      case 'projects':
        if (data.projects.length > 0) {
          const projText = data.projects
            .map((p) => {
              const tech = p.technologies.length > 0 ? ` [${p.technologies.join(', ')}]` : '';
              const link = p.projectUrl || p.githubUrl ? ` (${p.projectUrl || p.githubUrl})` : '';
              const bullets = p.bullets
                .filter((b) => b.trim())
                .map((b) => `• ${b}`)
                .join('\n');
              return `${p.title}${tech}${link}\n${p.description}${bullets ? `\n${bullets}` : ''}`;
            })
            .join('\n\n');
          parts.push(`\nPROJECTS\n${projText}`);
        }
        break;

      case 'skills':
        const techSkills = data.skills.technical.filter(Boolean);
        const softSkills = data.skills.soft.filter(Boolean);
        if (techSkills.length > 0 || softSkills.length > 0) {
          const lines: string[] = [];
          if (techSkills.length > 0) lines.push(`Technical Skills: ${techSkills.join(', ')}`);
          if (softSkills.length > 0) lines.push(`Soft Skills: ${softSkills.join(', ')}`);
          parts.push(`\nSKILLS\n${lines.join('\n')}`);
        }
        break;

      case 'education':
        if (data.education.length > 0) {
          const eduText = data.education
            .map((edu) => {
              const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
              const dates = `${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}`;
              const gpa = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
              const desc = edu.description ? `\n${edu.description}` : '';
              return `${edu.institution}\n${degreeField} | ${dates}${gpa}${desc}`;
            })
            .join('\n\n');
          parts.push(`\nEDUCATION\n${eduText}`);
        }
        break;

      case 'certifications':
        if (data.certifications.length > 0) {
          const certText = data.certifications
            .map((c) => `${c.name} - ${c.issuer} (${c.date})`)
            .join('\n');
          parts.push(`\nCERTIFICATIONS\n${certText}`);
        }
        break;

      case 'awards':
        if (data.awards.length > 0) {
          const awardText = data.awards
            .map((a) => `${a.title} - ${a.issuer} (${a.date})${a.description ? `\n${a.description}` : ''}`)
            .join('\n');
          parts.push(`\nAWARDS & HONORS\n${awardText}`);
        }
        break;

      case 'volunteer':
        if (data.volunteer.length > 0) {
          const volText = data.volunteer
            .map(
              (v) =>
                `${v.role} at ${v.organization} (${v.startDate} - ${v.current ? 'Present' : v.endDate})${
                  v.description ? `\n${v.description}` : ''
                }`
            )
            .join('\n');
          parts.push(`\nVOLUNTEER EXPERIENCE\n${volText}`);
        }
        break;

      case 'languages':
        if (data.languages.length > 0) {
          const langText = data.languages.map((l) => `${l.language} (${l.proficiency})`).join(', ');
          parts.push(`\nLANGUAGES\n${langText}`);
        }
        break;
    }
  }

  return parts.join('\n\n');
}
