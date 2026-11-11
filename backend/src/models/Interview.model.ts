import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewer {
  id: 'female' | 'male';
  name: string;
  title: string;
  gender: 'female' | 'male';
  avatar: string;
  voiceName?: string;
  description?: string;
}

export interface IInterviewMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export interface IQuestionAnalysis {
  question: string;
  candidateAnswer: string;
  score: number;
  whatWentWell: string;
  missingConcepts: string;
  suggestedImprovement: string;
  modelAnswerExample: string;
}

export interface ICategoryScore {
  score: number;
  assessed: boolean;
  feedback?: string;
}

export interface IFinalResults {
  overallScore: number;
  performanceLevel?: string;
  completionStatus?: 'completed' | 'partial';
  questionsAnswered?: number;
  summary?: string;
  categoryScores?: {
    technicalKnowledge?: ICategoryScore;
    problemSolving?: ICategoryScore;
    communicationClarity?: ICategoryScore;
    behavioralCompetence?: ICategoryScore;
    roleResumeAlignment?: ICategoryScore;
    [key: string]: ICategoryScore | undefined;
  };
  questionAnalysis?: IQuestionAnalysis[];
  strengths?: string[];
  areasForImprovement?: string[];
  unsupportedClaimsOrGaps?: string[];
  personalizedPlan?: {
    topicsToStudy?: string[];
    skillsToStrengthen?: string[];
    recommendedPracticeQuestions?: string[];
    actionableNextSteps?: string[];
  };
  finalSummary?: {
    readinessAssessment?: string;
    priorityImprovements?: string[];
    recommendedNextSession?: string;
  };
  // Backwards compatibility aliases
  communicationScore?: number;
  technicalScore?: number;
  behavioralScore?: number;
  detailedFeedback?: string;
  [key: string]: any;
}

export type InterviewStatus = 'in_progress' | 'evaluating' | 'completed' | 'failed';

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  targetRole: string;
  interviewer?: IInterviewer;
  category?: 'mixed' | 'technical' | 'hr' | 'behavioral';
  difficulty?: 'easy' | 'medium' | 'difficult';
  questionCount?: number;
  status: InterviewStatus;
  messages: IInterviewMessage[];
  finalResults?: IFinalResults;
  aiProvider: 'openai' | 'gemini';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    targetRole: { type: String, default: '' },
    interviewer: {
      id: { type: String, enum: ['female', 'male'], default: 'female' },
      name: { type: String, default: 'Sarah Jenkins' },
      title: { type: String, default: 'Senior Technical Recruiter & Hiring Lead' },
      gender: { type: String, enum: ['female', 'male'], default: 'female' },
      avatar: { type: String, default: '/avatars/female.svg' },
      voiceName: { type: String, default: 'Female' },
      description: { type: String, default: 'Conversational, thorough, and supportive' },
    },
    category: {
      type: String,
      enum: ['mixed', 'technical', 'hr', 'behavioral'],
      default: 'mixed',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'difficult'],
      default: 'medium',
    },
    questionCount: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['in_progress', 'evaluating', 'completed', 'failed'],
      default: 'in_progress',
    },
    messages: [
      {
        role: { type: String, enum: ['interviewer', 'candidate'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    finalResults: { type: Schema.Types.Mixed },
    aiProvider: { type: String, enum: ['openai', 'gemini'], default: 'gemini' },
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
