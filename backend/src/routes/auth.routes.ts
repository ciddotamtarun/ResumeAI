import { Router, RequestHandler } from 'express';
import passport from 'passport';
import { register, login, getMe, googleCallback } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const normalizeBaseUrl = (value: string | undefined, fallback: string): string => {
  const trimmed = (value || fallback).trim().replace(/\/+$/, '');
  return trimmed || fallback;
};
const FRONTEND_BASE_URL = normalizeBaseUrl(process.env.FRONTEND_URL, 'http://localhost:3000');

router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.get('/me', protect, getMe as RequestHandler);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_BASE_URL}/auth/login?error=google`, session: false }),
  googleCallback as RequestHandler
);

export default router;
