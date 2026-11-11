import mongoose, { Document, Schema } from 'mongoose';

export interface ITopicScore {
  topic: string;
  score: number;
  total: number;
}

export interface IAssessmentAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: string;
  domainName: string;
  targetRole?: string;
  roundMode?: string;
  skillName?: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  answers: Record<string, number>;
  topicBreakdown: ITopicScore[];
  weakTopics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TopicScoreSchema = new Schema<ITopicScore>(
  {
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const AssessmentSchema = new Schema<IAssessmentAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentId: { type: String, required: true, index: true },
    domainName: { type: String, required: true },
    targetRole: { type: String, default: '' },
    roundMode: { type: String, default: 'fundamentals' },
    skillName: { type: String, default: '' },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    answers: { type: Schema.Types.Mixed, default: {} },
    topicBreakdown: [TopicScoreSchema],
    weakTopics: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Assessment || mongoose.model<IAssessmentAttempt>('Assessment', AssessmentSchema);
