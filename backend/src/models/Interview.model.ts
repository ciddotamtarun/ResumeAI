import mongoose, { Document, Schema } from 'mongoose';

interface IMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

interface IFinalResults {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  behavioralScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
}

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  targetRole: string;
  status: 'in_progress' | 'completed';
  messages: IMessage[];
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
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    messages: [
      {
        role: { type: String, enum: ['interviewer', 'candidate'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    finalResults: {
      overallScore: Number,
      communicationScore: Number,
      technicalScore: Number,
      behavioralScore: Number,
      strengths: [String],
      areasForImprovement: [String],
      detailedFeedback: String,
    },
    aiProvider: { type: String, enum: ['openai', 'gemini'], default: 'gemini' },
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
