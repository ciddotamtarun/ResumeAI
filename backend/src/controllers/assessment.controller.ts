import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Assessment from '../models/Assessment.model';
import {
  QUESTION_REGISTRY,
  scoreAssessmentSubmission,
} from '../services/assessment.service';

export const submitAssessmentAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      assessmentId,
      targetRole = 'Software Professional',
      roundMode = 'fundamentals',
      skillName = '',
      answers = {},
      timeSpentSeconds = 0,
    } = req.body;

    if (!assessmentId) {
      res.status(400).json({ success: false, message: 'Assessment ID is required.' });
      return;
    }

    const domain = QUESTION_REGISTRY[assessmentId];
    if (!domain) {
      res.status(404).json({ success: false, message: `Assessment domain '${assessmentId}' is not configured.` });
      return;
    }

    // Backend calculation of genuine score
    const evaluated = scoreAssessmentSubmission(assessmentId, answers, timeSpentSeconds);

    const attempt = await Assessment.create({
      userId: req.user!._id,
      assessmentId: domain.id,
      domainName: domain.name,
      targetRole,
      roundMode,
      skillName: skillName || domain.name,
      score: evaluated.score,
      passed: evaluated.passed,
      totalQuestions: evaluated.totalQuestions,
      correctCount: evaluated.correctCount,
      timeSpentSeconds,
      answers,
      topicBreakdown: evaluated.topicBreakdown,
      weakTopics: evaluated.weakTopics,
    });

    console.log(`[SkillProof] Assessment submitted: user=${req.user!._id}, domain="${domain.id}", score=${evaluated.score}%, passed=${evaluated.passed}`);

    res.json({
      success: true,
      attempt,
      evaluation: evaluated,
    });
  } catch (error: any) {
    console.error('[SkillProof] Submit assessment failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit assessment.' });
  }
};

export const getUserAssessmentAttempts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempts = await Assessment.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, attempts });
  } catch (error: any) {
    console.error('[SkillProof] Get attempts failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssessmentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempts = await Assessment.find({ userId: req.user!._id });
    const passedAttempts = attempts.filter((a) => a.passed);
    const verifiedDomains = Array.from(new Set(passedAttempts.map((a) => a.assessmentId)));
    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;

    res.json({
      success: true,
      stats: {
        totalAttempts: attempts.length,
        demonstratedCount: verifiedDomains.length,
        averageScore: avgScore,
        verifiedDomains,
      },
    });
  } catch (error: any) {
    console.error('[SkillProof] Get stats failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
