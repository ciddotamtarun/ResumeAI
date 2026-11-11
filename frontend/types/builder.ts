export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  gpa?: string;
  description?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  jobTitle?: string;
  company: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  bullets?: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface SkillsData {
  technical: SkillItem[];
  soft: SkillItem[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

export interface VolunteerEntry {
  id: string;
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface AdditionalSections {
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  awards: AwardEntry[];
  coursework: string[];
  volunteer: VolunteerEntry[];
  languages: LanguageEntry[];
  enabledSections: {
    certifications: boolean;
    achievements: boolean;
    awards: boolean;
    coursework: boolean;
    volunteer: boolean;
    languages: boolean;
  };
}

export type TemplateType = 'classic' | 'modern' | 'technical';

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'achievements'
  | 'awards'
  | 'languages'
  | 'volunteer'
  | 'coursework';

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillsData;
  additional: AdditionalSections;
  sectionOrder: SectionKey[];
}

export interface ResumeDraft {
  _id: string;
  userId?: string;
  title: string;
  targetRole?: string;
  template: TemplateType;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

// Compatibility Aliases
export type ResumeContact = PersonalInfo;
export type ResumeEducation = EducationEntry;
export type ResumeExperience = ExperienceEntry;
export type ResumeProject = ProjectEntry;
export type ResumeCertification = CertificationEntry;
export interface ResumeAward {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}
export interface ResumeVolunteer {
  id: string;
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}
export interface ResumeLanguage {
  id: string;
  language: string;
  proficiency: string;
}

export interface LegacyResumeBuilderData {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  template: TemplateType;
  sectionOrder: SectionKey[];
  enabledSections: Partial<Record<SectionKey, boolean>>;
  contact: PersonalInfo;
  summary: string;
  experience: Array<{
    id: string;
    jobTitle: string;
    company: string;
    employmentType?: string;
    location?: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    gpa?: string;
    description?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    projectUrl?: string;
    githubUrl?: string;
    bullets?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: CertificationEntry[];
  awards: ResumeAward[];
  volunteer: ResumeVolunteer[];
  languages: ResumeLanguage[];
  achievements?: AchievementEntry[];
  coursework?: string[];
}
export type ResumeBuilderData = LegacyResumeBuilderData;
export type ResumeDraftMeta = ResumeDraft;

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 345-6789',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    website: 'alexmorgan.dev',
  },
  summary:
    'Results-driven Full Stack Engineer with 5+ years of experience engineering scalable microservices and intuitive cloud interfaces. Proven record of optimizing web applications for high availability, reducing latency, and collaborating with cross-functional teams to deliver exceptional user value.',
  education: [
    {
      id: 'edu_1',
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startDate: 'Aug 2016',
      endDate: 'May 2020',
      gpa: '3.82 / 4.00',
      description: 'Dean’s Honors List, President of Software Engineering Society.',
    },
  ],
  experience: [
    {
      id: 'exp_1',
      title: 'Senior Software Engineer',
      company: 'CloudPulse Technologies',
      employmentType: 'Full-time',
      location: 'San Francisco, CA',
      startDate: 'Jun 2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Spearheaded migration of monolithic Rails backend to decoupled Go and Node.js microservices, cutting server latency by 38%.',
        'Architected real-time analytics dashboard with React, Next.js, and WebSocket streams servicing 500,000+ daily active users.',
        'Mentored 6 junior and mid-level engineers in test-driven development, code review best practices, and distributed systems architecture.',
      ],
    },
    {
      id: 'exp_2',
      title: 'Software Engineer',
      company: 'Apex Data Labs',
      employmentType: 'Full-time',
      location: 'San Jose, CA',
      startDate: 'Jul 2020',
      endDate: 'May 2022',
      current: false,
      bullets: [
        'Designed and maintained 15+ RESTful and GraphQL endpoints consumed by web and mobile client applications.',
        'Automated CI/CD pipelines using GitHub Actions and Docker, reducing build-to-deployment cycle time from 45 to 8 minutes.',
        'Engineered caching layer using Redis, mitigating database connection spikes during peak traffic bursts by 60%.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'AI Resume & Career Accelerator',
      description: 'An intelligent platform providing real-time ATS feedback, resume generation, and mock technical interview simulations.',
      technologies: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'OpenRouter API'],
      projectUrl: 'https://elevateai.example.com',
      githubUrl: 'https://github.com/alexmorgan/elevate-ai',
      bullets: [
        'Built full A4 live document rendering with dynamic template engine and multi-page export support.',
        'Integrated asynchronous AI assessment scoring pipeline evaluating candidate skill competencies.',
      ],
    },
    {
      id: 'proj_2',
      title: 'Distributed Distributed Job Queue',
      description: 'Fault-tolerant background task orchestration worker cluster with at-least-once delivery guarantees.',
      technologies: ['Go', 'Redis', 'PostgreSQL', 'Docker', 'Prometheus'],
      githubUrl: 'https://github.com/alexmorgan/distributed-queue',
      bullets: [
        'Handled 20,000 tasks/second with graceful failover, dead-letter queuing, and exponential backoff retries.',
      ],
    },
  ],
  skills: {
    technical: [
      { id: 'sk_1', name: 'TypeScript', level: 'Expert' },
      { id: 'sk_2', name: 'React & Next.js', level: 'Expert' },
      { id: 'sk_3', name: 'Node.js / Express', level: 'Advanced' },
      { id: 'sk_4', name: 'Python', level: 'Advanced' },
      { id: 'sk_5', name: 'Go', level: 'Intermediate' },
      { id: 'sk_6', name: 'PostgreSQL & MongoDB', level: 'Advanced' },
      { id: 'sk_7', name: 'Docker & Kubernetes', level: 'Intermediate' },
      { id: 'sk_8', name: 'REST & GraphQL APIs', level: 'Expert' },
      { id: 'sk_9', name: 'CI/CD & Git', level: 'Expert' },
    ],
    soft: [
      { id: 'sk_10', name: 'Cross-functional Collaboration' },
      { id: 'sk_11', name: 'System Design & Architecture' },
      { id: 'sk_12', name: 'Agile / Scrum Leadership' },
      { id: 'sk_13', name: 'Mentorship & Code Review' },
    ],
  },
  additional: {
    certifications: [
      {
        id: 'cert_1',
        name: 'AWS Certified Solutions Architect - Associate',
        issuer: 'Amazon Web Services',
        date: '2023',
        url: 'https://aws.amazon.com',
      },
    ],
    achievements: [
      {
        id: 'ach_1',
        title: 'Outstanding Engineering Impact Award',
        description: 'Awarded for eliminating critical database bottlenecks ahead of major product launch.',
        date: '2023',
      },
    ],
    awards: [
      {
        id: 'awd_1',
        title: '1st Place Hackathon Winner',
        issuer: 'CalHacks 2019',
        date: '2019',
      },
    ],
    coursework: ['Data Structures & Algorithms', 'Operating Systems', 'Database Systems', 'Distributed Computing'],
    volunteer: [
      {
        id: 'vol_1',
        role: 'Technical Mentor',
        organization: 'Girls Who Code',
        startDate: '2021',
        endDate: 'Present',
        description: 'Taught fundamentals of web development and algorithms to high school students.',
      },
    ],
    languages: [
      { id: 'lang_1', language: 'English', proficiency: 'Native / Bilingual' },
      { id: 'lang_2', language: 'Spanish', proficiency: 'Conversational' },
    ],
    enabledSections: {
      certifications: true,
      achievements: true,
      awards: false,
      coursework: false,
      volunteer: false,
      languages: true,
    },
  },
  sectionOrder: [
    'summary',
    'experience',
    'projects',
    'education',
    'skills',
    'certifications',
    'achievements',
    'languages',
    'awards',
    'volunteer',
    'coursework',
  ],
};

export const EMPTY_RESUME_DATA: ResumeData = {
  personalInfo: {
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
  education: [],
  experience: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
  },
  additional: {
    certifications: [],
    achievements: [],
    awards: [],
    coursework: [],
    volunteer: [],
    languages: [],
    enabledSections: {
      certifications: false,
      achievements: false,
      awards: false,
      coursework: false,
      volunteer: false,
      languages: false,
    },
  },
  sectionOrder: [
    'summary',
    'experience',
    'projects',
    'education',
    'skills',
    'certifications',
    'achievements',
    'languages',
    'awards',
    'volunteer',
    'coursework',
  ],
};
