'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  Brain,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  Play,
  RotateCcw,
  BookOpen,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, Interview } from '@/types';
import { formatDate, formatRelativeTime, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

const INTERVIEW_ROLES = [
  { title: 'Full Stack Engineer', desc: 'React, Node.js, databases, and architectural trade-offs' },
  { title: 'Frontend Developer', desc: 'UI architecture, performance, accessibility, and state management' },
  { title: 'Backend Developer', desc: 'API design, concurrency, database indexing, and scaling' },
  { title: 'Data Scientist / AI Engineer', desc: 'Model evaluation, data pipelines, SQL, and feature engineering' },
  { title: 'DevOps & Cloud Engineer', desc: 'CI/CD pipelines, Docker, Kubernetes, and infrastructure as code' },
  { title: 'Product Manager', desc: 'Prioritization frameworks, cross-functional leadership, and metrics' },
];

export default function InterviewLabPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [targetRole, setTargetRole] = useState(INTERVIEW_ROLES[0].title);
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'mixed'>('mixed');
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const [resRes, intRes] = await Promise.all([
        api.get('/resume'),
        api.get('/interview'),
      ]);
      const resList: Resume[] = resRes.data.resumes || [];
      const intList: Interview[] = intRes.data.interviews || [];
      setResumes(resList);
      setInterviews(intList);
      if (resList.length > 0) {
        setSelectedResumeId(resList[0]._id);
      }
    } catch {
      toast.error('Failed to load interview history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleStartInterview = async () => {
    if (!selectedResumeId) {
      toast.error('Please upload or select a resume first');
      return;
    }

    setStarting(true);
    try {
      const res = await api.post('/interview/start', {
        resumeId: selectedResumeId,
        provider: 'gemini',
      });

      if (res.data.success && res.data.interview) {
        toast.success('Interview session initiated!');
        router.push(`/interview/${res.data.interview._id}`);
      } else {
        toast.error('Could not start interview session');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Server error';
      toast.error(`Error starting interview: ${msg}`);
    } finally {
      setStarting(false);
    }
  };

  const completedInterviews = interviews.filter((i) => i.status === 'completed');

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mic className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              Interview Lab • Simulation Suite
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            AI Mock Interview Simulator
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Real-time conversational interview practice with instant rubric evaluations & weakness diagnosis
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FFFFFF] px-4 py-2.5 rounded-2xl border border-[#E7E1D4] shadow-xs self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-[#4F46D8]/15 text-[#4F46D8] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#171A35] block">
              {completedInterviews.length} Completed Session{completedInterviews.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-[#77798B]">Real rubric scoring</span>
          </div>
        </div>
      </div>

      {/* ─── Launch Interview Panel ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-5">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Play className="w-4 h-4 text-[#4F46D8]" />
              <span>Configure New Mock Interview Session</span>
            </h2>

            {/* Select Grounding Resume */}
            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1.5">
                Ground Interview in Uploaded Resume
              </label>
              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs font-semibold text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} ({r.targetRole || 'General'} • {r.analysis?.overallScore || 0} pts)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-xs text-[#77798B] flex items-center justify-between">
                  <span>No resume found. Upload one for questions tailored to your experience.</span>
                  <Link href="/resume-studio" className="text-[#4F46D8] font-bold hover:underline">
                    Upload
                  </Link>
                </div>
              )}
            </div>

            {/* Target Role selection */}
            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1.5">
                Target Interview Position
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INTERVIEW_ROLES.map((role) => (
                  <div
                    key={role.title}
                    onClick={() => setTargetRole(role.title)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      targetRole === role.title
                        ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#4F46D8] font-bold shadow-xs'
                        : 'border-[#E7E1D4] bg-[#FAF8F1] hover:border-[#4F46D8]/50 text-[#171A35]'
                    }`}
                  >
                    <div className="font-bold">{role.title}</div>
                    <div className="text-[10px] text-[#77798B] line-clamp-1 mt-0.5">{role.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode selection */}
            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1.5">
                Interview Emphasis & Question Rubric
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mixed', label: 'Balanced (Tech & Soft Skills)' },
                  { id: 'technical', label: 'Deep Technical & Architecture' },
                  { id: 'behavioral', label: 'Behavioral & STAR Method' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setInterviewType(mode.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      interviewType === mode.id
                        ? 'border-[#4F46D8] bg-[#4F46D8] text-white shadow-xs'
                        : 'border-[#E7E1D4] bg-[#FAF8F1] text-[#77798B] hover:text-[#171A35]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleStartInterview}
              disabled={starting || !selectedResumeId}
              className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Generating Interview Session with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Live AI Interview</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: How It Works & Rubrics */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#4F46D8]" />
              <span>Assessment Rubric & Feedback Mechanics</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4]">
                <span className="font-bold text-[#171A35] block mb-0.5">
                  1. Technical Accuracy & Depth (40%)
                </span>
                <p className="text-[11px] text-[#77798B]">
                  Evaluates fundamental correctness, handling of edge cases, and awareness of architectural trade-offs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4]">
                <span className="font-bold text-[#171A35] block mb-0.5">
                  2. Communication & Clarity (35%)
                </span>
                <p className="text-[11px] text-[#77798B]">
                  Structured problem breakdown, concise explanations, and effective articulation using the STAR framework.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4]">
                <span className="font-bold text-[#171A35] block mb-0.5">
                  3. Behavioral Alignment (25%)
                </span>
                <p className="text-[11px] text-[#77798B]">
                  Ownership, resilience in debugging situations, collaboration with cross-functional peers, and leadership.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E1D4] flex items-center justify-between text-xs">
              <span className="text-[#77798B]">Need to prepare before speaking?</span>
              <Link href="/skillproof" className="text-[#4F46D8] font-bold hover:underline flex items-center gap-1">
                <span>Test skills in SkillProof</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Completed Interview Sessions ─────────────────────────────────── */}
      <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-['Outfit'] text-[#171A35]">
            Past Interview Sessions & Performance Records
          </h3>
          <span className="text-xs text-[#77798B]">{interviews.length} total sessions</span>
        </div>

        {interviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#77798B]">
            No mock interview sessions recorded yet. Launch your first session above to test your skills under real interview conditions.
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((intv) => {
              const resumeName =
                typeof intv.resumeId === 'object' && intv.resumeId !== null
                  ? intv.resumeId.fileName
                  : 'Resume';
              const isCompleted = intv.status === 'completed';
              const score = intv.finalResults?.overallScore || 0;

              return (
                <div
                  key={intv._id}
                  className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#4F46D8]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCompleted
                          ? 'bg-[#168575]/15 text-[#168575]'
                          : 'bg-[#B7791F]/15 text-[#B7791F]'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#171A35]">
                          {intv.targetRole || 'General Engineering'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                            isCompleted
                              ? 'bg-[#168575]/15 text-[#168575]'
                              : 'bg-[#B7791F]/15 text-[#B7791F]'
                          }`}
                        >
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#77798B] mt-0.5">
                        <span>{resumeName}</span>
                        <span>•</span>
                        <span>{formatDate(intv.createdAt)}</span>
                        <span>•</span>
                        <span>{intv.messages?.length || 0} exchanges</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {isCompleted && intv.finalResults && (
                      <div className="text-right">
                        <span className="text-xs font-black font-['Outfit'] block text-[#168575]">
                          Score: {score}%
                        </span>
                        <span className="text-[10px] text-[#77798B]">
                          {getScoreLabel(score)}
                        </span>
                      </div>
                    )}

                    {isCompleted ? (
                      <Link href={`/interview/${intv._id}/results`}>
                        <button className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E7E1D4] text-xs font-bold text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-all shadow-xs">
                          View Rubric Results →
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/interview/${intv._id}`}>
                        <button className="px-3.5 py-1.5 rounded-lg bg-[#4F46D8] text-white text-xs font-bold hover:bg-[#4338CA] transition-all shadow-xs">
                          Resume Session →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
