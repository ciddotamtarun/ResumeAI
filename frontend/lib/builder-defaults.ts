import { ResumeBuilderData, ResumeData, SectionKey } from '@/types/builder';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'summary',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'achievements',
  'awards',
  'volunteer',
  'languages',
  'coursework',
];

export const DEFAULT_ENABLED_SECTIONS: Record<SectionKey, boolean> = {
  summary: true,
  experience: true,
  projects: true,
  skills: true,
  education: true,
  certifications: true,
  achievements: true,
  awards: false,
  volunteer: false,
  languages: true,
  coursework: false,
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

type DataRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is DataRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): DataRecord => (isRecord(value) ? value : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

function normalizeStringArray(value: unknown): string[] {
  if (typeof value === 'string') return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  return asArray(value).filter((item): item is string => typeof item === 'string');
}

function normalizeEntries<T>(
  value: unknown,
  mapper: (entry: DataRecord, index: number) => T
): T[] {
  return asArray(value).flatMap((entry, index) => (isRecord(entry) ? [mapper(entry, index)] : []));
}

function normalizeSkillList(value: unknown, kind: 'technical' | 'soft') {
  return asArray(value).flatMap((item, index) => {
    if (typeof item === 'string') {
      return [{ id: `${kind}-${index}`, name: item }];
    }
    if (!isRecord(item)) return [];

    const level = item.level;
    const skill = {
      id: asString(item.id, `${kind}-${index}`),
      name: asString(item.name),
    };
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced' || level === 'Expert') {
      return [{ ...skill, level }];
    }
    return [skill];
  });
}

function additionalValue(additional: DataRecord, root: DataRecord, key: string): unknown {
  return additional[key] ?? root[key];
}

export function normalizeResumeData(value: unknown): ResumeData {
  const source = asRecord(value);
  const additional = asRecord(source.additional);
  const personalInfo = asRecord(source.personalInfo ?? source.contact);
  const enabledSections = asRecord(additional.enabledSections ?? source.enabledSections);
  const sectionKeys = new Set<string>(DEFAULT_SECTION_ORDER);
  const requestedOrder = asArray(source.sectionOrder).filter(
    (key): key is SectionKey => typeof key === 'string' && sectionKeys.has(key)
  );
  const sectionOrder = [...new Set(requestedOrder)];
  for (const section of DEFAULT_SECTION_ORDER) {
    if (!sectionOrder.includes(section)) sectionOrder.push(section);
  }
  const sectionEnabled = (key: SectionKey) =>
    typeof enabledSections[key] === 'boolean' ? enabledSections[key] : DEFAULT_ENABLED_SECTIONS[key];
  const stringArray = (key: string) => normalizeStringArray(additionalValue(additional, source, key));
  const skills = asRecord(source.skills);

  return {
    personalInfo: {
      fullName: asString(personalInfo.fullName),
      jobTitle: asString(personalInfo.jobTitle),
      email: asString(personalInfo.email),
      phone: asString(personalInfo.phone),
      location: asString(personalInfo.location),
      linkedin: asString(personalInfo.linkedin),
      github: asString(personalInfo.github),
      website: asString(personalInfo.website),
    },
    summary: asString(source.summary),
    education: normalizeEntries(source.education, (entry, index) => ({
      id: asString(entry.id, `education-${index}`),
      institution: asString(entry.institution),
      degree: asString(entry.degree),
      fieldOfStudy: asString(entry.fieldOfStudy),
      startDate: asString(entry.startDate),
      endDate: asString(entry.endDate),
      current: typeof entry.current === 'boolean' ? entry.current : false,
      gpa: asString(entry.gpa),
      description: asString(entry.description),
    })),
    experience: normalizeEntries(source.experience, (entry, index) => ({
      id: asString(entry.id, `experience-${index}`),
      title: asString(entry.title ?? entry.jobTitle),
      company: asString(entry.company),
      employmentType: asString(entry.employmentType),
      location: asString(entry.location),
      startDate: asString(entry.startDate),
      endDate: asString(entry.endDate),
      current: typeof entry.current === 'boolean' ? entry.current : false,
      bullets: normalizeStringArray(entry.bullets),
    })),
    projects: normalizeEntries(source.projects, (entry, index) => ({
      id: asString(entry.id, `project-${index}`),
      title: asString(entry.title),
      description: asString(entry.description),
      technologies: normalizeStringArray(entry.technologies),
      projectUrl: asString(entry.projectUrl),
      githubUrl: asString(entry.githubUrl),
      bullets: normalizeStringArray(entry.bullets),
    })),
    skills: {
      technical: normalizeSkillList(skills.technical, 'technical'),
      soft: normalizeSkillList(skills.soft, 'soft'),
    },
    additional: {
      certifications: normalizeEntries(additionalValue(additional, source, 'certifications'), (entry, index) => ({
        id: asString(entry.id, `certification-${index}`),
        name: asString(entry.name),
        issuer: asString(entry.issuer),
        date: asString(entry.date),
        url: asString(entry.url),
      })),
      achievements: normalizeEntries(additionalValue(additional, source, 'achievements'), (entry, index) => ({
        id: asString(entry.id, `achievement-${index}`),
        title: asString(entry.title),
        description: asString(entry.description),
        date: asString(entry.date),
      })),
      awards: normalizeEntries(additionalValue(additional, source, 'awards'), (entry, index) => ({
        id: asString(entry.id, `award-${index}`),
        title: asString(entry.title),
        issuer: asString(entry.issuer),
        date: asString(entry.date),
        description: asString(entry.description),
      })),
      coursework: stringArray('coursework'),
      volunteer: normalizeEntries(additionalValue(additional, source, 'volunteer'), (entry, index) => ({
        id: asString(entry.id, `volunteer-${index}`),
        role: asString(entry.role),
        organization: asString(entry.organization),
        startDate: asString(entry.startDate),
        endDate: asString(entry.endDate),
        current: typeof entry.current === 'boolean' ? entry.current : false,
        description: asString(entry.description),
      })),
      languages: normalizeEntries(additionalValue(additional, source, 'languages'), (entry, index) => {
        return {
          id: asString(entry.id, `language-${index}`),
          language: asString(entry.language),
          proficiency: asString(entry.proficiency, 'Conversational'),
        };
      }),
      enabledSections: {
        certifications: sectionEnabled('certifications'),
        achievements: sectionEnabled('achievements'),
        awards: sectionEnabled('awards'),
        coursework: sectionEnabled('coursework'),
        volunteer: sectionEnabled('volunteer'),
        languages: sectionEnabled('languages'),
      },
    },
    sectionOrder,
  };
}

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
export function resumeToPlainText(value: unknown): string {
  const data = normalizeResumeData(value);
  const parts: string[] = [];
  const contact = data.personalInfo;
  const legacyEnabledSections = asRecord(asRecord(value).enabledSections);

  // Header / Contact
  const name = contact.fullName.trim() || 'Candidate';
  const title = contact.jobTitle ? `\n${contact.jobTitle}` : '';
  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.website,
  ].filter(Boolean);

  parts.push(`${name.toUpperCase()}${title}\n${contactItems.join(' | ')}`);

  // Order based sections
  for (const section of data.sectionOrder) {
    if (legacyEnabledSections[section] === false) continue;
    if (
      ['certifications', 'achievements', 'awards', 'volunteer', 'languages', 'coursework'].includes(section) &&
      !data.additional.enabledSections[section as keyof typeof data.additional.enabledSections]
    ) {
      continue;
    }

    switch (section) {
      case 'summary':
        if (data.summary.trim()) {
          parts.push(`\nPROFESSIONAL SUMMARY\n${data.summary.trim()}`);
        }
        break;

      case 'experience':
        if (data.experience?.length) {
          const expText = data.experience
            .map((exp) => {
              const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
              const meta = [exp.company, exp.location, dates].filter(Boolean).join(' | ');
              const bullets = exp.bullets
                .map((bullet) => bullet.trim())
                .filter(Boolean)
                .map((bullet) => `• ${bullet}`)
                .join('\n');
              return `${exp.title}\n${meta}${bullets ? `\n${bullets}` : ''}`.trim();
            })
            .join('\n\n');
          parts.push(`\nWORK EXPERIENCE\n${expText}`);
        }
        break;

      case 'projects':
        if (data.projects?.length) {
          const projText = data.projects
            .map((p) => {
              const tech = p.technologies.length ? ` [${p.technologies.join(', ')}]` : '';
              const link = p.projectUrl || p.githubUrl ? ` (${p.projectUrl || p.githubUrl})` : '';
              const bullets = (p.bullets ?? [])
                .map((bullet) => bullet.trim())
                .filter(Boolean)
                .map((bullet) => `• ${bullet}`)
                .join('\n');
              return `${p.title}${tech}${link}\n${p.description}${bullets ? `\n${bullets}` : ''}`.trim();
            })
            .join('\n\n');
          parts.push(`\nPROJECTS\n${projText}`);
        }
        break;

      case 'skills':
        const techSkills = data.skills.technical.map((skill) => skill.name).filter(Boolean);
        const softSkills = data.skills.soft.map((skill) => skill.name).filter(Boolean);
        if (techSkills.length > 0 || softSkills.length > 0) {
          const lines: string[] = [];
          if (techSkills.length > 0) lines.push(`Technical Skills: ${techSkills.join(', ')}`);
          if (softSkills.length > 0) lines.push(`Soft Skills: ${softSkills.join(', ')}`);
          parts.push(`\nSKILLS\n${lines.join('\n')}`);
        }
        break;

      case 'education':
        if (data.education?.length) {
          const eduText = data.education
            .map((edu) => {
              const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
              const dates = [edu.startDate, edu.current ? 'Present' : edu.endDate].filter(Boolean).join(' - ');
              const gpa = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
              const desc = edu.description ? `\n${edu.description}` : '';
              return `${edu.institution}\n${degreeField}${dates ? ` | ${dates}` : ''}${gpa}${desc}`.trim();
            })
            .join('\n\n');
          parts.push(`\nEDUCATION\n${eduText}`);
        }
        break;

      case 'certifications':
        if (data.additional.certifications.length) {
          const certText = data.additional.certifications
            .map((cert) => [cert.name, cert.issuer, cert.date].filter(Boolean).join(' - '))
            .join('\n');
          parts.push(`\nCERTIFICATIONS\n${certText}`);
        }
        break;

      case 'achievements':
        if (data.additional.achievements.length) {
          const achievementText = data.additional.achievements
            .map((achievement) => {
              const details = [achievement.date, achievement.description].filter(Boolean).join(' — ');
              return `${achievement.title}${details ? `\n${details}` : ''}`.trim();
            })
            .join('\n');
          parts.push(`\nKEY ACHIEVEMENTS\n${achievementText}`);
        }
        break;

      case 'awards':
        if (data.additional.awards.length) {
          const awardText = data.additional.awards
            .map((award) => {
              const details = [award.issuer, award.date].filter(Boolean).join(' - ');
              return `${award.title}${details ? ` - ${details}` : ''}${award.description ? `\n${award.description}` : ''}`;
            })
            .join('\n');
          parts.push(`\nAWARDS & HONORS\n${awardText}`);
        }
        break;

      case 'volunteer':
        if (data.additional.volunteer.length) {
          const volText = data.additional.volunteer
            .map((volunteer) => {
              const dates = [
                volunteer.startDate,
                volunteer.current ? 'Present' : volunteer.endDate,
              ].filter(Boolean).join(' - ');
              const role = [volunteer.role, volunteer.organization].filter(Boolean).join(' at ');
              return `${role}${dates ? ` (${dates})` : ''}${volunteer.description ? `\n${volunteer.description}` : ''}`;
            })
            .join('\n');
          parts.push(`\nVOLUNTEER EXPERIENCE\n${volText}`);
        }
        break;

      case 'languages':
        if (data.additional.languages.length) {
          const langText = data.additional.languages
            .map((language) =>
              language.proficiency ? `${language.language} (${language.proficiency})` : language.language
            )
            .filter(Boolean)
            .join(', ');
          parts.push(`\nLANGUAGES\n${langText}`);
        }
        break;

      case 'coursework':
        if (data.additional.coursework.length) {
          const coursework = data.additional.coursework.map((course) => course.trim()).filter(Boolean);
          if (coursework.length) parts.push(`\nRELEVANT COURSEWORK\n${coursework.join(', ')}`);
        }
        break;
    }
  }

  return parts.join('\n\n');
}
