import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingRegistration extends Document {
  name: string;
  email: string;
  password: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  resendCount: number;
  lastResendAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true },
    otpHash:      { type: String, required: true },
    expiresAt:    { type: Date,   required: true },
    attempts:     { type: Number, default: 0 },
    resendCount:  { type: Number, default: 0 },
    lastResendAt: { type: Date },
  },
  { timestamps: true }
);

// TTL index — auto-deletes expired pending registrations
PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IPendingRegistration>(
  'PendingRegistration',
  PendingRegistrationSchema
);
