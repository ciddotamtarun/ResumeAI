import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otpHash: string;       // bcrypt hash of the 6-digit OTP
  expiresAt: Date;
  attempts: number;      // failed verification attempts
  resendCount: number;   // total resends for this session
  lastResendAt?: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email:       { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash:     { type: String, required: true },
    expiresAt:   { type: Date,   required: true },
    attempts:    { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    lastResendAt:{ type: Date },
    used:        { type: Boolean, default: false },
  },
  { timestamps: true }
);

// MongoDB TTL index — auto-deletes expired documents
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>('Otp', OtpSchema);
