import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Interview from '../models/Interview.model';
import Resume from '../models/Resume.model';
import {
  generateInterviewerResponse,
  generateInterviewResults,
  FEMALE_INTERVIEWER,
  MALE_INTERVIEWER,
  InterviewConfig,
} from '../services/interview.service';

export const startInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      resumeId,
      interviewerId = 'female',
      category = 'mixed',
      difficulty = 'medium',
      questionCount = 5,
      targetRole: requestedRole,
      provider = 'gemini',
    } = req.body;

    if (!resumeId) {
      res.status(400).json({ success: false, message: 'Please select an analyzed resume to begin.' });
      return;
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found or does not belong to you.' });
      return;
    }

    const selectedInterviewer = interviewerId === 'male' ? MALE_INTERVIEWER : FEMALE_INTERVIEWER;
    const finalRole = (requestedRole || resume.targetRole || 'Software Professional').trim();
    const finalCategory = ['mixed', 'technical', 'hr', 'behavioral'].includes(category) ? category : 'mixed';
    const finalDifficulty = ['easy', 'medium', 'difficult'].includes(difficulty) ? difficulty : 'medium';
    const finalCount = Math.max(3, Math.min(20, Number(questionCount) || 5));

    const config: InterviewConfig = {
      targetRole: finalRole,
      category: finalCategory,
      difficulty: finalDifficulty,
      questionCount: finalCount,
      interviewer: selectedInterviewer,
    };

    console.log(`[Interview] Starting interview session: role="${finalRole}", category="${finalCategory}", difficulty="${finalDifficulty}", interviewer="${selectedInterviewer.name}"`);

    const firstMessage = await generateInterviewerResponse(
      [],
      resume.rawText || '',
      true,
      config,
      provider as 'openai' | 'gemini'
    );

    const interview = await Interview.create({
      userId: req.user!._id,
      resumeId,
      targetRole: finalRole,
      interviewer: selectedInterviewer,
      category: finalCategory,
      difficulty: finalDifficulty,
      questionCount: finalCount,
      messages: [{ role: 'interviewer', content: firstMessage, timestamp: new Date() }],
      status: 'in_progress',
      aiProvider: provider,
    });

    res.status(201).json({ success: true, interview });
  } catch (error: any) {
    console.error('[Interview] Start interview failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to start interview.' });
  }
};

export const respondToInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { answer, response: legacyResponse } = req.body;
    const candidateAnswer = (answer || legacyResponse || '').trim();

    if (!candidateAnswer) {
      res.status(400).json({ success: false, message: 'Please provide an answer before submitting.' });
      return;
    }

    const interview = await Interview.findOne({ _id: id, userId: req.user!._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview session not found.' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ success: false, message: 'Interview session has already concluded.' });
      return;
    }

    // Prevent duplicate answer submissions if candidate clicks rapidly
    const lastMsg = interview.messages[interview.messages.length - 1];
    if (lastMsg && lastMsg.role === 'candidate' && lastMsg.content === candidateAnswer) {
      res.status(400).json({ success: false, message: 'This response was already recorded.' });
      return;
    }

    const resume = await Resume.findById(interview.resumeId);
    if (!resume) {
      res.status(404).json({ success: false, message: 'Associated resume not found.' });
      return;
    }

    const config: InterviewConfig = {
      targetRole: interview.targetRole || resume.targetRole || 'Candidate',
      category: interview.category || 'mixed',
      difficulty: interview.difficulty || 'medium',
      questionCount: interview.questionCount || 5,
      interviewer: interview.interviewer || FEMALE_INTERVIEWER,
    };

    // Add candidate's response and save IMMEDIATELY so candidate answer is never lost
    interview.messages.push({
      role: 'candidate',
      content: candidateAnswer,
      timestamp: new Date(),
    });
    await interview.save();

    const candidateAnswerCount = interview.messages.filter((m) => m.role === 'candidate').length;
    console.log(`[Interview] Received answer ${candidateAnswerCount} of ${config.questionCount} for interview ${id}`);

    if (candidateAnswerCount >= config.questionCount) {
      // Completed configured questions — add concluding statement and generate evaluation
      const farewell = `Thank you so much, that concludes our interview session today for the ${config.targetRole} role! You shared some great insights into your background and problem-solving approach. I have compiled your complete feedback report, score analysis, and personalized study plan. Please review your results page now.`;

      interview.messages.push({
        role: 'interviewer',
        content: farewell,
        timestamp: new Date(),
      });
      interview.status = 'evaluating';
      await interview.save();

      try {
        console.log(`[Interview] Generating evaluation results for interview ${id}...`);
        interview.finalResults = await generateInterviewResults(
          interview.messages.map((m) => ({ role: m.role, content: m.content })),
          resume.rawText || '',
          config,
          interview.aiProvider
        );
        interview.status = 'completed';
        await interview.save();
        res.json({ success: true, interview });
        return;
      } catch (evalErr: any) {
        console.error('[Interview] Evaluation generation failed during respondToInterview:', evalErr?.message || evalErr);
        interview.status = 'failed';
        await interview.save();
        res.status(502).json({
          success: false,
          message: evalErr?.message || 'AI returned malformed JSON for interview response. Please retry generating the evaluation.',
          canRetry: true,
          interview,
        });
        return;
      }
    } else {
      // Generate next question
      const convMsgs = interview.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const nextQuestion = await generateInterviewerResponse(
          convMsgs,
          resume.rawText || '',
          false,
          config,
          interview.aiProvider
        );

        interview.messages.push({
          role: 'interviewer',
          content: nextQuestion,
          timestamp: new Date(),
        });
        interview.status = 'in_progress';
        await interview.save();
        res.json({ success: true, interview });
        return;
      } catch (qErr: any) {
        console.error('[Interview] Follow-up question generation failed:', qErr?.message || qErr);
        interview.status = 'in_progress';
        await interview.save();
        res.status(502).json({
          success: false,
          message: qErr?.message || 'AI service temporarily unavailable. Your answer was saved. Please click Retry to continue.',
          canRetry: true,
          interview,
          retryQuestion: true,
        });
        return;
      }
    }
  } catch (error: any) {
    console.error('[Interview] Respond failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process interview response.' });
  }
};

export const finishInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, userId: req.user!._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview session not found.' });
      return;
    }

    if (interview.status === 'completed' && interview.finalResults) {
      res.json({ success: true, interview });
      return;
    }

    const candidateAnswers = interview.messages.filter((m) => m.role === 'candidate');
    if (candidateAnswers.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot finish interview before answering at least one question.',
      });
      return;
    }

    const resume = await Resume.findById(interview.resumeId);
    const resumeText = resume?.rawText || '';

    const config: InterviewConfig = {
      targetRole: interview.targetRole || resume?.targetRole || 'Candidate',
      category: interview.category || 'mixed',
      difficulty: interview.difficulty || 'medium',
      questionCount: interview.questionCount || 5,
      interviewer: interview.interviewer || FEMALE_INTERVIEWER,
    };

    // Add farewell message if not already present
    const lastMsg = interview.messages[interview.messages.length - 1];
    if (lastMsg.role !== 'interviewer' || !lastMsg.content.includes('Thank you')) {
      interview.messages.push({
        role: 'interviewer',
        content: `Thank you for participating! We have wrapped up the session early at your request. Your evaluation has been prepared based on the questions answered so far.`,
        timestamp: new Date(),
      });
    }

    interview.status = 'evaluating';
    await interview.save();

    console.log(`[Interview] Finishing interview ${id} and generating results...`);
    try {
      interview.finalResults = await generateInterviewResults(
        interview.messages.map((m) => ({ role: m.role, content: m.content })),
        resumeText,
        config,
        interview.aiProvider
      );
      interview.status = 'completed';
      await interview.save();
      res.json({ success: true, interview });
    } catch (evalErr: any) {
      console.error('[Interview] Evaluation generation failed in finishInterview:', evalErr?.message || evalErr);
      interview.status = 'failed';
      await interview.save();
      res.status(502).json({
        success: false,
        message: evalErr?.message || 'AI returned malformed JSON for interview response. Please retry generating the evaluation.',
        canRetry: true,
        interview,
      });
    }
  } catch (error: any) {
    console.error('[Interview] Finish interview failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to finish interview.' });
  }
};

export const retryInterviewQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, userId: req.user!._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview session not found.' });
      return;
    }

    const resume = await Resume.findById(interview.resumeId);
    const resumeText = resume?.rawText || '';

    const config: InterviewConfig = {
      targetRole: interview.targetRole || resume?.targetRole || 'Candidate',
      category: interview.category || 'mixed',
      difficulty: interview.difficulty || 'medium',
      questionCount: interview.questionCount || 5,
      interviewer: interview.interviewer || FEMALE_INTERVIEWER,
    };

    const convMsgs = interview.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const nextQuestion = await generateInterviewerResponse(
      convMsgs,
      resumeText,
      false,
      config,
      interview.aiProvider
    );

    interview.messages.push({
      role: 'interviewer',
      content: nextQuestion,
      timestamp: new Date(),
    });
    interview.status = 'in_progress';
    await interview.save();

    res.json({ success: true, interview });
  } catch (error: any) {
    console.error('[Interview] Retry question failed:', error);
    res.status(502).json({
      success: false,
      message: error.message || 'Failed to retry generating the next question. Please try again.',
      canRetry: true,
    });
  }
};

export const getInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user!._id })
      .populate('resumeId', 'fileName createdAt targetRole');
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found.' });
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
