import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model';
import Otp from '../models/Otp.model';
import PendingRegistration from '../models/PendingRegistration.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendOtpEmail } from '../services/email.service';
import { validateEmail } from '../utils/emailValidator';

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_change_me', { expiresIn: '7d' });

const OTP_EXPIRY_MS = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10) * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_RESENDS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds resend cooldown

function generateOtp(): string {
  // Cryptographically secure 6-digit OTP (100000–999999)
  return String(crypto.randomInt(100000, 1000000));
}

const normalizeBaseUrl = (value: string | undefined, fallback: string): string => {
  const trimmed = (value || fallback).trim().replace(/\/+$/, '');
  return trimmed || fallback;
};

export function formatAuthError(error: any): { status: number; message: string } {
  const msg = error?.message || '';
  if (
    error?.name === 'MongooseError' ||
    error?.name === 'MongoServerSelectionError' ||
    error?.name === 'MongoNetworkError' ||
    msg.includes('buffering timed out') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('whitelist') ||
    msg.includes('Could not connect to any servers') ||
    msg.includes('MongoDB Atlas cluster') ||
    msg.includes('connect ECONNREFUSED')
  ) {
    return {
      status: 503,
      message:
        'Database connection failed. Unable to reach MongoDB Atlas. If you are connected to a campus, school, or corporate Wi-Fi network (such as SVKM-NMIMS), port 27017 may be blocked by the firewall, or your current IP (136.232.228.138) must be whitelisted in MongoDB Atlas Network Access. Switching to a mobile hotspot usually resolves this immediately.',
    };
  }
  return {
    status: 500,
    message: msg || 'Internal server error',
  };
}

// ─── Register — Step 1: Validate email + DNS, send OTP, save Pending ─────────
// USER ACCOUNT IS NOT CREATED IN THE DATABASE UNTIL OTP IS VERIFIED!

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
      return;
    }

    // 1. Strict validation: syntax, prohibited characters (e.g. *), Gmail rules, and domain DNS MX
    const validation = await validateEmail(email);
    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.error });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if an account already exists with this email
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
      return;
    }

    // 3. Generate secure 6-digit OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // 4. Send OTP email via SMTP provider first
    try {
      await sendOtpEmail(cleanEmail, otp, 'registration');
    } catch (emailErr: any) {
      console.error('[Auth] Failed to send registration OTP email:', emailErr.message);
      res.status(502).json({
        success: false,
        message: `Failed to deliver verification email: ${emailErr.message || 'SMTP error'}. Please verify that the email address is correct and can receive mail.`,
      });
      return;
    }

    // 5. Invalidate previous pending registration for this email
    await PendingRegistration.deleteMany({ email: cleanEmail });

    // 6. Save in PendingRegistration ONLY — real User account is NOT created yet!
    await PendingRegistration.create({
      name: name.trim(),
      email: cleanEmail,
      password, // User.pre('save') will hash upon actual creation
      otpHash,
      expiresAt,
    });

    res.status(200).json({
      success: true,
      otpRequired: true,
      email: cleanEmail,
      message: 'A 6-digit verification code has been sent to your email address.',
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

// ─── Register — Step 2: Verify OTP & ACTUALLY Create User Account ─────────────

export const verifyRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and verification code are required' });
      return;
    }

    const trimmedOtp = String(otp).trim();
    if (!/^\d{6}$/.test(trimmedOtp)) {
      res.status(400).json({ success: false, message: 'Verification code must be exactly 6 digits' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const pending = await PendingRegistration.findOne({ email: cleanEmail });

    if (!pending) {
      res.status(400).json({
        success: false,
        message: 'No pending registration found or session expired. Please sign up again.',
      });
      return;
    }

    // Check expiry
    if (pending.expiresAt < new Date()) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please sign up again to get a new code.',
      });
      return;
    }

    // Check attempt limit
    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. This verification session has been invalidated. Please sign up again.',
      });
      return;
    }

    // Verify OTP hash
    const isValid = await bcrypt.compare(trimmedOtp, pending.otpHash);
    if (!isValid) {
      pending.attempts += 1;
      if (pending.attempts >= OTP_MAX_ATTEMPTS) {
        await PendingRegistration.deleteOne({ _id: pending._id });
        res.status(429).json({
          success: false,
          message: 'Too many incorrect attempts. This verification session has been invalidated. Please sign up again.',
        });
        return;
      }
      await pending.save();
      const remaining = OTP_MAX_ATTEMPTS - pending.attempts;
      res.status(400).json({
        success: false,
        message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
      return;
    }

    // Prevent race conditions and duplicate user creation
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
      return;
    }

    // ── NOW AND ONLY NOW: Create the user account in MongoDB ──────────────────
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password, // User.pre('save') hashes using bcrypt 12
    });

    // Clean up the pending registration
    await PendingRegistration.deleteOne({ _id: pending._id });

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully! Please sign in.',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

// Aliases for route naming flexibility
export const verifyEmailOtp = verifyRegistrationOtp;

// ─── Register — Resend Registration OTP ──────────────────────────────────────

export const resendRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const pending = await PendingRegistration.findOne({ email: cleanEmail });

    if (!pending) {
      res.status(400).json({
        success: false,
        message: 'No pending registration found. Please sign up again.',
      });
      return;
    }

    // Check 60-second cooldown
    if (pending.lastResendAt) {
      const cooldownRemaining = OTP_RESEND_COOLDOWN_MS - (Date.now() - pending.lastResendAt.getTime());
      if (cooldownRemaining > 0) {
        res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before requesting a new code.`,
        });
        return;
      }
    }

    // Check resend limit
    if (pending.resendCount >= OTP_MAX_RESENDS) {
      res.status(429).json({
        success: false,
        message: 'Maximum resend limit reached. Please sign up again.',
      });
      return;
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    pending.otpHash = otpHash;
    pending.expiresAt = expiresAt;
    pending.attempts = 0;
    pending.resendCount += 1;
    pending.lastResendAt = new Date();
    await pending.save();

    try {
      await sendOtpEmail(cleanEmail, otp, 'registration');
    } catch (emailErr: any) {
      console.error('[Auth] Failed to resend registration OTP email:', emailErr.message);
      res.status(502).json({
        success: false,
        message: `Failed to send verification email: ${emailErr.message || 'SMTP error'}. Please try again.`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

export const resendEmailOtp = resendRegistrationOtp;

// ─── Login — Step 1: validate credentials, send OTP ──────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Invalidate any existing OTP for this email
    await Otp.deleteMany({ email: user.email });

    // Save new OTP record
    await Otp.create({ email: user.email, otpHash, expiresAt });

    // Send email via SMTP
    try {
      await sendOtpEmail(user.email!, otp, 'login');
    } catch (emailErr: any) {
      console.error('[Auth] Failed to send login OTP email:', emailErr.message);
      res.status(502).json({
        success: false,
        message: `Failed to send verification email: ${emailErr.message || 'SMTP error'}. Please try again or contact support.`,
      });
      return;
    }

    res.json({
      success: true,
      otpRequired: true,
      email: user.email,
      message: 'A verification code has been sent to your email address.',
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

// ─── Login — Step 2: verify code, issue JWT ──────────────────────────────────

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const trimmedOtp = String(otp).trim();
    if (!/^\d{6}$/.test(trimmedOtp)) {
      res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({ email: cleanEmail, used: false });

    if (!record) {
      res.status(400).json({ success: false, message: 'No pending verification found. Please sign in again.' });
      return;
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      res.status(400).json({ success: false, message: 'Verification code has expired. Please sign in again.' });
      return;
    }

    // Check attempt limit
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: record._id });
      res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please sign in again to get a new code.',
      });
      return;
    }

    // Verify OTP hash
    const isValid = await bcrypt.compare(trimmedOtp, record.otpHash);

    if (!isValid) {
      record.attempts += 1;
      if (record.attempts >= OTP_MAX_ATTEMPTS) {
        await Otp.deleteOne({ _id: record._id });
        res.status(429).json({
          success: false,
          message: 'Too many incorrect attempts. Please sign in again to get a new code.',
        });
        return;
      }
      await record.save();
      const remaining = OTP_MAX_ATTEMPTS - record.attempts;
      res.status(400).json({
        success: false,
        message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
      return;
    }

    // Mark OTP as used
    record.used = true;
    await record.save();

    // Find user and issue JWT
    const user = await User.findOne({ email: record.email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const token = signToken(user._id.toString());

    // Clean up used OTP
    await Otp.deleteOne({ _id: record._id });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

// ─── Login — Resend OTP ───────────────────────────────────────────────────────

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({ email: cleanEmail, used: false });

    if (!record) {
      res.status(400).json({
        success: false,
        message: 'No pending verification found. Please sign in again.',
      });
      return;
    }

    // Check 60-second cooldown
    if (record.lastResendAt) {
      const cooldownRemaining = OTP_RESEND_COOLDOWN_MS - (Date.now() - record.lastResendAt.getTime());
      if (cooldownRemaining > 0) {
        res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before requesting a new code.`,
        });
        return;
      }
    }

    // Check resend limit
    if (record.resendCount >= OTP_MAX_RESENDS) {
      res.status(429).json({
        success: false,
        message: 'Maximum resend limit reached. Please sign in again.',
      });
      return;
    }

    // Generate new OTP and replace
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    record.otpHash = otpHash;
    record.expiresAt = expiresAt;
    record.attempts = 0;
    record.resendCount += 1;
    record.lastResendAt = new Date();
    await record.save();

    try {
      await sendOtpEmail(cleanEmail, otp, 'login');
    } catch (emailErr: any) {
      console.error('[Auth] Failed to resend OTP email:', emailErr.message);
      res.status(502).json({
        success: false,
        message: `Failed to send verification email: ${emailErr.message || 'SMTP error'}. Please try again.`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

// ─── Google OAuth callback (Redirect Flow) ───────────────────────────────────

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const frontendURL = normalizeBaseUrl(process.env.FRONTEND_URL, 'http://localhost:3000');
  try {
    const user = (req as any).user;
    if (!user?._id) {
      console.warn('[Auth] googleCallback: No user found on request object');
      res.redirect(`${frontendURL}/auth/login?error=google`);
      return;
    }
    const token = signToken(user._id.toString());
    res.redirect(`${frontendURL}/auth/callback?token=${token}&name=${encodeURIComponent(user.name || '')}`);
  } catch (error: any) {
    console.error('[Auth] googleCallback redirect failure:', error?.message || error);
    res.redirect(`${frontendURL}/auth/login?error=google`);
  }
};

// ─── Google ID Token / Credential Flow (POST /api/auth/google) ─────────────────

export const googleTokenLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const credential = req.body?.credential || req.body?.idToken || req.body?.token;

    if (!credential || typeof credential !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Google ID token or credential is required',
      });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[Auth] GOOGLE_CLIENT_ID environment variable is missing on server');
      res.status(500).json({
        success: false,
        message: 'Google OAuth client ID is not configured on the server',
      });
      return;
    }

    // Verify token cryptographically with Google public certificates
    const oauth2Client = new OAuth2Client(clientId);
    let ticket;
    try {
      ticket = await oauth2Client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch (verifyErr: any) {
      console.warn('[Auth] Google ID token verification rejected:', verifyErr?.message || verifyErr);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token',
      });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ success: false, message: 'Google token payload is missing' });
      return;
    }

    // Verify audience and issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!payload.iss || !validIssuers.includes(payload.iss)) {
      res.status(401).json({ success: false, message: 'Invalid Google token issuer' });
      return;
    }

    if (payload.aud !== clientId) {
      res.status(401).json({ success: false, message: 'Google token audience mismatch' });
      return;
    }

    const googleId = payload.sub; // Stable subject identifier
    const email = payload.email?.toLowerCase().trim();
    const emailVerified = payload.email_verified;
    const name = (payload.name || payload.given_name || email?.split('@')[0] || 'User').trim();
    const avatar = payload.picture;

    if (!googleId) {
      res.status(400).json({ success: false, message: 'Google subject identifier is missing' });
      return;
    }

    if (!email) {
      res.status(400).json({ success: false, message: 'Google account does not have an email address' });
      return;
    }

    if (emailVerified === false) {
      res.status(401).json({ success: false, message: 'Google email address is not verified' });
      return;
    }

    // Safe retrieval or creation in MongoDB
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link Google ID to existing email account
        user.googleId = googleId;
        if (!user.avatar && avatar) {
          user.avatar = avatar;
        }
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name,
          email,
          googleId,
          avatar,
        });
      }
    } else {
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = signToken(user._id.toString());
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error: any) {
    const errObj = formatAuthError(error);
    res.status(errObj.status).json({ success: false, message: errObj.message });
  }
};
