'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

interface RoadmapTask {
  id: string;
  milestone: number;
  title: string;
  desc: string;
  category: 'resume' | 'skillproof' | 'project' | 'interview';
  actionHref?: string;
  actionLabel?: string;
}

const DEFAULT_ROADMAP_TASKS: RoadmapTask[] = [
  // Milestone 1
  {
    id: 'task_1',
    milestone: 1,
    title: 'Audit Resume ATS Compatibility & Formatting',
    desc: 'Review weak sections and ensure clean machine readability with ATS score >= 80%.',
    category: 'resume',
    actionHref: '/resume-studio',
    actionLabel: 'Open Resume Studio',
  },
  {
    id: 'task_2',
    milestone: 1,
    title: 'Rewrite Bullet Points with Quantified Metrics',
    desc: 'Adopt action verbs and measurable business impacts (e.g. "Reduced query latency by 45%").',
    category: 'resume',
    actionHref: '/resume-studio',
    actionLabel: 'Review AI Suggestions',
  },
  {
    id: 'task_3',
    milestone: 1,
    title: 'Run Job Matcher against 2 Target Roles',
    desc: 'Identify missing required technologies and keyword density gaps.',
    category: 'resume',
    actionHref: '/job-matcher',
    actionLabel: 'Run Job Match',
  },

  // Milestone 2
  {
    id: 'task_4',
    milestone: 2,
    title: 'Pass Python Core & Architecture SkillProof',
    desc: 'Prove objective mastery in decorators, generators, mutable defaults, and async.',
    category: 'skillproof',
    actionHref: '/skillproof',
    actionLabel: 'Take Assessment',
  },
  {
    id: 'task_5',
    milestone: 2,
    title: 'Earn SQL & Database Architecture Credential',
    desc: 'Demonstrate competency in window functions, indexing strategies, and transaction isolation.',
    category: 'skillproof',
    actionHref: '/skillproof',
    actionLabel: 'Take SQL Test',
  },
  {
    id: 'task_6',
    milestone: 2,
    title: 'Verify JavaScript & TypeScript Fundamentals',
    desc: 'Complete technical assessment covering closures, event loop microtasks, and type narrowing.',
    category: 'skillproof',
    actionHref: '/skillproof',
    actionLabel: 'Verify JS/TS',
  },

  // Milestone 3
  {
    id: 'task_7',
    milestone: 3,
    title: 'Architect Full-Stack Application with Docker & CI/CD',
    desc: 'Deploy a containerized application with automated testing and relational persistence.',
    category: 'project',
  },
  {
    id: 'task_8',
    milestone: 3,
    title: 'Document System Architecture & README in GitHub',
    desc: 'Include architecture diagrams, API schemas, and performance benchmarks.',
    category: 'project',
  },

  // Milestone 4
  {
    id: 'task_9',
    milestone: 4,
    title: 'Complete Role-Specific Mock Interview Simulation',
    desc: 'Practice technical problem breakdown and live conversational responses in Interview Lab.',
    category: 'interview',
    actionHref: '/interview',
    actionLabel: 'Launch Interview',
  },
  {
    id: 'task_10',
    milestone: 4,
    title: 'Master STAR Behavioral Questions',
    desc: 'Formulate crisp narratives for conflict resolution, failure recovery, and cross-team leadership.',
    category: 'interview',
    actionHref: '/interview',
    actionLabel: 'Practice Behavioral',
  },
  {
    id: 'task_11',
    milestone: 4,
    title: 'Export Official Career Readiness Report',
    desc: 'Compile resume health, verified SkillProof credentials, and mock interview rubric scores.',
    category: 'resume',
    actionHref: '/reports',
    actionLabel: 'Generate Report',
  },
];

const MILESTONE_TITLES = [
  'Phase 1: ATS Baseline & Resume Optimization',
  'Phase 2: Technical Competence & SkillProof Verification',
  'Phase 3: High-Impact Portfolio Development',
  'Phase 4: Mock Interview Mastery & Final Readiness',
];

export default function CareerRoadmapPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load completed tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('resumeai_roadmap_tasks');
      if (stored) {
        setCompletedTaskIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume');
      const list: Resume[] = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0 && list[0].targetRole) {
        setTargetRole(list[0].targetRole);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
  }, [isAuthenticated, fetchResumes]);

  const toggleTask = (taskId: string) => {
    let updated: string[];
    if (completedTaskIds.includes(taskId)) {
      updated = completedTaskIds.filter((id) => id !== taskId);
    } else {
      updated = [...completedTaskIds, taskId];
      toast.success('Milestone task completed!');
    }
    setCompletedTaskIds(updated);
    localStorage.setItem('resumeai_roadmap_tasks', JSON.stringify(updated));
  };

  const progressPct = Math.round(
    (completedTaskIds.length / DEFAULT_ROADMAP_TASKS.length) * 100
  );

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              Career Roadmap • Milestone Progression
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            Target Role Progression Plan
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            A sequenced, actionable roadmap calibrated to your resume analysis and technical skill gaps
          </p>
        </div>

        {/* Target role selector */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#E7E1D4] self-start sm:self-auto">
          <Target className="w-4 h-4 text-[#4F46D8]" />
          <span className="text-xs text-[#77798B]">Target Role:</span>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="text-xs font-bold text-[#171A35] bg-transparent border-none focus:outline-none w-36 sm:w-44"
          />
        </div>
      </div>

      {/* ─── Overall Progression Progress Bar ─────────────────────────────── */}
      <div className="mb-8 rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#171A35]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4F46D8]" />
            <span>Overall Roadmap Completion</span>
          </div>
          <span className="font-extrabold text-[#4F46D8]">{progressPct}% Complete</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-[#FAF8F1] overflow-hidden border border-[#E7E1D4]">
          <div
            className="h-full rounded-full bg-[#4F46D8] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-[#77798B] pt-0.5">
          <span>{completedTaskIds.length} of {DEFAULT_ROADMAP_TASKS.length} tasks accomplished</span>
          <span>Targeting {targetRole} Readiness</span>
        </div>
      </div>

      {/* ─── Sequenced Roadmap Milestones ─────────────────────────────────── */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((milestoneNum) => {
          const milestoneTasks = DEFAULT_ROADMAP_TASKS.filter(
            (t) => t.milestone === milestoneNum
          );
          const completedCount = milestoneTasks.filter((t) =>
            completedTaskIds.includes(t.id)
          ).length;
          const isAllDone = completedCount === milestoneTasks.length;

          return (
            <div
              key={milestoneNum}
              className={`rounded-2xl p-5 sm:p-6 bg-[#FFFFFF] border shadow-xs transition-all ${
                isAllDone ? 'border-[#168575]/40' : 'border-[#E7E1D4]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D4] mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isAllDone
                        ? 'bg-[#168575] text-white'
                        : 'bg-[#F3F0FC] text-[#4F46D8]'
                    }`}
                  >
                    {isAllDone ? '✓' : milestoneNum}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                      {MILESTONE_TITLES[milestoneNum - 1]}
                    </h2>
                    <p className="text-[11px] text-[#77798B]">
                      {completedCount} of {milestoneTasks.length} milestones checked
                    </p>
                  </div>
                </div>

                {isAllDone && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#168575]/15 text-[#168575]">
                    Phase Completed
                  </span>
                )}
              </div>

              {/* Task Items */}
              <div className="space-y-3">
                {milestoneTasks.map((task) => {
                  const isDone = completedTaskIds.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all gap-2 ${
                        isDone
                          ? 'bg-[#168575]/5 border-[#168575]/30 text-[#171A35]'
                          : 'bg-[#FAF8F1] border-[#E7E1D4] hover:border-[#4F46D8]/40 text-[#171A35]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="mt-0.5 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#168575]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#77798B]" />
                          )}
                        </button>
                        <div>
                          <p
                            className={`font-bold ${
                              isDone ? 'line-through text-[#77798B]' : 'text-[#171A35]'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[11px] text-[#77798B] mt-0.5">{task.desc}</p>
                        </div>
                      </div>

                      {task.actionHref && (
                        <div
                          className="self-end sm:self-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={task.actionHref}>
                            <button className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#FFFFFF] border border-[#E7E1D4] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-all shadow-xs flex items-center gap-1">
                              <span>{task.actionLabel || 'Action'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Practical Portfolio Projects Blueprint ───────────────────────── */}
      <div className="mt-8 rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#4F46D8]" />
          <span>Recommended Capstone Portfolio Projects for {targetRole}</span>
        </h3>
        <p className="text-xs text-[#77798B]">
          Building demonstrable open-source projects provides indisputable evidence of ability during technical interviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2 text-xs">
            <span className="font-bold text-[#4F46D8] block">
              Project A: Distributed Real-Time Workflow Engine
            </span>
            <p className="text-[11px] text-[#77798B] leading-relaxed">
              Build a task orchestration service with FastAPI/Node.js, Redis job queues, and WebSocket status streaming. Demonstrates concurrency, asynchronous workers, and database transactions.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Docker', 'Redis', 'PostgreSQL', 'WebSockets', 'FastAPI'].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E7E1D4] text-[10px] font-semibold text-[#171A35]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2 text-xs">
            <span className="font-bold text-[#168575] block">
              Project B: High-Throughput Metrics & Analytics Dashboard
            </span>
            <p className="text-[11px] text-[#77798B] leading-relaxed">
              Design a modern analytics web interface with Next.js, Server Components, caching layer, and optimized SQL aggregations with window functions.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Next.js', 'TypeScript', 'Tailwind', 'SQL Aggregations', 'Chart.js'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E7E1D4] text-[10px] font-semibold text-[#171A35]"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
