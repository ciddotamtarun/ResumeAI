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
  targetRole?: string;
  rawText?: string;
  analysis: ResumeAnalysis;
  improvements: ResumeImprovement[];
  aiProvider: 'openai' | 'gemini';
  createdAt: string;
  updatedAt: string;
}

export type InterviewCategory = 'mixed' | 'technical' | 'hr' | 'behavioral';
export type InterviewDifficulty = 'easy' | 'medium' | 'difficult';

export interface InterviewerProfile {
  id: 'female' | 'male';
  name: string;
  title: string;
  role?: string;
  gender: 'female' | 'male';
  avatar: string;
  voiceName?: string;
  description: string;
}

export interface InterviewMessage {
  _id?: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: string | Date;
}

export interface QuestionAnalysis {
  question: string;
  candidateAnswer: string;
  score: number;
  whatWentWell: string;
  missingConcepts: string;
  suggestedImprovement: string;
  modelAnswerExample: string;
}

export interface CategoryScoreItem {
  score: number;
  assessed: boolean;
  feedback?: string;
}

export interface InterviewResults {
  overallScore: number;
  performanceLevel: string;
  completionStatus: 'completed' | 'partial';
  questionsAnswered: number;
  summary: string;
  categoryScores?: {
    technicalKnowledge: CategoryScoreItem;
    problemSolving: CategoryScoreItem;
    communicationClarity: CategoryScoreItem;
    behavioralCompetence: CategoryScoreItem;
    roleResumeAlignment: CategoryScoreItem;
  };
  questionAnalysis?: QuestionAnalysis[];
  strengths: string[];
  areasForImprovement: string[];
  unsupportedClaimsOrGaps?: string[];
  personalizedPlan?: {
    topicsToStudy: string[];
    skillsToStrengthen: string[];
    recommendedPracticeQuestions: string[];
    actionableNextSteps: string[];
  };
  finalSummary?: {
    readinessAssessment: string;
    priorityImprovements: string[];
    recommendedNextSession: string;
  };
  // Backwards compatibility aliases
  communicationScore?: number;
  technicalScore?: number;
  behavioralScore?: number;
  detailedFeedback?: string;
}

export interface Interview {
  _id: string;
  userId: string;
  resumeId: string | { _id: string; fileName: string; createdAt: string; targetRole?: string };
  targetRole?: string;
  interviewer?: InterviewerProfile;
  category?: InterviewCategory;
  difficulty?: InterviewDifficulty;
  questionCount?: number;
  status: 'in_progress' | 'completed' | 'evaluating' | 'failed';
  messages: InterviewMessage[];
  finalResults?: InterviewResults;
  aiProvider: 'openai' | 'gemini';
  createdAt: string;
  updatedAt: string;
}

export type AIProvider = 'openai' | 'gemini';

// ─── Roadmap & Improvement Planner Types ─────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'skipped';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskType =
  | 'concept'
  | 'coding'
  | 'sql'
  | 'debugging'
  | 'project'
  | 'interview'
  | 'assessment'
  | 'custom';

export interface RoadmapResource {
  title: string;
  url: string;
  source: string;
  isOfficial?: boolean;
}

export interface RoadmapAction {
  href: string;
  label: string;
  mode?: string;
}

export interface RoadmapTask {
  id: string;
  phaseId: string;
  title: string;
  skill: string;
  objective: string;
  priority: TaskPriority;
  estimatedMinutes: number;
  taskType: TaskType;
  status: TaskStatus;
  scheduledDate?: string | null;
  completedAt?: string | null;
  recommendedResource?: RoadmapResource;
  completionCriteria?: string;
  relatedAction?: RoadmapAction;
  isCustom?: boolean;
  notes?: string;
}

export interface RoadmapPhase {
  phaseId: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  objectives: string[];
  estimatedWeeks: number;
  completionCriteria: string;
  dependencies: string[];
}

export interface RoadmapSkillGap {
  skill: string;
  category: 'required' | 'optional' | 'low_score' | 'missing_evidence' | 'improved';
  importance: 'high' | 'medium' | 'low';
  reason: string;
  inResume: boolean;
  assessmentAttempted: boolean;
  latestScore: number | null;
  isDemonstrated: boolean;
  weakTopics: string[];
}

export interface RoadmapProjectChecklistItem {
  item: string;
  completed: boolean;
}

export interface RoadmapProject {
  id: string;
  title: string;
  objective: string;
  requiredSkills: string[];
  milestones: string[];
  deliverables: string[];
  checklist: RoadmapProjectChecklistItem[];
  resources: Array<{ title: string; url: string }>;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  type: 'foundation' | 'assessment' | 'project' | 'score_improvement' | 'readiness' | 'certification_guide';
  completed: boolean;
  completedAt?: string | null;
  certificationInfo?: {
    name: string;
    issuingOrg: string;
    link: string;
    disclaimer: string;
  };
}

export interface RoadmapPreferences {
  studyDays: string[];
  dailyMinutes: number;
  preferredHours?: string;
  targetCompletionDate?: string | null;
}

export interface RoadmapData {
  _id: string;
  userId: string;
  targetRole: string;
  preferences: RoadmapPreferences;
  skillGaps: RoadmapSkillGap[];
  phases: RoadmapPhase[];
  tasks: RoadmapTask[];
  projects: RoadmapProject[];
  milestones: RoadmapMilestone[];
  analytics: {
    totalHoursLogged: number;
    lastCalculatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export * from './builder';
