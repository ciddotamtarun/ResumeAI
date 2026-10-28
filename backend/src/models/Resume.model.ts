import mongoose, { Document, Schema } from 'mongoose';

interface SectionAnalysis {
  score: number;
  feedback: string[];
}

interface Analysis {
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

interface Improvement {
  section: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: string;
  rawText: string;
  targetRole: string;
  analysis: Analysis;
  improvements: Improvement[];
  aiProvider: 'openai' | 'gemini';
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema({ score: Number, feedback: [String] }, { _id: false });

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    rawText: { type: String, required: true },
    targetRole: { type: String, default: '' },
    analysis: {
      overallScore: { type: Number, default: 0 },
      sections: {
        contact: SectionSchema,
        summary: SectionSchema,
        experience: SectionSchema,
        education: SectionSchema,
        skills: SectionSchema,
        formatting: SectionSchema,
      },
      strengths: [String],
      improvements: [String],
      keywords: [String],
      atsCompatibility: { type: Number, default: 0 },
    },
    improvements: [
      {
        section: String,
        original: String,
        suggested: String,
        reason: String,
      },
    ],
    aiProvider: { type: String, enum: ['openai', 'gemini'], default: 'gemini' },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
