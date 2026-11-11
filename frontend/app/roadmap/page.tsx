'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Mic,
  Briefcase,
  Layers,
  Code2,
  ExternalLink,
  Target,
  RotateCcw,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Download,
  Share2,
  Award,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Check,
  X,
  Database,
  BarChart3,
  Sliders,
  Filter,
  Flame,
  Info,
  CheckSquare,
  Square,
  HelpCircle,
  TrendingUp,
  Play,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  RoadmapData,
  RoadmapTask,
  RoadmapPhase,
  RoadmapSkillGap,
  RoadmapProject,
  RoadmapMilestone,
  RoadmapPreferences,
  TaskStatus,
} from '@/types';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';
import { ROLE_CATEGORIES, ALL_ROLES } from '@/lib/roles';

export default function CareerRoadmapPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Core Data State
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Tab & Filter State
  const [activeTab, setActiveTab] = useState<
    'weekly' | 'phases' | 'skills' | 'projects' | 'certifications' | 'analytics'
  >('weekly');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Accordion Toggles
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    phase_1: true,
    phase_2: true,
    phase_3: false,
    phase_4: false,
  });
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    proj_1: true,
  });

  // Modal Dialog States
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCustomTaskModal, setShowCustomTaskModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingTask, setEditingTask] = useState<RoadmapTask | null>(null);

  // Form States
  const [newCustomTask, setNewCustomTask] = useState({
    title: '',
    skill: '',
    objective: '',
    phaseId: 'phase_2',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedMinutes: 45,
    taskType: 'concept' as RoadmapTask['taskType'],
  });

  const [preferencesForm, setPreferencesForm] = useState<RoadmapPreferences>({
    studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dailyMinutes: 60,
    preferredHours: 'Evening (7:00 PM - 8:30 PM)',
    targetCompletionDate: null,
  });

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch Active Roadmap
  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmap');
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        setPreferencesForm(res.data.roadmap.preferences);
      }
    } catch (err: any) {
      console.error('Failed to fetch roadmap:', err);
      toast.error('Could not load career roadmap. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoadmap();
    }
  }, [isAuthenticated, fetchRoadmap]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  // Toggle Task Status (todo -> completed -> todo)
  const handleToggleTaskStatus = async (task: RoadmapTask) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      // Optimistic update
      if (roadmap) {
        const updatedTasks = roadmap.tasks.map((t) =>
          t.id === task.id ? { ...t, status: nextStatus, completedAt: nextStatus === 'completed' ? new Date().toISOString() : null } : t
        );
        setRoadmap({ ...roadmap, tasks: updatedTasks });
      }

      const res = await api.patch(`/roadmap/tasks/${task.id}/status`, { status: nextStatus });
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        if (nextStatus === 'completed') {
          toast.success(`Task completed! +${task.estimatedMinutes}m added to your study progress.`);
        }
      }
    } catch (err: any) {
      toast.error('Failed to update task status.');
      fetchRoadmap();
    }
  };

  // Mark In Progress
  const handleSetInProgress = async (task: RoadmapTask) => {
    try {
      const res = await api.patch(`/roadmap/tasks/${task.id}/status`, { status: 'in_progress' });
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.info('Task moved to In Progress');
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  // Skip / Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await api.delete(`/roadmap/tasks/${taskId}`);
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.success('Task removed / marked skipped.');
      }
    } catch {
      toast.error('Failed to remove task.');
    }
  };

  // Add Custom Personal Task
  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post('/roadmap/tasks', newCustomTask);
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.success('Custom learning task added!');
        setShowCustomTaskModal(false);
        setNewCustomTask({
          title: '',
          skill: '',
          objective: '',
          phaseId: 'phase_2',
          priority: 'medium',
          estimatedMinutes: 45,
          taskType: 'concept',
        });
      }
    } catch {
      toast.error('Failed to add custom task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Existing Task
  const handleSaveEditedTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      setActionLoading(true);
      const res = await api.put(`/roadmap/tasks/${editingTask.id}`, {
        title: editingTask.title,
        objective: editingTask.objective,
        priority: editingTask.priority,
        estimatedMinutes: editingTask.estimatedMinutes,
        notes: editingTask.notes,
        status: editingTask.status,
      });
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.success('Task updated successfully!');
        setEditingTask(null);
      }
    } catch {
      toast.error('Failed to update task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.put('/roadmap/preferences', { preferences: preferencesForm });
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.success('Study preferences saved and schedule updated!');
        setShowPreferencesModal(false);
      }
    } catch {
      toast.error('Failed to save study preferences.');
    } finally {
      setActionLoading(false);
    }
  };

  // Regenerate Roadmap
  const handleRegenerateRoadmap = async (preserveCompleted: boolean = true) => {
    try {
      setActionLoading(true);
      const res = await api.post('/roadmap/generate', {
        targetRole: roadmap?.targetRole,
        preferences: preferencesForm,
        preserveCompleted,
      });
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.success('Roadmap refreshed with latest assessment results & progress!');
        setShowRegenerateModal(false);
      }
    } catch {
      toast.error('Failed to regenerate roadmap.');
    } finally {
      setActionLoading(false);
    }
  };

  // Switch Role & Regenerate
  const handleSelectRole = async (newRole: string) => {
    try {
      setActionLoading(true);
      setShowRoleModal(false);
      const res = await api.post('/roadmap/generate', {
        targetRole: newRole,
        preferences: preferencesForm,
        preserveCompleted: true,
      });
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        toast.success(`Personalized roadmap generated for ${newRole}!`);
      }
    } catch {
      toast.error('Failed to switch role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Project Checklist item
  const handleToggleProjectChecklist = (projectId: string, itemIdx: number) => {
    if (!roadmap) return;
    const updatedProjects = roadmap.projects.map((proj) => {
      if (proj.id === projectId) {
        const updatedChecklist = proj.checklist.map((c, i) =>
          i === itemIdx ? { ...c, completed: !c.completed } : c
        );
        const allDone = updatedChecklist.every((c) => c.completed);
        return {
          ...proj,
          checklist: updatedChecklist,
          status: allDone ? ('completed' as const) : ('in_progress' as const),
        };
      }
      return proj;
    });
    setRoadmap({ ...roadmap, projects: updatedProjects });
    toast.success('Project deliverable updated!');
  };

  // ─── Computed Statistics (Real Persisted Data) ───────────────────────────────

  const stats = useMemo(() => {
    if (!roadmap || !roadmap.tasks) {
      return {
        overallProgress: 0,
        phasesCompleted: 0,
        skillsDemonstrated: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
        hoursLogged: 0,
      };
    }

    const totalTasksCount = roadmap.tasks.length;
    const completedTasksCount = roadmap.tasks.filter((t) => t.status === 'completed').length;
    const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Phase completion logic
    let phasesCompleted = 0;
    ['phase_1', 'phase_2', 'phase_3', 'phase_4'].forEach((pId) => {
      const pTasks = roadmap.tasks.filter((t) => t.phaseId === pId);
      if (pTasks.length > 0 && pTasks.every((t) => t.status === 'completed' || t.status === 'skipped')) {
        phasesCompleted++;
      }
    });

    const skillsDemonstrated = roadmap.skillGaps.filter((g) => g.isDemonstrated).length;
    const hoursLogged = Math.round((roadmap.analytics?.totalHoursLogged || 0) * 10) / 10;

    return {
      overallProgress,
      phasesCompleted,
      skillsDemonstrated,
      completedTasksCount,
      totalTasksCount,
      hoursLogged,
    };
  }, [roadmap]);

  // Current learning phase derived from uncompleted tasks
  const currentPhaseTitle = useMemo(() => {
    if (!roadmap) return 'Phase 1: Foundations';
    for (const phase of roadmap.phases) {
      const phaseTasks = roadmap.tasks.filter((t) => t.phaseId === phase.phaseId);
      const isComplete = phaseTasks.length > 0 && phaseTasks.every((t) => t.status === 'completed' || t.status === 'skipped');
      if (!isComplete) {
        return phase.title;
      }
    }
    return 'Phase 4: Interview Readiness';
  }, [roadmap]);

  // Filtered Tasks for Weekly Plan
  const weeklyTasks = useMemo(() => {
    if (!roadmap) return [];
    return roadmap.tasks.filter((t) => {
      // In weekly tab, show tasks from Phase 1 and Phase 2 or scheduled
      if (taskStatusFilter === 'pending' && t.status === 'completed') return false;
      if (taskStatusFilter === 'completed' && t.status !== 'completed') return false;
      return true;
    });
  }, [roadmap, taskStatusFilter]);

  // Task type icon helper
  const getTaskTypeIcon = (type: RoadmapTask['taskType']) => {
    switch (type) {
      case 'coding':
        return <Code2 className="w-4 h-4 text-emerald-600" />;
      case 'sql':
        return <Database className="w-4 h-4 text-cyan-600" />;
      case 'assessment':
        return <ShieldCheck className="w-4 h-4 text-[#4F46D8]" />;
      case 'interview':
        return <Mic className="w-4 h-4 text-purple-600" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'debugging':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  // ─── Loading & Empty States ─────────────────────────────────────────────────

  if (authLoading || (loading && !roadmap)) {
    return (
      <AppShell>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin mx-auto" />
            <p className="text-lg font-bold text-[#171A35] font-['Outfit']">
              Synthesizing Personalized Improvement Plan...
            </p>
            <p className="text-sm text-[#77798B] max-w-sm">
              Analyzing your resume skills, target role criteria, and SkillProof assessment attempts.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ─── 1. Header Section ──────────────────────────────────────────────── */}
        <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#4F46D8]/5 via-[#6366F1]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4F46D8]/10 text-[#4F46D8] text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                Adaptive Career Roadmap
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#171A35] font-['Outfit'] tracking-tight">
                Personalized Improvement Planner
              </h1>
              <p className="text-base text-[#77798B] leading-relaxed">
                Turn your skill gaps into a structured learning plan and measurable career progress.
              </p>

              {/* Badges / Metadata */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {/* Target Role Selector */}
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F3F0FC] hover:bg-[#E9E4F8] border border-[#4F46D8]/20 text-[#4F46D8] text-sm font-semibold transition-all group"
                  title="Change Target Job Role"
                >
                  <Target className="w-4 h-4 text-[#4F46D8]" />
                  <span>Target Role: <strong>{roadmap?.targetRole || 'Select Role'}</strong></span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#4F46D8]/70 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {/* Current Learning Phase */}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5 text-[#4F46D8]" />
                  {currentPhaseTitle}
                </span>

                {/* Target Date */}
                {roadmap?.preferences?.targetCompletionDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B] text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#77798B]" />
                    Target: {new Date(roadmap.preferences.targetCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                onClick={() => setShowCustomTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] text-sm font-semibold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#4F46D8]" />
                Add Task
              </button>

              <button
                onClick={() => setShowPreferencesModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] text-sm font-semibold transition-all shadow-sm"
              >
                <Sliders className="w-4 h-4 text-[#77798B]" />
                Edit Goals
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] text-sm font-semibold transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-[#77798B]" />
                Export Progress
              </button>

              <button
                onClick={() => setShowRegenerateModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-sm font-semibold transition-all shadow-sm glow-sm"
              >
                <RotateCcw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                Regenerate Plan
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E7E1D4]/60 flex items-center justify-between text-xs text-[#77798B]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#77798B]" />
              Personalized roadmap designed to systematically build verified skills. Does not guarantee third-party employment or certifications.
            </span>
            <span className="hidden sm:inline">
              Last updated: {roadmap?.updatedAt ? new Date(roadmap.updatedAt).toLocaleDateString() : 'Today'}
            </span>
          </div>
        </div>

        {/* ─── 2. Progress Dashboard (4 Compact Stat Cards) ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Progress */}
          <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#77798B] text-xs font-bold uppercase tracking-wider">
              <span>Overall Progress</span>
              <span className="text-[#4F46D8] font-black text-sm">{stats.overallProgress}%</span>
            </div>
            <div className="text-2xl font-black text-[#171A35] font-['Outfit']">
              {stats.completedTasksCount} <span className="text-sm font-normal text-[#77798B]">of {stats.totalTasksCount} tasks</span>
            </div>
            <div className="w-full bg-[#FAF8F1] h-2.5 rounded-full overflow-hidden border border-[#E7E1D4]/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#4F46D8] to-[#6366F1] rounded-full"
              />
            </div>
          </div>

          {/* Card 2: Learning Phases Completed */}
          <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#77798B] text-xs font-bold uppercase tracking-wider">
              <span>Phases Completed</span>
              <span className="text-emerald-600 font-black text-sm">{stats.phasesCompleted}/4</span>
            </div>
            <div className="text-2xl font-black text-[#171A35] font-['Outfit']">
              Phase {Math.min(4, stats.phasesCompleted + 1)} <span className="text-sm font-normal text-[#77798B]">in focus</span>
            </div>
            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 4].map((pNum) => (
                <div
                  key={pNum}
                  className={`h-2 flex-1 rounded-full ${
                    pNum <= stats.phasesCompleted
                      ? 'bg-emerald-500'
                      : pNum === stats.phasesCompleted + 1
                      ? 'bg-[#4F46D8]'
                      : 'bg-[#E7E1D4]'
                  }`}
                  title={`Phase ${pNum}`}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Skills Demonstrated */}
          <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#77798B] text-xs font-bold uppercase tracking-wider">
              <span>Skills Demonstrated</span>
              <Link href="/skillproof" className="text-[#4F46D8] hover:underline text-xs flex items-center gap-0.5">
                SkillProof <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="text-2xl font-black text-[#171A35] font-['Outfit']">
              {stats.skillsDemonstrated} <span className="text-sm font-normal text-[#77798B]">verified skills</span>
            </div>
            <p className="text-xs text-[#77798B]">
              Passed with score ≥ 70% in objective technical round assessments.
            </p>
          </div>

          {/* Card 4: Hours Logged */}
          <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#77798B] text-xs font-bold uppercase tracking-wider">
              <span>Study Time Logged</span>
              <Clock className="w-4 h-4 text-[#77798B]" />
            </div>
            <div className="text-2xl font-black text-[#171A35] font-['Outfit']">
              {stats.hoursLogged} <span className="text-sm font-normal text-[#77798B]">hours total</span>
            </div>
            <p className="text-xs text-[#77798B]">
              {roadmap?.preferences?.studyDays?.length || 5} study days/week • {roadmap?.preferences?.dailyMinutes || 60}m/session
            </p>
          </div>
        </div>

        {/* ─── 3. Navigation Tabs ────────────────────────────────────────────── */}
        <div className="border-b border-[#E7E1D4] flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'weekly', label: 'Your Plan for This Week', icon: Calendar },
              { id: 'phases', label: 'Roadmap Phases', icon: Layers },
              { id: 'skills', label: 'Skill Gap Inventory', icon: ShieldCheck },
              { id: 'projects', label: 'Applied Capstone Project', icon: Briefcase },
              { id: 'certifications', label: 'Milestones & Certs', icon: Award },
              { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 py-3 px-3.5 sm:px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#4F46D8] text-[#4F46D8] bg-[#4F46D8]/5 rounded-t-xl'
                      : 'border-transparent text-[#77798B] hover:text-[#171A35] hover:border-[#E7E1D4]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 4. Tab Content ────────────────────────────────────────────────── */}

        {/* TAB 1: Weekly Plan */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {/* Weekly Header & Filters */}
            <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#171A35] font-['Outfit']">
                  Your Plan for This Week
                </h2>
                <p className="text-sm text-[#77798B]">
                  Prioritized tasks aligned with your available study schedule ({roadmap?.preferences?.studyDays?.join(', ')}).
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#77798B] font-semibold">Filter:</span>
                {(['all', 'pending', 'completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      taskStatusFilter === filter
                        ? 'bg-[#4F46D8] text-white shadow-sm'
                        : 'bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B] hover:text-[#171A35]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {weeklyTasks.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-12 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-[#171A35] font-['Outfit']">No tasks match your filter</h3>
                  <p className="text-sm text-[#77798B]">All weekly tasks have been cleared or no tasks found.</p>
                </div>
              ) : (
                weeklyTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`bg-[#FFFFFF] border rounded-2xl p-5 transition-all shadow-sm hover:shadow-md ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : task.priority === 'high'
                          ? 'border-[#E7E1D4] border-l-4 border-l-[#4F46D8]'
                          : 'border-[#E7E1D4]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1">
                          {/* Checkbox button */}
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-[#E7E1D4] hover:border-[#4F46D8] bg-[#FAF8F1]'
                            }`}
                            title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                          >
                            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Type Icon & Badge */}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] text-xs font-semibold capitalize">
                                {getTaskTypeIcon(task.taskType)}
                                {task.taskType}
                              </span>

                              {/* Skill Badge */}
                              <span className="px-2 py-0.5 rounded-md bg-[#4F46D8]/10 text-[#4F46D8] text-xs font-bold">
                                {task.skill}
                              </span>

                              {/* Priority Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${
                                  task.priority === 'high'
                                    ? 'bg-rose-100 text-rose-700'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {task.priority}
                              </span>

                              {/* Duration Pill */}
                              <span className="text-xs text-[#77798B] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimatedMinutes}m
                              </span>

                              {/* Scheduled Date */}
                              {task.scheduledDate && (
                                <span className="text-xs text-[#77798B] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>

                            <h3
                              className={`text-base font-bold text-[#171A35] ${
                                isCompleted ? 'line-through text-[#77798B]' : ''
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.objective && (
                              <p className="text-sm text-[#77798B] leading-relaxed">
                                {task.objective}
                              </p>
                            )}

                            {/* Recommended Learning Resource */}
                            {task.recommendedResource && (
                              <div className="pt-1 flex items-center gap-2 text-xs">
                                <span className="text-[#77798B]">Resource:</span>
                                <a
                                  href={task.recommendedResource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4F46D8] font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                  {task.recommendedResource.title}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <span className="text-[#77798B]">({task.recommendedResource.source})</span>
                              </div>
                            )}

                            {/* Completion Criteria */}
                            {task.completionCriteria && (
                              <p className="text-xs text-[#77798B]/90 italic">
                                Criteria: {task.completionCriteria}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col items-end gap-2 pt-2 sm:pt-0">
                          {task.relatedAction && !isCompleted && (
                            <Link
                              href={task.relatedAction.href}
                              className="px-3.5 py-1.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
                            >
                              <span>{task.relatedAction.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <div className="flex items-center gap-1">
                            {task.status !== 'in_progress' && !isCompleted && (
                              <button
                                onClick={() => handleSetInProgress(task)}
                                className="p-1.5 rounded-lg text-[#77798B] hover:text-[#4F46D8] hover:bg-[#FAF8F1] transition-colors"
                                title="Mark as In Progress"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1.5 rounded-lg text-[#77798B] hover:text-[#171A35] hover:bg-[#FAF8F1] transition-colors"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 rounded-lg text-[#77798B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Skip / Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Roadmap Phases */}
        {activeTab === 'phases' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#171A35] font-['Outfit']">
                Complete Career Roadmap Phases
              </h2>
              <p className="text-sm text-[#77798B]">
                Organized milestone progression from foundations to capstone project and interview clearance for {roadmap?.targetRole}.
              </p>
            </div>

            {roadmap?.phases.map((phase) => {
              const phaseTasks = roadmap.tasks.filter((t) => t.phaseId === phase.phaseId);
              const completedCount = phaseTasks.filter((t) => t.status === 'completed').length;
              const percent = phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0;
              const isExpanded = !!expandedPhases[phase.phaseId];

              return (
                <div
                  key={phase.phaseId}
                  className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Phase Accordion Header */}
                  <div
                    onClick={() =>
                      setExpandedPhases((prev) => ({
                        ...prev,
                        [phase.phaseId]: !prev[phase.phaseId],
                      }))
                    }
                    className="p-6 cursor-pointer hover:bg-[#FAF8F1]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#4F46D8]/10 text-[#4F46D8] text-xs font-bold uppercase tracking-wider">
                          Phase {phase.phaseNumber} • {phase.estimatedWeeks} Weeks
                        </span>
                        {percent === 100 && (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-[#171A35] font-['Outfit']">{phase.title}</h3>
                      <p className="text-sm text-[#77798B]">{phase.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-36 text-right">
                        <div className="text-xs font-bold text-[#171A35] mb-1">
                          {completedCount} / {phaseTasks.length} tasks ({percent}%)
                        </div>
                        <div className="w-full bg-[#FAF8F1] h-2 rounded-full overflow-hidden border border-[#E7E1D4]">
                          <div
                            className="bg-[#4F46D8] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35]">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Phase Content */}
                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-[#E7E1D4] space-y-4 bg-[#FAF8F1]/30">
                      {/* Phase Objectives & Criteria */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E1D4]">
                          <h4 className="font-bold text-[#171A35] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-[#4F46D8]" />
                            Key Learning Objectives
                          </h4>
                          <ul className="space-y-1 text-[#77798B] list-disc list-inside">
                            {phase.objectives.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E1D4]">
                          <h4 className="font-bold text-[#171A35] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Completion Criteria
                          </h4>
                          <p className="text-[#77798B] leading-relaxed">{phase.completionCriteria}</p>
                        </div>
                      </div>

                      {/* Phase Tasks */}
                      <div className="space-y-2 pt-2">
                        {phaseTasks.map((task) => {
                          const isDone = task.status === 'completed';
                          return (
                            <div
                              key={task.id}
                              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                isDone
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : 'bg-[#FFFFFF] border-[#E7E1D4]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleToggleTaskStatus(task)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                    isDone
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-[#E7E1D4] hover:border-[#4F46D8] bg-[#FAF8F1]'
                                  }`}
                                >
                                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>
                                <div>
                                  <div
                                    className={`text-sm font-semibold text-[#171A35] ${
                                      isDone ? 'line-through text-[#77798B]' : ''
                                    }`}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="text-xs text-[#77798B] flex items-center gap-2">
                                    <span>{task.skill}</span>
                                    <span>•</span>
                                    <span>{task.estimatedMinutes}m</span>
                                  </div>
                                </div>
                              </div>

                              {task.relatedAction && !isDone && (
                                <Link
                                  href={task.relatedAction.href}
                                  className="px-3 py-1 rounded-lg bg-[#F3F0FC] hover:bg-[#4F46D8] hover:text-white text-[#4F46D8] text-xs font-semibold transition-all"
                                >
                                  {task.relatedAction.label}
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Skill Gap Inventory */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#171A35] font-['Outfit']">
                Resume-Driven Skill Gap Inventory
              </h2>
              <p className="text-sm text-[#77798B]">
                Synthesized by analyzing your uploaded resume against {roadmap?.targetRole} qualifications and your SkillProof assessment scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap?.skillGaps.map((gap, idx) => {
                const isDemonstrated = gap.isDemonstrated;
                return (
                  <div
                    key={idx}
                    className={`bg-[#FFFFFF] border rounded-2xl p-5 shadow-sm space-y-3 ${
                      isDemonstrated
                        ? 'border-emerald-200'
                        : gap.category === 'low_score'
                        ? 'border-rose-200 border-l-4 border-l-rose-500'
                        : gap.category === 'missing_evidence'
                        ? 'border-amber-200 border-l-4 border-l-amber-500'
                        : 'border-[#E7E1D4]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#171A35] font-['Outfit']">{gap.skill}</span>
                        {isDemonstrated ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Demonstrated
                          </span>
                        ) : gap.category === 'low_score' ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold">
                            Score: {gap.latestScore}% (Needs Practice)
                          </span>
                        ) : gap.category === 'missing_evidence' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
                            Missing from Resume
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold capitalize">
                            {gap.category}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-semibold uppercase ${
                          gap.importance === 'high' ? 'text-rose-600' : 'text-[#77798B]'
                        }`}
                      >
                        {gap.importance} Priority
                      </span>
                    </div>

                    <p className="text-xs text-[#77798B] leading-relaxed">
                      <strong>Why Recommended:</strong> {gap.reason}
                    </p>

                    {gap.weakTopics && gap.weakTopics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-[#77798B]">Focus topics:</span>
                        {gap.weakTopics.map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-[#E7E1D4]/60 text-xs">
                      <span className="text-[#77798B]">
                        Resume evidence: {gap.inResume ? 'Detected' : 'Not detected'}
                      </span>
                      <Link
                        href={`/skillproof`}
                        className="text-[#4F46D8] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {gap.assessmentAttempted ? 'Retake in SkillProof' : 'Take Diagnostic'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Applied Capstone Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#171A35] font-['Outfit']">
                Applied Portfolio Capstone Project
              </h2>
              <p className="text-sm text-[#77798B]">
                High-impact portfolio projects designed to demonstrate production readiness for {roadmap?.targetRole}.
              </p>
            </div>

            {roadmap?.projects.map((proj) => {
              const completedCount = proj.checklist.filter((c) => c.completed).length;
              const isAllDone = proj.checklist.length > 0 && completedCount === proj.checklist.length;

              return (
                <div key={proj.id} className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#4F46D8]/10 text-[#4F46D8] text-xs font-bold">
                        Capstone Project
                      </div>
                      <h3 className="text-xl font-black text-[#171A35] font-['Outfit']">{proj.title}</h3>
                      <p className="text-sm text-[#77798B]">{proj.objective}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isAllDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : completedCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isAllDone ? 'Project Completed' : `${completedCount} of ${proj.checklist.length} Milestones Shipped`}
                      </span>
                    </div>
                  </div>

                  {/* Required Skills Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#77798B] font-semibold">Technologies demonstrated:</span>
                    {proj.requiredSkills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] text-xs font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Interactive Deliverable Checklist */}
                  <div className="space-y-3 bg-[#FAF8F1] p-5 rounded-xl border border-[#E7E1D4]">
                    <h4 className="text-xs font-bold text-[#171A35] uppercase tracking-wider">
                      Interactive Deliverable Checklist
                    </h4>
                    <div className="space-y-2">
                      {proj.checklist.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleToggleProjectChecklist(proj.id, i)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                        >
                          {c.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-[#77798B]" />
                          )}
                          <span
                            className={`text-sm ${
                              c.completed ? 'line-through text-[#77798B]' : 'text-[#171A35] font-medium'
                            }`}
                          >
                            {c.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Deliverables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-[#E7E1D4] space-y-2">
                      <h4 className="font-bold text-[#171A35] uppercase tracking-wider">Expected Deliverables</h4>
                      <ul className="space-y-1 text-[#77798B] list-disc list-inside">
                        {proj.deliverables.map((deliv, i) => (
                          <li key={i}>{deliv}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E7E1D4] space-y-2">
                      <h4 className="font-bold text-[#171A35] uppercase tracking-wider">Recommended Documentation</h4>
                      <div className="space-y-1.5">
                        {proj.resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4F46D8] font-semibold hover:underline block flex items-center gap-1"
                          >
                            {res.title}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: Milestones & External Certification Guides */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#171A35] font-['Outfit']">
                Milestones & Industry Certification Path
              </h2>
              <p className="text-sm text-[#77798B]">
                Meaningful career readiness milestones and trusted external industry certification preparation guides.
              </p>
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap?.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`bg-[#FFFFFF] border rounded-2xl p-5 shadow-sm space-y-3 ${
                    m.completed ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#E7E1D4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          m.completed ? 'bg-emerald-600 text-white' : 'bg-[#FAF8F1] text-[#77798B] border border-[#E7E1D4]'
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#171A35] font-['Outfit']">{m.title}</h4>
                        <span className="text-xs text-[#77798B] capitalize">{m.type.replace('_', ' ')} Milestone</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        m.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.completed ? 'Achieved' : 'In Progress'}
                    </span>
                  </div>

                  <p className="text-xs text-[#77798B] leading-relaxed">{m.description}</p>

                  {/* Certification Info Guide */}
                  {m.certificationInfo && (
                    <div className="bg-[#FAF8F1] p-3.5 rounded-xl border border-[#E7E1D4] space-y-2 text-xs">
                      <div className="font-bold text-[#171A35]">{m.certificationInfo.name}</div>
                      <div className="text-[#77798B]">Issuing Organization: {m.certificationInfo.issuingOrg}</div>
                      <p className="text-[11px] text-[#77798B] italic">{m.certificationInfo.disclaimer}</p>
                      <a
                        href={m.certificationInfo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F46D8] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        View Official Exam Blueprint & Syllabus
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Progress Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#171A35] font-['Outfit']">
                Real Progress Analytics
              </h2>
              <p className="text-sm text-[#77798B]">
                Visual summary derived directly from your completed roadmap tasks and SkillProof assessment attempts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phase Completion Breakdown */}
              <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#171A35] font-['Outfit']">
                  Roadmap Phases Progression
                </h3>
                <div className="space-y-3">
                  {roadmap?.phases.map((p) => {
                    const pTasks = roadmap.tasks.filter((t) => t.phaseId === p.phaseId);
                    const done = pTasks.filter((t) => t.status === 'completed').length;
                    const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
                    return (
                      <div key={p.phaseId} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#171A35]">{p.title}</span>
                          <span className="text-[#4F46D8]">{done}/{pTasks.length} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-[#FAF8F1] h-2 rounded-full overflow-hidden border border-[#E7E1D4]">
                          <div className="bg-[#4F46D8] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task Types Distribution */}
              <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#171A35] font-['Outfit']">
                  Learning Activity Types
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['concept', 'coding', 'sql', 'assessment', 'interview', 'project'].map((type) => {
                    const count = roadmap?.tasks.filter((t) => t.taskType === type).length || 0;
                    const completed = roadmap?.tasks.filter((t) => t.taskType === type && t.status === 'completed').length || 0;
                    return (
                      <div key={type} className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-xs space-y-1">
                        <div className="font-bold text-[#171A35] capitalize">{type}</div>
                        <div className="text-[#77798B]">
                          {completed} of {count} completed
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODALS ────────────────────────────────────────────────────────── */}

        {/* Modal 1: Edit Goals & Preferences */}
        <AnimatePresence>
          {showPreferencesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D4]">
                  <h3 className="text-lg font-bold text-[#171A35] font-['Outfit']">Edit Goals & Study Schedule</h3>
                  <button onClick={() => setShowPreferencesModal(false)} className="text-[#77798B] hover:text-[#171A35]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-4 text-sm">
                  {/* Study Days */}
                  <div>
                    <label className="block text-xs font-bold text-[#171A35] uppercase tracking-wider mb-2">
                      Available Study Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                        const isSelected = preferencesForm.studyDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => {
                              const updated = isSelected
                                ? preferencesForm.studyDays.filter((d) => d !== day)
                                : [...preferencesForm.studyDays, day];
                              setPreferencesForm({ ...preferencesForm, studyDays: updated });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-[#4F46D8] border-[#4F46D8] text-white'
                                : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B] hover:text-[#171A35]'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Study Minutes */}
                  <div>
                    <label className="block text-xs font-bold text-[#171A35] uppercase tracking-wider mb-2">
                      Daily Study Target (Minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 45, 60, 90].map((mins) => (
                        <button
                          type="button"
                          key={mins}
                          onClick={() => setPreferencesForm({ ...preferencesForm, dailyMinutes: mins })}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                            preferencesForm.dailyMinutes === mins
                              ? 'bg-[#4F46D8] border-[#4F46D8] text-white'
                              : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#171A35]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Study Hours */}
                  <div>
                    <label className="block text-xs font-bold text-[#171A35] uppercase tracking-wider mb-2">
                      Preferred Study Hours
                    </label>
                    <input
                      type="text"
                      value={preferencesForm.preferredHours || ''}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, preferredHours: e.target.value })}
                      placeholder="e.g. Evenings (7:00 PM - 8:30 PM)"
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46D8]/20 focus:border-[#4F46D8]"
                    />
                  </div>

                  {/* Target Completion Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#171A35] uppercase tracking-wider mb-2">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={
                        preferencesForm.targetCompletionDate
                          ? new Date(preferencesForm.targetCompletionDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setPreferencesForm({
                          ...preferencesForm,
                          targetCompletionDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46D8]/20 focus:border-[#4F46D8]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E1D4]">
                    <button
                      type="button"
                      onClick={() => setShowPreferencesModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E7E1D4] text-xs font-semibold text-[#77798B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold"
                    >
                      Save Preferences
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 2: Add Custom Task */}
        <AnimatePresence>
          {showCustomTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D4]">
                  <h3 className="text-lg font-bold text-[#171A35] font-['Outfit']">Add Personal Learning Task</h3>
                  <button onClick={() => setShowCustomTaskModal(false)} className="text-[#77798B] hover:text-[#171A35]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddCustomTask} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomTask.title}
                      onChange={(e) => setNewCustomTask({ ...newCustomTask, title: e.target.value })}
                      placeholder="e.g. Build GraphQL schema for product catalog"
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] focus:outline-none focus:ring-2 focus:ring-[#4F46D8]/20 focus:border-[#4F46D8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">
                      Skill or Topic
                    </label>
                    <input
                      type="text"
                      value={newCustomTask.skill}
                      onChange={(e) => setNewCustomTask({ ...newCustomTask, skill: e.target.value })}
                      placeholder="e.g. GraphQL"
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] focus:outline-none focus:ring-2 focus:ring-[#4F46D8]/20 focus:border-[#4F46D8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Priority</label>
                      <select
                        value={newCustomTask.priority}
                        onChange={(e) => setNewCustomTask({ ...newCustomTask, priority: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Estimated Duration</label>
                      <select
                        value={newCustomTask.estimatedMinutes}
                        onChange={(e) => setNewCustomTask({ ...newCustomTask, estimatedMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                      >
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                        <option value={90}>90 mins</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">
                      Learning Objective / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={newCustomTask.objective}
                      onChange={(e) => setNewCustomTask({ ...newCustomTask, objective: e.target.value })}
                      placeholder="What should you achieve by completing this task?"
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] focus:outline-none focus:ring-2 focus:ring-[#4F46D8]/20 focus:border-[#4F46D8]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E1D4]">
                    <button
                      type="button"
                      onClick={() => setShowCustomTaskModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E7E1D4] font-semibold text-[#77798B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white font-semibold"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 3: Change Target Role */}
        <AnimatePresence>
          {showRoleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D4]">
                  <div>
                    <h3 className="text-lg font-bold text-[#171A35] font-['Outfit']">Select Target Job Role</h3>
                    <p className="text-xs text-[#77798B]">Generates custom learning milestones and projects tailored to this career path.</p>
                  </div>
                  <button onClick={() => setShowRoleModal(false)} className="text-[#77798B] hover:text-[#171A35]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {ROLE_CATEGORIES.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-xs font-bold text-[#77798B] uppercase tracking-wider">{cat.category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.roles.map((r, rIdx) => {
                          const isSelected = roadmap?.targetRole === r.label;
                          return (
                            <button
                              key={rIdx}
                              onClick={() => handleSelectRole(r.label)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-[#4F46D8] border-[#4F46D8] text-white shadow-sm'
                                  : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#171A35] hover:border-[#4F46D8]/50'
                              }`}
                            >
                              <span>{r.label}</span>
                              {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 4: Regenerate Confirmation */}
        <AnimatePresence>
          {showRegenerateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#4F46D8] flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171A35] font-['Outfit']">Regenerate Roadmap?</h3>
                    <p className="text-xs text-[#77798B]">Re-analyzes your latest resume and assessment scores.</p>
                  </div>
                </div>

                <p className="text-xs text-[#77798B] leading-relaxed">
                  Your completed tasks and historical progress will be preserved automatically. The planner will update task priorities based on your newest SkillProof scores.
                </p>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E1D4]">
                  <button
                    onClick={() => setShowRegenerateModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E7E1D4] text-xs font-semibold text-[#77798B]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRegenerateRoadmap(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    Confirm & Refresh
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 5: Export Progress Modal */}
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D4]">
                  <div>
                    <h3 className="text-lg font-bold text-[#171A35] font-['Outfit']">Export Career Progress Report</h3>
                    <p className="text-xs text-[#77798B]">Comprehensive summary of verified skills, completed tasks, and next steps.</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="text-[#77798B] hover:text-[#171A35]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#FAF8F1] p-5 rounded-xl border border-[#E7E1D4] space-y-4 text-xs font-mono">
                  <div className="font-bold text-[#171A35] text-sm font-['Outfit']">
                    ElevateAI Career Readiness & Improvement Report
                  </div>
                  <div>Target Role: {roadmap?.targetRole}</div>
                  <div>Overall Completion: {stats.overallProgress}% ({stats.completedTasksCount} / {stats.totalTasksCount} tasks)</div>
                  <div>Demonstrated Skills: {stats.skillsDemonstrated} verified competencies</div>
                  <div>Total Hours Logged: {stats.hoursLogged} hours</div>

                  <div className="border-t border-[#E7E1D4] pt-2">
                    <div className="font-bold mb-1">Demonstrated Competencies (Score ≥ 70%):</div>
                    {roadmap?.skillGaps.filter((g) => g.isDemonstrated).map((g, i) => (
                      <div key={i}>• {g.skill} (Score: {g.latestScore}%)</div>
                    ))}
                  </div>

                  <div className="border-t border-[#E7E1D4] pt-2">
                    <div className="font-bold mb-1">Active Priority Gaps:</div>
                    {roadmap?.skillGaps.filter((g) => !g.isDemonstrated).slice(0, 4).map((g, i) => (
                      <div key={i}>• {g.skill}: {g.reason}</div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E1D4]">
                  <button
                    onClick={() => {
                      const jsonStr = JSON.stringify(roadmap, null, 2);
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `career-roadmap-${roadmap?.targetRole.toLowerCase().replace(/\s+/g, '-')}.json`;
                      a.click();
                      toast.success('Roadmap JSON exported!');
                    }}
                    className="px-4 py-2 rounded-xl border border-[#E7E1D4] text-xs font-semibold text-[#171A35] hover:bg-[#FAF8F1]"
                  >
                    Download JSON
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print / Save PDF
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 6: Edit Single Task */}
        <AnimatePresence>
          {editingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D4]">
                  <h3 className="text-lg font-bold text-[#171A35] font-['Outfit']">Edit Task</h3>
                  <button onClick={() => setEditingTask(null)} className="text-[#77798B] hover:text-[#171A35]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditedTask} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Title</label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={editingTask.status}
                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Estimated Minutes</label>
                      <input
                        type="number"
                        value={editingTask.estimatedMinutes}
                        onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Objective</label>
                    <textarea
                      rows={2}
                      value={editingTask.objective || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, objective: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#171A35] uppercase tracking-wider mb-1">Personal Notes</label>
                    <textarea
                      rows={2}
                      value={editingTask.notes || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                      placeholder="Add personal notes or links..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E1D4]">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 rounded-xl border border-[#E7E1D4] font-semibold text-[#77798B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
