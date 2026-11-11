import { Router, RequestHandler } from 'express';
import passport from 'passport';
import {
  register,
  verifyRegistrationOtp,
  verifyEmailOtp,
  resendRegistrationOtp,
  resendEmailOtp,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  googleCallback,
  googleTokenLogin,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

const normalizeBaseUrl = (value: string | undefined, fallback: string): string => {
  const trimmed = (value || fallback).trim().replace(/\/+$/, '');
  return trimmed || fallback;
};
const FRONTEND_BASE_URL = normalizeBaseUrl(process.env.FRONTEND_URL, 'http://localhost:3000');

// Registration flow with OTP verification
router.post('/register',                register               as RequestHandler);
router.post('/verify-email-otp',        verifyEmailOtp         as RequestHandler);
router.post('/verify-registration-otp', verifyRegistrationOtp  as RequestHandler);
router.post('/resend-email-otp',        resendEmailOtp         as RequestHandler);
router.post('/resend-registration-otp', resendRegistrationOtp  as RequestHandler);

// Login flow with OTP verification
router.post('/login',                   login                  as RequestHandler);
router.post('/verify-otp',              verifyOtp              as RequestHandler);
router.post('/resend-otp',              resendOtp              as RequestHandler);
router.get('/me', protect,              getMe                  as RequestHandler);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_BASE_URL}/auth/login?error=google`,
    session: false,
  }),
  googleCallback as RequestHandler
);
router.post('/google', googleTokenLogin as RequestHandler);
router.post('/google/verify', googleTokenLogin as RequestHandler);

export default router;
