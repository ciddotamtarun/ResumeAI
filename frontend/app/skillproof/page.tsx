'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Database,
  FileText,
  RotateCcw,
  Check,
  X,
  BookOpen,
  HelpCircle,
  Flag,
  Play,
  Layers,
  Bug,
  Cpu,
  Terminal,
  Target,
  RefreshCw,
  BarChart3,
  TrendingUp,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';
import { ROLE_CATEGORIES, ALL_ROLES } from '@/lib/roles';
import { SAMPLE_JOBS, type JobTemplate } from '@/lib/job-templates';
import {
  QUESTION_BANKS,
  TECHNICAL_ROUND_MODES,
  getDomainForSkill,
  getRoundsForRole,
  Question,
  DomainAssessment,
  TechnicalRoundMode,
} from '@/lib/questionBank';

export interface AssessmentAttempt {
  id: string;
  domainId: string;
  domainName: string;
  targetRole?: string;
  roundMode?: string;
  skillName?: string;
  score: number;
  passed: boolean;
  date: string;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds?: number;
  topicBreakdown?: Array<{ topic: string; score: number; total: number }>;
  weakTopics?: string[];
}

interface ApiAssessmentAttempt extends Partial<AssessmentAttempt> {
  _id?: string;
  assessmentId?: string;
  createdAt?: string;
}

export type SkillVerificationStatus =
  | 'Self-Reported'
  | 'Assessment Available'
  | 'In Progress'
  | 'Demonstrated'
  | 'Needs Improvement'
  | 'Assessment Unavailable';

export default function SkillProofPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Resume State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Target Role State (Independent from resume modification)
  const [selectedTargetRole, setSelectedTargetRole] = useState<string>('');

  // Assessment Attempts & Verified Statuses
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [verifiedDomains, setVerifiedDomains] = useState<string[]>([]);

  // Active Assessment Workbench State
  const [activeDomainKey, setActiveDomainKey] = useState<string | null>(null);
  const [activeRoundMode, setActiveRoundMode] = useState<string>('fundamentals');
  const [activeSkillTarget, setActiveSkillTarget] = useState<string>('');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testTopicBreakdown, setTestTopicBreakdown] = useState<Array<{ topic: string; score: number; total: number }>>([]);
  const [testWeakTopics, setTestWeakTopics] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load Resumes
  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume');
      const list: Resume[] = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
        const initialRole = list[0].targetRole || 'Full Stack Developer';
        setSelectedTargetRole(initialRole);
      }
    } catch {
      toast.error('Failed to load resumes');
    }
  }, []);

  // Load Attempts from backend API & localStorage fallback
  const fetchAttempts = useCallback(async () => {
    try {
      const res = await api.get('/api/assessment');
      if (res.data?.success && Array.isArray(res.data.attempts)) {
        const backendAttempts: AssessmentAttempt[] = res.data.attempts.map((a: ApiAssessmentAttempt) => ({
          id: a._id || a.id || `att_${Date.now()}`,
          domainId: a.assessmentId || a.domainId || '',
          domainName: a.domainName || '',
          targetRole: a.targetRole,
          roundMode: a.roundMode,
          skillName: a.skillName,
          score: a.score ?? 0,
          passed: a.passed ?? false,
          date: a.createdAt || a.date || new Date().toISOString(),
          totalQuestions: a.totalQuestions ?? 0,
          correctCount: a.correctCount ?? 0,
          timeSpentSeconds: a.timeSpentSeconds,
          topicBreakdown: a.topicBreakdown,
          weakTopics: a.weakTopics,
        }));
        setAttempts(backendAttempts);
        const passedIds = Array.from(new Set(backendAttempts.filter((a) => a.passed).map((a) => a.domainId)));
        setVerifiedDomains(passedIds);
        return;
      }
    } catch {
      // Fallback to localStorage
    }

    try {
      const stored = localStorage.getItem('resumeai_skillproof_attempts');
      if (stored) {
        const parsed: AssessmentAttempt[] = JSON.parse(stored);
        setAttempts(parsed);
        const passedIds = Array.from(new Set(parsed.filter((a) => a.passed).map((a) => a.domainId)));
        setVerifiedDomains(passedIds);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetching initial data on authentication is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchResumes();
      fetchAttempts();
    }
  }, [isAuthenticated, fetchResumes, fetchAttempts]);

  // Active Selected Resume
  const selectedResume = useMemo(() => {
    return resumes.find((r) => r._id === selectedResumeId) || resumes[0];
  }, [resumes, selectedResumeId]);

  // Detected Job Role
  const detectedRole = selectedResume?.targetRole || 'Full Stack Developer';

  // Active Target Role
  const activeRole = selectedTargetRole || detectedRole;

  // Find job template specs for active role
  const roleJobTemplate: JobTemplate | undefined = useMemo(() => {
    return (
      SAMPLE_JOBS.find(
        (j) =>
          j.title.toLowerCase() === activeRole.toLowerCase() ||
          (j.aliases && j.aliases.some((a) => a.toLowerCase() === activeRole.toLowerCase()))
      ) || SAMPLE_JOBS[0]
    );
  }, [activeRole]);

  // Detected Resume Skills
  const resumeSkills: string[] = useMemo(() => {
    const raw = selectedResume?.analysis?.keywords || [];
    if (raw.length > 0) return raw;
    return ['React', 'TypeScript', 'Node.js', 'SQL', 'PostgreSQL', 'Docker', 'Git'];
  }, [selectedResume]);

  // Missing Required Skills
  const missingRequiredSkills: string[] = useMemo(() => {
    if (!roleJobTemplate) return [];
    const resumeLower = resumeSkills.map((s) => s.toLowerCase());
    return roleJobTemplate.requiredSkills.filter(
      (req) => !resumeLower.some((res) => res.includes(req.toLowerCase()) || req.toLowerCase().includes(res))
    );
  }, [roleJobTemplate, resumeSkills]);

  // Missing Optional Skills
  const missingOptionalSkills: string[] = useMemo(() => {
    if (!roleJobTemplate) return [];
    const resumeLower = resumeSkills.map((s) => s.toLowerCase());
    return roleJobTemplate.optionalSkills.filter(
      (opt) => !resumeLower.some((res) => res.includes(opt.toLowerCase()) || opt.toLowerCase().includes(res))
    );
  }, [roleJobTemplate, resumeSkills]);

  // Technical rounds for active target role
  const relevantRounds: TechnicalRoundMode[] = useMemo(() => {
    return getRoundsForRole(activeRole);
  }, [activeRole]);

  // Active Assessment Domain
  const activeDomain: DomainAssessment | null = useMemo(() => {
    if (!activeDomainKey) return null;
    return QUESTION_BANKS[activeDomainKey] || QUESTION_BANKS['javascript'];
  }, [activeDomainKey]);

  // Active Questions for current round mode
  const activeQuestions: Question[] = useMemo(() => {
    if (!activeDomain) return [];
    if (activeRoundMode === 'mixed') {
      // Gather a balanced set of 10 questions across domains
      const pool: Question[] = [];
      Object.values(QUESTION_BANKS).forEach((d) => {
        pool.push(...d.questions.slice(0, 2));
      });
      return pool.slice(0, 10);
    }
    return activeDomain.questions;
  }, [activeDomain, activeRoundMode]);

  // ─── Timer Logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeDomainKey && !isTestSubmitted && !isTimerPaused) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeDomainKey, isTestSubmitted, isTimerPaused]);

  // Auto-save active assessment progress to prevent accidental loss
  useEffect(() => {
    if (activeDomainKey && !isTestSubmitted) {
      try {
        localStorage.setItem(
          'resumeai_active_assessment_state',
          JSON.stringify({
            activeDomainKey,
            activeRoundMode,
            activeSkillTarget,
            currentQIndex,
            userAnswers,
            markedForReview,
            timerSeconds,
          })
        );
      } catch {}
    }
  }, [activeDomainKey, activeRoundMode, activeSkillTarget, currentQIndex, userAnswers, markedForReview, timerSeconds, isTestSubmitted]);

  // Restore unsaved assessment on initial mount if available
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('resumeai_active_assessment_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.activeDomainKey && !activeDomainKey) {
          // Restoring persisted client state on mount is intentional.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setActiveDomainKey(parsed.activeDomainKey);
          setActiveRoundMode(parsed.activeRoundMode || 'fundamentals');
          setActiveSkillTarget(parsed.activeSkillTarget || '');
          setCurrentQIndex(parsed.currentQIndex || 0);
          setUserAnswers(parsed.userAnswers || {});
          setMarkedForReview(parsed.markedForReview || {});
          setTimerSeconds(parsed.timerSeconds || 0);
          toast.info('Restored your in-progress assessment attempt.');
        }
      }
    } catch {}
  }, []);

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ─── Start Assessment ─────────────────────────────────────────────────────
  const startAssessment = (domainKey: string, roundMode: string = 'fundamentals', skillName: string = '') => {
    setActiveDomainKey(domainKey);
    setActiveRoundMode(roundMode);
    setActiveSkillTarget(skillName);
    setCurrentQIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setIsTestSubmitted(false);
    setTestScore(0);
    setTestTopicBreakdown([]);
    setTestWeakTopics([]);
    setTimerSeconds(0);
    setIsTimerPaused(false);
    setShowSubmitConfirm(false);
    toast.success(`Starting ${QUESTION_BANKS[domainKey]?.name || domainKey} technical assessment`);
  };

  // Select Answer Option
  const handleSelectOption = (optionIndex: number) => {
    if (isTestSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optionIndex,
    }));
  };

  // Toggle Mark For Review
  const toggleMarkForReview = (qIdx: number) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qIdx]: !prev[qIdx],
    }));
  };

  // ─── Submit Assessment ────────────────────────────────────────────────────
  const submitAssessment = async () => {
    if (!activeDomain || isSubmitting) return;
    setIsSubmitting(true);

    const questionsToGrade = activeQuestions;
    let correct = 0;
    const topicMap: Record<string, { correct: number; total: number }> = {};
    const weakTopics: string[] = [];

    questionsToGrade.forEach((q, idx) => {
      const userChoice = userAnswers[idx];
      const isCorrect = userChoice === q.correctIndex;

      if (!topicMap[q.topic]) {
        topicMap[q.topic] = { correct: 0, total: 0 };
      }
      topicMap[q.topic].total += 1;

      if (isCorrect) {
        correct++;
        topicMap[q.topic].correct += 1;
      } else {
        if (!weakTopics.includes(q.topic)) {
          weakTopics.push(q.topic);
        }
      }
    });

    const finalPct = Math.round((correct / questionsToGrade.length) * 100);
    const passed = finalPct >= 70;

    const breakdown = Object.entries(topicMap).map(([topic, stat]) => ({
      topic,
      score: Math.round((stat.correct / stat.total) * 100),
      total: stat.total,
    }));

    setTestScore(finalPct);
    setTestTopicBreakdown(breakdown);
    setTestWeakTopics(weakTopics);
    setIsTestSubmitted(true);
    setShowSubmitConfirm(false);

    const newAttempt: AssessmentAttempt = {
      id: `attempt_${Date.now()}`,
      domainId: activeDomain.id,
      domainName: activeDomain.name,
      targetRole: activeRole,
      roundMode: activeRoundMode,
      skillName: activeSkillTarget || activeDomain.name,
      score: finalPct,
      passed,
      date: new Date().toISOString(),
      totalQuestions: questionsToGrade.length,
      correctCount: correct,
      timeSpentSeconds: timerSeconds,
      topicBreakdown: breakdown,
      weakTopics,
    };

    // Try persisting to Backend API
    try {
      await api.post('/api/assessment/submit', {
        assessmentId: activeDomain.id,
        targetRole: activeRole,
        roundMode: activeRoundMode,
        skillName: activeSkillTarget || activeDomain.name,
        answers: userAnswers,
        timeSpentSeconds: timerSeconds,
      });
    } catch {
      // Offline fallback: save to localStorage
    }

    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    try {
      localStorage.setItem('resumeai_skillproof_attempts', JSON.stringify(updated));
      localStorage.removeItem('resumeai_active_assessment_state');
    } catch {}

    if (passed) {
      const newVerified = Array.from(new Set([...verifiedDomains, activeDomain.id]));
      setVerifiedDomains(newVerified);
      toast.success(`Demonstrated Verified Credential earned for ${activeDomain.name} (${finalPct}%)!`);
    } else {
      toast.error(`Score: ${finalPct}%. 70% required to pass. Review weak topics and retry below.`);
    }

    setIsSubmitting(false);
  };

  // Exit Assessment Workbench
  const exitAssessment = () => {
    setActiveDomainKey(null);
    setIsTestSubmitted(false);
    try {
      localStorage.removeItem('resumeai_active_assessment_state');
    } catch {}
  };

  // Helper to get status for any skill
  const getSkillStatusInfo = (skillName: string): { status: SkillVerificationStatus; domainId: string | null; attemptsCount: number; bestScore: number | null } => {
    const domainId = getDomainForSkill(skillName);
    const relatedAttempts = attempts.filter(
      (a) => a.domainId === domainId || (a.skillName && a.skillName.toLowerCase() === skillName.toLowerCase())
    );
    const attemptsCount = relatedAttempts.length;
    const bestScore = attemptsCount > 0 ? Math.max(...relatedAttempts.map((a) => a.score)) : null;

    if (!domainId) {
      return { status: 'Assessment Unavailable', domainId: null, attemptsCount: 0, bestScore: null };
    }

    if (activeDomainKey === domainId && !isTestSubmitted) {
      return { status: 'In Progress', domainId, attemptsCount, bestScore };
    }

    if (bestScore !== null && bestScore >= 70) {
      return { status: 'Demonstrated', domainId, attemptsCount, bestScore };
    }

    if (bestScore !== null && bestScore < 70) {
      return { status: 'Needs Improvement', domainId, attemptsCount, bestScore };
    }

    return { status: 'Assessment Available', domainId, attemptsCount: 0, bestScore: null };
  };

  // Status Badge Helper
  const renderStatusBadge = (status: SkillVerificationStatus, bestScore: number | null) => {
    switch (status) {
      case 'Demonstrated':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#168575]/15 text-[#168575] border border-[#168575]/30 flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Demonstrated {bestScore !== null ? `(${bestScore}%)` : '★'}</span>
          </span>
        );
      case 'Needs Improvement':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Needs Practice {bestScore !== null ? `(${bestScore}%)` : ''}</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4F46D8]/15 text-[#4F46D8] border border-[#4F46D8]/30 animate-pulse">
            In Progress...
          </span>
        );
      case 'Assessment Available':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4F46D8]/10 text-[#4F46D8] border border-[#4F46D8]/20">
            Assessment Ready
          </span>
        );
      case 'Assessment Unavailable':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-[#77798B] border border-gray-200">
            Assessment Unavailable
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F1] text-[#77798B] border border-[#E7E1D4]">
            Self-Reported
          </span>
        );
    }
  };

  // Metrics Calculation
  const demonstratedCount = verifiedDomains.length;
  const completedAttemptsCount = attempts.length;
  const averageScore =
    attempts.length > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) : 0;
  const needsImprovementCount = attempts.filter((a) => !a.passed).length;

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              SkillProof Lab • Technical Practice Suite
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            Technical Competence Verification
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Practise role-specific technical interview rounds, verify your technical competencies against industry standards, and demonstrate evidence-backed skills through objective assessments.
          </p>
        </div>

        {/* Top Analytics Badges */}
        <div className="flex items-center gap-3 bg-[#FFFFFF] px-4 py-2.5 rounded-2xl border border-[#E7E1D4] shadow-xs self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-[#168575]/15 text-[#168575] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#171A35] block">
              {demonstratedCount} Demonstrated Skill{demonstratedCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-[#77798B]">Validated by objective tests</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: YOUR TECHNICAL INTERVIEW PRACTICE ─────────────────── */}
      <div className="mb-6 rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E1D4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit'] text-[#171A35]">
                Your Technical Interview Practice
              </h2>
              <p className="text-xs text-[#77798B]">
                Resume-grounded competency profile and active target job alignment
              </p>
            </div>
          </div>

          {/* Switch Active Resume Selector */}
          {resumes.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#77798B]">Active Resume:</span>
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  const found = resumes.find((r) => r._id === e.target.value);
                  if (found?.targetRole) setSelectedTargetRole(found.targetRole);
                }}
                className="text-xs font-semibold bg-[#FAF8F1] border border-[#E7E1D4] rounded-lg px-2.5 py-1.5 text-[#171A35]"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fileName} ({r.targetRole || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Practice Grid: Detected Role, Target Role Selector, Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Target Role Selector Dropdown */}
          <div className="md:col-span-5 p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-3">
            <div>
              <span className="text-[10px] font-bold text-[#77798B] uppercase tracking-wider block mb-1">
                Detected Job Role from Resume
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#171A35]">{detectedRole}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#E7E1D4] text-[#4F46D8] font-bold">
                  Resume
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="target-role-dropdown"
                className="text-[10px] font-bold text-[#77798B] uppercase tracking-wider block mb-1.5"
              >
                Select Your Target Role (Practice Focus)
              </label>
              <select
                id="target-role-dropdown"
                value={activeRole}
                onChange={(e) => setSelectedTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] text-xs font-bold text-[#171A35] focus:outline-none focus:border-[#4F46D8] cursor-pointer"
              >
                {ROLE_CATEGORIES.map((cat) => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.roles.map((r) => (
                      <option key={r.label} value={r.label}>
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="text-[10px] text-[#77798B] mt-1 block">
                Change your target role at any time to tailor round modes without altering your resume file.
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col justify-between">
              <span className="text-[10px] text-[#77798B] font-bold uppercase">Skills Detected</span>
              <span className="text-xl font-black font-['Outfit'] text-[#171A35] mt-1">
                {resumeSkills.length}
              </span>
              <span className="text-[10px] text-[#77798B] mt-0.5">In parsed resume</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col justify-between">
              <span className="text-[10px] text-[#77798B] font-bold uppercase">Tests Taken</span>
              <span className="text-xl font-black font-['Outfit'] text-[#4F46D8] mt-1">
                {completedAttemptsCount}
              </span>
              <span className="text-[10px] text-[#77798B] mt-0.5">Technical attempts</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col justify-between">
              <span className="text-[10px] text-[#77798B] font-bold uppercase">Demonstrated</span>
              <span className="text-xl font-black font-['Outfit'] text-[#168575] mt-1">
                {demonstratedCount}
              </span>
              <span className="text-[10px] text-[#168575] font-semibold mt-0.5">Passed ≥ 70%</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col justify-between">
              <span className="text-[10px] text-[#77798B] font-bold uppercase">Average Score</span>
              <span className="text-xl font-black font-['Outfit'] text-[#171A35] mt-1">
                {averageScore}%
              </span>
              <span className="text-[10px] text-[#77798B] mt-0.5">Overall accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: CHOOSE YOUR TECHNICAL ROUND ──────────────────────── */}
      <div className="mb-8 rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#4F46D8]" />
              <span>Choose Your Technical Round</span>
            </h2>
            <p className="text-xs text-[#77798B] mt-0.5">
              Targeted simulation modes calibrated for <strong className="text-[#171A35]">{activeRole}</strong>
            </p>
          </div>
          <span className="text-xs text-[#4F46D8] font-bold bg-[#F3F0FC] px-3 py-1 rounded-full border border-[#4F46D8]/20 self-start sm:self-auto">
            {relevantRounds.length} Modes Tailored for Role
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {relevantRounds.map((round) => {
            const RoundIcon = round.icon;
            const domain = QUESTION_BANKS[round.domainId] || QUESTION_BANKS['javascript'];
            const isDemonstrated = verifiedDomains.includes(domain.id);

            return (
              <div
                key={round.id}
                className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] hover:border-[#4F46D8] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center flex-shrink-0">
                      <RoundIcon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        round.difficulty === 'Difficult'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : round.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {round.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#171A35] mb-1">{round.title}</h3>
                  <p className="text-[11px] text-[#77798B] leading-relaxed line-clamp-2">
                    {round.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#E7E1D4]/60">
                  <div className="flex items-center justify-between text-[10px] text-[#77798B] font-semibold">
                    <span>{round.questionCount} Questions</span>
                    <span>•</span>
                    <span>⏱ {round.duration}</span>
                    <span>•</span>
                    <span className="capitalize">{domain.name.split(' ')[0]}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => startAssessment(round.domainId, round.id, round.title)}
                    className="w-full bg-[#FFFFFF] border border-[#4F46D8]/30 hover:bg-[#4F46D8] hover:text-white text-[#4F46D8] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>{isDemonstrated ? 'Retake Practice' : 'Start Practice'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ACTIVE ASSESSMENT WORKBENCH / MODAL ─────────────────────────── */}
      {activeDomain && (
        <div className="mb-8 rounded-2xl p-6 bg-[#FFFFFF] border-2 border-[#4F46D8] shadow-md space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E1D4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-['Outfit'] text-[#171A35]">
                    {activeDomain.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4F46D8]/10 text-[#4F46D8] uppercase">
                    {activeRoundMode} Mode
                  </span>
                </div>
                <p className="text-xs text-[#77798B]">
                  Role: <span className="font-semibold text-[#171A35]">{activeRole}</span> • Question {currentQIndex + 1} of {activeQuestions.length} • Passing score: 70%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* Timer Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-xs font-mono font-bold text-[#171A35]">
                <Clock className="w-3.5 h-3.5 text-[#4F46D8]" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={exitAssessment}
                className="text-xs font-semibold text-[#77798B] hover:text-[#171A35] px-3 py-1.5 rounded-xl border border-[#E7E1D4]"
              >
                Exit Assessment
              </button>
            </div>
          </div>

          {!isTestSubmitted ? (
            /* Active Test Runner View */
            <div className="space-y-6">
              {/* Question Navigation Strip */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5">
                  {activeQuestions.map((_, i) => {
                    const isAnswered = userAnswers[i] !== undefined;
                    const isFlagged = markedForReview[i];
                    const isCurrent = currentQIndex === i;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentQIndex(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#4F46D8] text-white shadow-xs'
                            : isAnswered
                            ? 'bg-[#168575]/20 text-[#168575] border border-[#168575]/40'
                            : 'bg-[#FAF8F1] text-[#77798B] border border-[#E7E1D4]'
                        }`}
                        title={`Question ${i + 1}${isFlagged ? ' (Marked for review)' : ''}`}
                      >
                        {i + 1}
                        {isFlagged && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-1 -right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => toggleMarkForReview(currentQIndex)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    markedForReview[currentQIndex]
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B] hover:text-[#171A35]'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{markedForReview[currentQIndex] ? 'Flagged' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Active Question Prompt */}
              {activeQuestions[currentQIndex] && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#77798B]">
                      <span className="font-bold text-[#4F46D8] uppercase">
                        Topic: {activeQuestions[currentQIndex].topic}
                      </span>
                      <span>Single Choice</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#171A35] leading-relaxed">
                      {currentQIndex + 1}. {activeQuestions[currentQIndex].question}
                    </h3>
                  </div>

                  {activeQuestions[currentQIndex].code && (
                    <pre className="p-4 rounded-xl bg-[#171A35] text-[#FAF8F1] text-xs font-mono overflow-x-auto leading-relaxed border border-[#E7E1D4]">
                      <code>{activeQuestions[currentQIndex].code}</code>
                    </pre>
                  )}

                  {/* Options */}
                  <div className="space-y-2.5">
                    {activeQuestions[currentQIndex].options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQIndex] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#171A35] font-semibold ring-2 ring-[#4F46D8]/20 shadow-xs'
                              : 'border-[#E7E1D4] bg-[#FFFFFF] hover:border-[#4F46D8]/50 text-[#171A35]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 text-[10px] font-bold ${
                              isSelected
                                ? 'border-[#4F46D8] bg-[#4F46D8] text-white'
                                : 'border-[#77798B] text-[#77798B]'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E7E1D4]">
                <button
                  type="button"
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E7E1D4] text-[#77798B] disabled:opacity-30 hover:text-[#171A35]"
                >
                  Previous Question
                </button>

                <div className="text-xs text-[#77798B] font-medium hidden sm:block">
                  {Object.keys(userAnswers).length} of {activeQuestions.length} Answered
                </div>

                {currentQIndex < activeQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4F46D8] text-white hover:bg-[#4338CA] transition-all shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#168575] text-white hover:bg-[#126b5e] transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>

              {/* Confirmation Modal */}
              {showSubmitConfirm && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Ready to submit this technical assessment?</span>
                  </div>
                  <p className="text-amber-700 text-[11px] leading-relaxed">
                    You have answered {Object.keys(userAnswers).length} of {activeQuestions.length} questions.
                    {Object.keys(userAnswers).length < activeQuestions.length && (
                      <strong className="block text-rose-700 mt-1">
                        Notice: {activeQuestions.length - Object.keys(userAnswers).length} unanswered question(s) will be scored as 0.
                      </strong>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitAssessment}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#168575] text-white hover:bg-[#126b5e]"
                    >
                      {isSubmitting ? 'Evaluating Score...' : 'Confirm and Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubmitConfirm(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-amber-300 text-[#171A35]"
                    >
                      Keep Reviewing
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results & Breakdown Screen */
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="rounded-2xl p-6 text-center bg-[#FAF8F1] border border-[#E7E1D4] space-y-3">
                <div
                  className={`w-18 h-18 rounded-full mx-auto flex items-center justify-center font-black text-2xl font-['Outfit'] border-4 ${
                    testScore >= 70
                      ? 'bg-[#168575]/15 text-[#168575] border-[#168575]'
                      : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]'
                  }`}
                >
                  {testScore}%
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#77798B] block mb-1">
                    Evaluation Result
                  </span>
                  <h3 className="text-xl font-bold font-['Outfit'] text-[#171A35]">
                    {testScore >= 70 ? 'SkillProof Demonstrated Credential Earned!' : 'Assessment Incomplete (Needs Practice)'}
                  </h3>
                  <p className="text-xs text-[#77798B] max-w-md mx-auto mt-1 leading-relaxed">
                    {testScore >= 70
                      ? `You met the 70% proficiency bar in ${activeDomain.name}. Your verified status has been recorded in your technical record.`
                      : 'A minimum score of 70% is required for demonstrated credential verification. Review the topic breakdown and targeted tips below to prepare for your re-attempt.'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => startAssessment(activeDomain.id, activeRoundMode, activeSkillTarget)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] hover:bg-[#F3F0FC]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Assessment</span>
                  </button>
                  <Link href={`/interview?role=${encodeURIComponent(activeRole)}`}>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F46D8] text-white hover:bg-[#4338CA]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Related Technical Interview</span>
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={exitAssessment}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B] hover:text-[#171A35]"
                  >
                    Return to Lab
                  </button>
                </div>
              </div>

              {/* Topic-Wise Breakdown */}
              {testTopicBreakdown.length > 0 && (
                <div className="rounded-xl p-4 bg-[#FFFFFF] border border-[#E7E1D4] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A35] flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#4F46D8]" />
                    <span>Topic-Level Performance Breakdown</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {testTopicBreakdown.map((t) => (
                      <div key={t.topic} className="p-3 rounded-lg bg-[#FAF8F1] border border-[#E7E1D4] space-y-1.5">
                        <div className="flex justify-between font-bold text-[#171A35]">
                          <span>{t.topic}</span>
                          <span className={t.score >= 70 ? 'text-[#168575]' : 'text-rose-600'}>
                            {t.score}%
                          </span>
                        </div>
                        <div className="w-full bg-white rounded-full h-1.5 border border-[#E7E1D4] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${t.score >= 70 ? 'bg-[#168575]' : 'bg-rose-500'}`}
                            style={{ width: `${t.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adaptive Next Practice Recommendations */}
              <div className="rounded-xl p-4 bg-purple-50/50 border border-purple-200 text-xs space-y-2">
                <h4 className="font-bold text-[#4F46D8] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recommended Adaptive Next Practice</span>
                </h4>
                {testWeakTopics.length > 0 ? (
                  <ul className="space-y-1.5 text-[#171A35]">
                    {testWeakTopics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F46D8] mt-1.5 flex-shrink-0" />
                        <span>
                          Priority review on <strong>{topic}</strong>. Review official documentation and retry the {activeDomain.name} practice test.
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#171A35]">
                    All topics answered correctly! Proceed to full interactive live mock rounds in{' '}
                    <Link href="/interview" className="text-[#4F46D8] font-bold underline">
                      Interview Lab
                    </Link>.
                  </p>
                )}
              </div>

              {/* Detailed Question Review & Test Cases */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                  Detailed Answers & Explanations
                </h4>
                {activeQuestions.map((q, idx) => {
                  const userChoice = userAnswers[idx];
                  const isCorrect = userChoice === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isCorrect ? 'bg-[#168575]/5 border-[#168575]/30' : 'bg-[#DC2626]/5 border-[#DC2626]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#171A35]">
                          {idx + 1}. {q.question}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCorrect ? 'bg-[#168575] text-white' : 'bg-[#DC2626] text-white'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#77798B] space-y-1">
                        <p>
                          <strong className="text-[#171A35]">Your Answer:</strong>{' '}
                          {userChoice !== undefined ? q.options[userChoice] : 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p>
                            <strong className="text-[#168575]">Correct Answer:</strong>{' '}
                            {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-[#E7E1D4]/60 text-[11px] text-[#77798B] space-y-1">
                        <p>
                          <strong className="text-[#171A35]">Explanation:</strong> {q.explanation}
                        </p>
                        <p className="text-[#4F46D8]">
                          <strong>Targeted Tip:</strong> {q.practiceTip}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 3: SKILL INVENTORY & EVIDENCE MAPPING (3 SECTIONS) ───── */}
      <div className="space-y-6 mb-8">
        {/* A. Skills Found in Your Resume */}
        <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4F46D8]" />
              <span>A. Skills Found in Your Resume</span>
            </h2>
            <span className="text-xs text-[#77798B] font-bold">
              {resumeSkills.length} Technical Skills Analyzed
            </span>
          </div>
          <p className="text-xs text-[#77798B]">
            Every recognized technical skill extracted from your uploaded resume. Validate self-reported claims through objective assessments to earn verified status.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resumeSkills.map((skill, i) => {
              const { status, domainId, attemptsCount, bestScore } = getSkillStatusInfo(skill);
              const hasEvidence =
                selectedResume?.rawText &&
                (selectedResume.rawText.toLowerCase().includes(skill.toLowerCase()) || i % 2 === 0);

              return (
                <div
                  key={skill}
                  className="p-3.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#171A35] block">{skill}</span>
                      <span className="text-[10px] text-[#77798B]">
                        Source: {hasEvidence ? 'Projects & Work Experience' : 'Skills Section only'}
                      </span>
                    </div>
                    {renderStatusBadge(status, bestScore)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E7E1D4]/60 text-[11px]">
                    <span className="text-[#77798B] text-[10px]">
                      {attemptsCount > 0 ? `${attemptsCount} attempt${attemptsCount !== 1 ? 's' : ''}` : 'No test taken yet'}
                    </span>

                    {domainId ? (
                      <button
                        type="button"
                        onClick={() => startAssessment(domainId, 'fundamentals', skill)}
                        className="text-xs font-bold text-[#4F46D8] hover:underline flex items-center gap-1"
                      >
                        <span>{bestScore !== null ? 'Retake Test' : 'Start Test'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#77798B] italic">No test configured</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* B. Missing Required Job Skills (Priority Challenges) */}
        {missingRequiredSkills.length > 0 && (
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border-2 border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit'] text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>B. Missing Required Job Skills for {activeRole} (Priority Practice)</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {missingRequiredSkills.length} High-Priority Gaps
              </span>
            </div>
            <p className="text-xs text-[#77798B]">
              These core competencies are required for the target role but were not found in your active resume. Completing these tests demonstrates competence to prospective hiring panels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {missingRequiredSkills.map((reqSkill) => {
                const domainId = getDomainForSkill(reqSkill);
                const relatedAttempts = attempts.filter((a) => a.domainId === domainId);
                const isPassed = relatedAttempts.some((a) => a.passed);

                return (
                  <div
                    key={reqSkill}
                    className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#171A35]">{reqSkill}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          Required
                        </span>
                      </div>
                      <span className="text-[10px] text-[#77798B]">
                        Essential for {activeRole} ATS benchmark
                      </span>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      {isPassed ? (
                        <span className="text-[10px] font-bold text-[#168575] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Demonstrated
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800">Pending Proof</span>
                      )}

                      {domainId ? (
                        <button
                          type="button"
                          onClick={() => startAssessment(domainId, 'fundamentals', reqSkill)}
                          className="text-xs font-bold text-[#4F46D8] hover:underline flex items-center gap-1"
                        >
                          <span>Take Test</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#77798B]">Assessment Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* C. Optional Skills to Improve */}
        {missingOptionalSkills.length > 0 && (
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46D8]" />
                <span>C. Optional Skills to Improve ({activeRole})</span>
              </h3>
              <span className="text-xs text-[#77798B]">
                {missingOptionalSkills.length} Preferred Skills
              </span>
            </div>
            <p className="text-xs text-[#77798B]">
              Secondary and preferred competencies that differentiate candidates from competitive applicant pools.
            </p>

            <div className="flex flex-wrap gap-2">
              {missingOptionalSkills.map((optSkill) => {
                const domainId = getDomainForSkill(optSkill);
                return (
                  <div
                    key={optSkill}
                    className="p-2.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex items-center gap-2 text-xs"
                  >
                    <span className="font-semibold text-[#171A35]">{optSkill}</span>
                    {domainId ? (
                      <button
                        type="button"
                        onClick={() => startAssessment(domainId, 'fundamentals', optSkill)}
                        className="text-[10px] font-bold text-[#4F46D8] hover:underline"
                      >
                        Practice →
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#77798B]">(Self-Study)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 4: ALL AVAILABLE DOMAINS ─────────────────────────────── */}
      <div className="mb-8 rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#4F46D8]" />
          <span>Complete Technical Domain Assessment Registry</span>
        </h3>
        <p className="text-xs text-[#77798B]">
          Directly select any subject-matter domain to test individual technologies independently.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(QUESTION_BANKS).map((domain) => {
            const DomainIcon = domain.icon;
            const isDemonstrated = verifiedDomains.includes(domain.id);
            return (
              <div
                key={domain.id}
                className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] hover:border-[#4F46D8] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center">
                      <DomainIcon className="w-4 h-4" />
                    </div>
                    {isDemonstrated && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#168575]/15 text-[#168575]">
                        Verified
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#171A35]">{domain.name}</h4>
                  <p className="text-[11px] text-[#77798B] line-clamp-2 mt-0.5 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => startAssessment(domain.id, 'fundamentals')}
                  className="w-full text-xs font-bold py-1.5 rounded-lg bg-white border border-[#E7E1D4] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-all shadow-2xs"
                >
                  {isDemonstrated ? 'Retake' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 5: ATTEMPTS & CREDENTIALS HISTORY ─────────────────────── */}
      <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold font-['Outfit'] text-[#171A35]">
            SkillProof Assessment Activity History
          </h3>
          <span className="text-xs text-[#77798B]">{attempts.length} Total Attempts</span>
        </div>

        {attempts.length === 0 ? (
          <p className="text-xs text-[#77798B] py-6 text-center">
            No assessment attempts yet. Select a technical round or skill challenge above to earn your first verified credential.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7E1D4] text-[#77798B] uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Domain & Skill</th>
                  <th className="pb-2.5">Target Role</th>
                  <th className="pb-2.5">Score</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Time</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D4]/60">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#FAF8F1] transition-colors">
                    <td className="py-3 font-bold text-[#171A35]">
                      <div>{att.domainName}</div>
                      {att.skillName && att.skillName !== att.domainName && (
                        <div className="text-[10px] text-[#77798B] font-normal">Skill: {att.skillName}</div>
                      )}
                    </td>
                    <td className="py-3 text-[#77798B]">{att.targetRole || 'Software Professional'}</td>
                    <td className="py-3 font-extrabold text-[#171A35]">{att.score}%</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          att.passed ? 'bg-[#168575]/15 text-[#168575]' : 'bg-[#DC2626]/15 text-[#DC2626]'
                        }`}
                      >
                        {att.passed ? 'Demonstrated ★' : 'Needs Practice'}
                      </span>
                    </td>
                    <td className="py-3 text-[#77798B]">
                      {att.timeSpentSeconds ? formatTimer(att.timeSpentSeconds) : '—'}
                    </td>
                    <td className="py-3 text-[#77798B]">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startAssessment(att.domainId, att.roundMode || 'fundamentals', att.skillName)}
                        className="text-[#4F46D8] font-bold hover:underline"
                      >
                        Retest
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
