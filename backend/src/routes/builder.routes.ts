import { Router, RequestHandler } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  listDrafts,
  getDraft,
  saveDraft,
  renameDraft,
  deleteDraft,
  aiAssist,
  analyzeDraft,
} from '../controllers/builder.controller';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/drafts', listDrafts as RequestHandler);
router.get('/drafts/:id', getDraft as RequestHandler);
router.post('/drafts', saveDraft as RequestHandler);
router.patch('/drafts/:id/rename', renameDraft as RequestHandler);
router.delete('/drafts/:id', deleteDraft as RequestHandler);

router.post('/ai-assist', aiAssist as RequestHandler);
router.post('/analyze', analyzeDraft as RequestHandler);

export default router;
