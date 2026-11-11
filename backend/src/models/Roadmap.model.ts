import mongoose, { Document, Schema } from 'mongoose';

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

export interface IRoadmapResource {
  title: string;
  url: string;
  source: string;
  isOfficial?: boolean;
}

export interface IRoadmapAction {
  href: string;
  label: string;
  mode?: string;
}

export interface IRoadmapTask {
  id: string;
  phaseId: string;
  title: string;
  skill: string;
  objective: string;
  priority: TaskPriority;
  estimatedMinutes: number;
  taskType: TaskType;
  status: TaskStatus;
  scheduledDate?: Date | null;
  completedAt?: Date | null;
  recommendedResource?: IRoadmapResource;
  completionCriteria?: string;
  relatedAction?: IRoadmapAction;
  isCustom?: boolean;
  notes?: string;
}

export interface IRoadmapPhase {
  phaseId: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  objectives: string[];
  estimatedWeeks: number;
  completionCriteria: string;
  dependencies: string[];
}

export interface IRoadmapSkillGap {
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

export interface IRoadmapProjectChecklistItem {
  item: string;
  completed: boolean;
}

export interface IRoadmapProject {
  id: string;
  title: string;
  objective: string;
  requiredSkills: string[];
  milestones: string[];
  deliverables: string[];
  checklist: IRoadmapProjectChecklistItem[];
  resources: Array<{ title: string; url: string }>;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface IRoadmapMilestone {
  id: string;
  title: string;
  description: string;
  type: 'foundation' | 'assessment' | 'project' | 'score_improvement' | 'readiness' | 'certification_guide';
  completed: boolean;
  completedAt?: Date | null;
  certificationInfo?: {
    name: string;
    issuingOrg: string;
    link: string;
    disclaimer: string;
  };
}

export interface IRoadmapPreferences {
  studyDays: string[];
  dailyMinutes: number;
  preferredHours?: string;
  targetCompletionDate?: Date | null;
}

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  resumeId?: mongoose.Types.ObjectId;
  preferences: IRoadmapPreferences;
  skillGaps: IRoadmapSkillGap[];
  phases: IRoadmapPhase[];
  tasks: IRoadmapTask[];
  projects: IRoadmapProject[];
  milestones: IRoadmapMilestone[];
  analytics: {
    totalHoursLogged: number;
    lastCalculatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapResourceSchema = new Schema<IRoadmapResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, default: 'Official Documentation' },
    isOfficial: { type: Boolean, default: true },
  },
  { _id: false }
);

const RoadmapActionSchema = new Schema<IRoadmapAction>(
  {
    href: { type: String, required: true },
    label: { type: String, required: true },
    mode: { type: String },
  },
  { _id: false }
);

const RoadmapTaskSchema = new Schema<IRoadmapTask>(
  {
    id: { type: String, required: true },
    phaseId: { type: String, required: true },
    title: { type: String, required: true },
    skill: { type: String, required: true },
    objective: { type: String, default: '' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    estimatedMinutes: { type: Number, default: 45 },
    taskType: {
      type: String,
      enum: ['concept', 'coding', 'sql', 'debugging', 'project', 'interview', 'assessment', 'custom'],
      default: 'concept',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'skipped'],
      default: 'todo',
    },
    scheduledDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    recommendedResource: { type: RoadmapResourceSchema, default: null },
    completionCriteria: { type: String, default: '' },
    relatedAction: { type: RoadmapActionSchema, default: null },
    isCustom: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const RoadmapPhaseSchema = new Schema<IRoadmapPhase>(
  {
    phaseId: { type: String, required: true },
    phaseNumber: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    objectives: [{ type: String }],
    estimatedWeeks: { type: Number, default: 2 },
    completionCriteria: { type: String, default: '' },
    dependencies: [{ type: String }],
  },
  { _id: false }
);

const RoadmapSkillGapSchema = new Schema<IRoadmapSkillGap>(
  {
    skill: { type: String, required: true },
    category: {
      type: String,
      enum: ['required', 'optional', 'low_score', 'missing_evidence', 'improved'],
      default: 'required',
    },
    importance: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    reason: { type: String, default: '' },
    inResume: { type: Boolean, default: false },
    assessmentAttempted: { type: Boolean, default: false },
    latestScore: { type: Number, default: null },
    isDemonstrated: { type: Boolean, default: false },
    weakTopics: [{ type: String }],
  },
  { _id: false }
);

const RoadmapProjectChecklistItemSchema = new Schema<IRoadmapProjectChecklistItem>(
  {
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoadmapProjectSchema = new Schema<IRoadmapProject>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    objective: { type: String, required: true },
    requiredSkills: [{ type: String }],
    milestones: [{ type: String }],
    deliverables: [{ type: String }],
    checklist: [RoadmapProjectChecklistItemSchema],
    resources: [{ title: String, url: String }],
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
  },
  { _id: false }
);

const RoadmapMilestoneSchema = new Schema<IRoadmapMilestone>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['foundation', 'assessment', 'project', 'score_improvement', 'readiness', 'certification_guide'],
      default: 'foundation',
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    certificationInfo: {
      name: { type: String },
      issuingOrg: { type: String },
      link: { type: String },
      disclaimer: { type: String },
    },
  },
  { _id: false }
);

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetRole: { type: String, required: true, trim: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
    preferences: {
      studyDays: {
        type: [String],
        default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      },
      dailyMinutes: { type: Number, default: 60 },
      preferredHours: { type: String, default: 'Evening (7:00 PM - 8:30 PM)' },
      targetCompletionDate: { type: Date, default: null },
    },
    skillGaps: [RoadmapSkillGapSchema],
    phases: [RoadmapPhaseSchema],
    tasks: [RoadmapTaskSchema],
    projects: [RoadmapProjectSchema],
    milestones: [RoadmapMilestoneSchema],
    analytics: {
      totalHoursLogged: { type: Number, default: 0 },
      lastCalculatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Index for quick user active roadmap lookup
RoadmapSchema.index({ userId: 1, targetRole: 1 });

export default mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
