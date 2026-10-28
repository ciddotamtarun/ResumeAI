import { Router, RequestHandler } from 'express';
import {
  startInterview,
  respondToInterview,
  getInterview,
  getAllInterviews,
} from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/start', startInterview as RequestHandler);
router.post('/:id/respond', respondToInterview as RequestHandler);
router.get('/', getAllInterviews as RequestHandler);
router.get('/:id', getInterview as RequestHandler);

export default router;
