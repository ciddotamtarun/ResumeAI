import { Router, RequestHandler } from 'express';
import {
  startInterview,
  respondToInterview,
  finishInterview,
  retryInterviewQuestion,
  getInterview,
  getAllInterviews,
} from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/start', startInterview as RequestHandler);
router.post('/:id/respond', respondToInterview as RequestHandler);
router.post('/:id/answer', respondToInterview as RequestHandler);
router.post('/:id/finish', finishInterview as RequestHandler);
router.post('/:id/evaluate', finishInterview as RequestHandler);
router.post('/:id/retry-evaluation', finishInterview as RequestHandler);
router.post('/:id/retry-question', retryInterviewQuestion as RequestHandler);
router.get('/', getAllInterviews as RequestHandler);
router.get('/history', getAllInterviews as RequestHandler);
router.get('/:id', getInterview as RequestHandler);

export default router;
