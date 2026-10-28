import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Resume from '../models/Resume.model';
import { parseResume } from '../services/parser.service';
import { analyzeResume, generateImprovements } from '../services/resume.service';
import { AIServiceError } from '../services/ai.service';

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const provider = ((req.body.provider as string) || 'gemini') as 'openai' | 'gemini';
    const targetRole = (req.body.targetRole as string) || '';

    const rawText = await parseResume(req.file.path, req.file.mimetype);

    console.log(`[Upload] Raw text length: ${rawText?.trim().length || 0}`);
    console.log(`[Upload] Target role: ${targetRole || '(none)'}`);

    if (!rawText || rawText.trim().length < 20) {
      res.status(400).json({
        success: false,
        message:
          'Could not extract text from this file. For image resumes, ensure the image is clear and high-resolution. For PDFs, try exporting as a text-based PDF from Word/Google Docs, or upload as PNG/JPG instead.',
      });
      return;
    }

    const [analysis, improvements] = await Promise.all([
      analyzeResume(rawText, targetRole, provider),
      generateImprovements(rawText, targetRole, provider),
    ]);

    const resume = await Resume.create({
      userId: req.user!._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      rawText,
      targetRole,
      analysis,
      improvements,
      aiProvider: provider,
    });

    res.status(201).json({ success: true, resume });
  } catch (error: any) {
    const statusCode = error instanceof AIServiceError ? error.statusCode : 500;
    const message = error instanceof AIServiceError
      ? error.message
      : 'Failed to process resume. Please try again.';
    console.error('[Upload] Resume processing failed', {
      errorType: error instanceof Error ? error.name : typeof error,
      statusCode,
    });
    res.status(statusCode).json({ success: false, message });
  }
};

export const getResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }
    res.json({ success: true, resume });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resumes = await Resume.find({ userId: req.user!._id })
      .select('-rawText')
      .sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
