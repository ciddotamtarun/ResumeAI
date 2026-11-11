import dotenv from 'dotenv';
dotenv.config(); // ← Must be FIRST before any other imports read process.env

import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.model';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import heygenRoutes from './routes/heygen.routes';
import assessmentRoutes from './routes/assessment.routes';
import builderRoutes from './routes/builder.routes';
import roadmapRoutes from './routes/roadmap.routes';

const app = express();
const normalizeBaseUrl = (value: string | undefined, fallback: string): string => {
  const trimmed = (value || fallback).trim().replace(/\/+$/, '');
  return trimmed || fallback;
};
const FRONTEND_BASE_URL = normalizeBaseUrl(process.env.FRONTEND_URL, 'http://localhost:3000');
const BACKEND_BASE_URL = normalizeBaseUrl(process.env.BACKEND_URL, 'http://localhost:5000');

// CORS
app.use(
  cors({
    origin: FRONTEND_BASE_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport - Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${BACKEND_BASE_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase().trim();
        const name = (profile.displayName || profile.name?.givenName || email?.split('@')[0] || 'User').trim();
        const avatar = profile.photos?.[0]?.value;

        if (!googleId) {
          console.warn('[Auth] Google profile missing subject ID');
          return done(null, false, { message: 'Missing Google ID from OAuth profile' });
        }

        if (!email) {
          console.warn('[Auth] Google profile missing email address');
          return done(null, false, { message: 'Google account does not provide an email address' });
        }

        // 1. Check if user already exists with this Google subject ID
        let user = await User.findOne({ googleId });
        if (!user) {
          // 2. Check if user exists with this email (e.g. registered via email/password)
          user = await User.findOne({ email });
          if (user) {
            // Link Google ID securely to existing account
            user.googleId = googleId;
            if (!user.avatar && avatar) {
              user.avatar = avatar;
            }
            await user.save();
          } else {
            // 3. Create new user for first-time Google sign-in
            user = await User.create({
              name,
              email,
              googleId,
              avatar,
            });
          }
        } else {
          // Update avatar if not set yet
          if (!user.avatar && avatar) {
            user.avatar = avatar;
            await user.save();
          }
        }

        return done(null, user);
      } catch (error: any) {
        console.error('[Auth] Google OAuth error during user lookup/creation:', error?.message || error);
        return done(null, false, { message: error?.message || 'Database error during Google sign in' });
      }
    }
  )
);

app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/heygen', heygenRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Resume Simulator API' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

import connectDB from './config/db';

const PORT = parseInt(process.env.PORT || '5000', 10);

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

export default app;