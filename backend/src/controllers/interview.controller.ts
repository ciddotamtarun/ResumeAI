import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Interview from '../models/Interview.model';
import Resume from '../models/Resume.model';
import {
  generateInterviewerResponse,
  generateInterviewResults,
} from '../services/interview.service';

export const startInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resumeId, provider = 'gemini' } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const targetRole = resume.targetRole || '';

    const firstMessage = await generateInterviewerResponse(
      [],
      resume.rawText,
      true,
      targetRole,
      provider as 'openai' | 'gemini'
    );

    const interview = await Interview.create({
      userId: req.user!._id,
      resumeId,
      targetRole,
      messages: [{ role: 'interviewer', content: firstMessage }],
      aiProvider: provider,
    });

    res.status(201).json({ success: true, interview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { answer, response: legacyResponse } = req.body;
    const candidateResponse = answer || legacyResponse;

    const interview = await Interview.findOne({ _id: id, userId: req.user!._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ success: false, message: 'Interview is already completed' });
      return;
    }

    const resume = await Resume.findById(interview.resumeId);
    if (!resume) {
      res.status(404).json({ success: false, message: 'Associated resume not found' });
      return;
    }

    const targetRole = interview.targetRole || resume.targetRole || '';

    // Add candidate's message
    interview.messages.push({
      role: 'candidate',
      content: candidateResponse,
      timestamp: new Date(),
    });

    const interviewerMsgCount = interview.messages.filter((m) => m.role === 'interviewer').length;

    if (interviewerMsgCount >= 8) {
      // Wrap up interview
      interview.messages.push({
        role: 'interviewer',
        content:
          `Thank you so much for your time and thoughtful answers! It was a pleasure speaking with you today${targetRole ? ` about the ${targetRole} position` : ''}. We'll review everything carefully and be in touch. Please check your Interview Results for detailed feedback on your performance. Best of luck!`,
        timestamp: new Date(),
      });
      interview.status = 'completed';

      const convMsgs = interview.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      interview.finalResults = await generateInterviewResults(convMsgs, interview.aiProvider);
    } else {
      // Generate next interviewer message
      const convMsgs = interview.messages.map((m) => ({
        role: m.role === 'interviewer' ? 'assistant' : 'user',
        content: m.content,
      }));

      const nextMsg = await generateInterviewerResponse(
        convMsgs,
        resume.rawText,
        false,
        targetRole,
        interview.aiProvider
      );

      interview.messages.push({
        role: 'interviewer',
        content: nextMsg,
        timestamp: new Date(),
      });
    }

    await interview.save();
    res.json({ success: true, interview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    res.json({ success: true, interview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await Interview.find({ userId: req.user!._id })
      .populate('resumeId', 'fileName createdAt targetRole')
      .sort({ createdAt: -1 });
    res.json({ success: true, interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
