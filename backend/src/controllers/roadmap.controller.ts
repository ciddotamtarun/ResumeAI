import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import RoadmapService from '../services/roadmap.service';

export const getRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const roadmap = await RoadmapService.getActiveRoadmap(userId);
    res.json({ success: true, roadmap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch roadmap' });
  }
};

export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { targetRole, preferences, preserveCompleted } = req.body;
    const roadmap = await RoadmapService.generatePersonalizedRoadmap(
      userId,
      targetRole,
      preferences,
      preserveCompleted !== false
    );
    res.json({ success: true, roadmap, message: 'Personalized roadmap generated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate roadmap' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { taskId } = req.params;
    const { status, notes } = req.body;

    if (!status || !['todo', 'in_progress', 'completed', 'skipped'].includes(status)) {
      res.status(400).json({ success: false, message: 'Valid status is required' });
      return;
    }

    const roadmap = await RoadmapService.updateTaskStatus(userId, taskId, status, notes);
    res.json({ success: true, roadmap, message: `Task marked as ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update task status' });
  }
};

export const addCustomTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { title, skill, objective, phaseId, priority, estimatedMinutes, taskType, scheduledDate, recommendedResource } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Task title is required' });
      return;
    }

    const roadmap = await RoadmapService.addCustomTask(userId, {
      title,
      skill: skill || 'General',
      objective,
      phaseId,
      priority,
      estimatedMinutes,
      taskType,
      scheduledDate,
      recommendedResource,
    });

    res.status(201).json({ success: true, roadmap, message: 'Custom learning task added!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add custom task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { taskId } = req.params;
    const updates = req.body;

    const roadmap = await RoadmapService.updateTask(userId, taskId, updates);
    res.json({ success: true, roadmap, message: 'Task updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { taskId } = req.params;

    const roadmap = await RoadmapService.deleteTask(userId, taskId);
    res.json({ success: true, roadmap, message: 'Task removed or skipped' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete task' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { preferences } = req.body;

    if (!preferences) {
      res.status(400).json({ success: false, message: 'Preferences payload is required' });
      return;
    }

    const roadmap = await RoadmapService.updatePreferences(userId, preferences);
    res.json({ success: true, roadmap, message: 'Study preferences updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update preferences' });
  }
};

export const exportProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const report = await RoadmapService.exportProgress(userId);
    res.json({ success: true, report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to export progress' });
  }
};
