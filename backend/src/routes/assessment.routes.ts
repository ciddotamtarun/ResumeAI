import { Router, RequestHandler } from 'express';
import {
  submitAssessmentAttempt,
  getUserAssessmentAttempts,
  getAssessmentStats,
} from '../controllers/assessment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/submit', submitAssessmentAttempt as RequestHandler);
router.get('/', getUserAssessmentAttempts as RequestHandler);
router.get('/stats', getAssessmentStats as RequestHandler);

export default router;
