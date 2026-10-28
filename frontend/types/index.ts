export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface SectionAnalysis {
  score: number;
  feedback: string[];
}

export interface ResumeAnalysis {
  overallScore: number;
  sections: {
    contact: SectionAnalysis;
    summary: SectionAnalysis;
    experience: SectionAnalysis;
    education: SectionAnalysis;
    skills: SectionAnalysis;
    formatting: SectionAnalysis;
  };
  strengths: string[];
  improvements: string[];
  keywords: string[];
  atsCompatibility: number;
}

export interface ResumeImprovement {
  section: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface Resume {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  analysis: ResumeAnalysis;
  improvements: ResumeImprovement[];
  aiProvider: 'openai' | 'gemini';
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
}

export interface InterviewResults {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  behavioralScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
}

export interface Interview {
  _id: string;
  userId: string;
  resumeId: string | { _id: string; fileName: string; createdAt: string };
  status: 'in_progress' | 'completed';
  messages: InterviewMessage[];
  finalResults?: InterviewResults;
  aiProvider: 'openai' | 'gemini';
  createdAt: string;
  updatedAt: string;
}

export type AIProvider = 'openai' | 'gemini';
