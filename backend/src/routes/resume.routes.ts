import { Router, RequestHandler } from 'express';
import {
  uploadResume,
  getResume,
  getAllResumes,
  deleteResume,
  analyzeBuilderResume,
  aiAssistResume,
} from '../controllers/resume.controller';
import { protect } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume as RequestHandler);
router.post('/builder-analyze', analyzeBuilderResume as RequestHandler);
router.post('/ai-assist', aiAssistResume as RequestHandler);
router.get('/', getAllResumes as RequestHandler);
router.get('/:id', getResume as RequestHandler);
router.delete('/:id', deleteResume as RequestHandler);

export default router;
