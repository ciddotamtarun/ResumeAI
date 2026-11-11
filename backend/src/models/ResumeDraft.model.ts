import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeDraft extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  targetRole: string;
  template: 'classic' | 'modern' | 'technical';
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeDraftSchema = new Schema<IResumeDraft>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'Untitled Resume' },
    targetRole: { type: String, default: '' },
    template: {
      type: String,
      enum: ['classic', 'modern', 'technical'],
      default: 'classic',
    },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ResumeDraft ||
  mongoose.model<IResumeDraft>('ResumeDraft', ResumeDraftSchema);
