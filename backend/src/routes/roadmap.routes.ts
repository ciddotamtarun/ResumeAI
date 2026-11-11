import { Router, RequestHandler } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getRoadmap,
  generateRoadmap,
  updateTaskStatus,
  addCustomTask,
  updateTask,
  deleteTask,
  updatePreferences,
  exportProgress,
} from '../controllers/roadmap.controller';

const router = Router();

// All roadmap routes are protected by JWT authentication
router.use(protect);

router.get('/', getRoadmap as RequestHandler);
router.post('/generate', generateRoadmap as RequestHandler);
router.patch('/tasks/:taskId/status', updateTaskStatus as RequestHandler);
router.post('/tasks', addCustomTask as RequestHandler);
router.put('/tasks/:taskId', updateTask as RequestHandler);
router.delete('/tasks/:taskId', deleteTask as RequestHandler);
router.put('/preferences', updatePreferences as RequestHandler);
router.get('/export', exportProgress as RequestHandler);

export default router;
