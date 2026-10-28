import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_change_me', { expiresIn: '7d' });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const normalizeBaseUrl = (value: string | undefined, fallback: string): string => {
  const trimmed = (value || fallback).trim().replace(/\/+$/, '');
  return trimmed || fallback;
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const token = signToken(user._id.toString());
    const frontendURL = normalizeBaseUrl(process.env.FRONTEND_URL, 'http://localhost:3000');
    res.redirect(`${frontendURL}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}`);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
