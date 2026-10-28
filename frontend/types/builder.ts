export interface ResumeContact {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ResumeEducation {
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

export interface ResumeExperience {
  id: string;
  jobTitle: string;
  company: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface ResumeVolunteer {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description?: string;
}

export interface ResumeLanguage {
  id: string;
  language: string;
  proficiency: string; // 'Native' | 'Fluent' | 'Professional' | 'Conversational'
}

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'volunteer'
  | 'languages';

export type TemplateType = 'classic' | 'modern' | 'technical';

export interface ResumeBuilderData {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  template: TemplateType;
  sectionOrder: SectionKey[];
  enabledSections: Record<SectionKey, boolean>;
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: ResumeCertification[];
  awards: ResumeAward[];
  volunteer: ResumeVolunteer[];
  languages: ResumeLanguage[];
}

export interface ResumeDraftMeta {
  id: string;
  title: string;
  updatedAt: string;
  template: TemplateType;
  completionScore: number;
}
