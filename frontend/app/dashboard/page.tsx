'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Mic,
  BarChart3,
  TrendingUp,
  Clock,
  ChevronRight,
  Brain,
  Star,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, Interview } from '@/types';
import { formatRelativeTime, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-3 bg-[#FFFFFF] border border-[#E7E1D4]">
      <div className="shimmer-bg h-4 w-3/4 rounded" />
      <div className="shimmer-bg h-3 w-1/2 rounded" />
      <div className="shimmer-bg h-8 w-full rounded" />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full border border-current/20"
      style={{ background: `${color}15`, color }}
    >
      {score} — {getScoreLabel(score)}
    </span>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const hasFetched = useRef(false);

  const fetchData = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    try {
      const [resumeRes, interviewRes] = await Promise.all([
        api.get('/resume'),
        api.get('/interview'),
      ]);
      setResumes(resumeRes.data.resumes || []);
      setInterviews(interviewRes.data.interviews || []);
    } catch (err: any) {
      hasFetched.current = false;
      const msg = err?.response?.data?.message || err?.message || 'Network error';
      toast.error(`Failed to load data: ${msg}`);
      console.error('Dashboard fetch error:', err?.response?.status, msg, err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const validScores = resumes
    .map((r) => r.analysis?.overallScore)
    .filter((s): s is number => typeof s === 'number' && s > 0);

  const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const avgScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
      : 0;
  const completedInterviews = interviews.filter((i) => i.status === 'completed').length;

  const stats = [
    {
      label: 'Total Resumes',
      value: resumes.length.toString(),
      icon: FileText,
      iconBg: 'bg-[#4F46D8]',
    },
    {
      label: 'Best Resume Score',
      value: bestScore > 0 ? bestScore.toString() : '—',
      icon: Star,
      iconBg: 'bg-[#B7791F]',
    },
    {
      label: 'Interviews Completed',
      value: completedInterviews.toString(),
      icon: Mic,
      iconBg: 'bg-[#4F46D8]',
    },
    {
      label: 'Average Resume Score',
      value: avgScore > 0 ? avgScore.toString() : '—',
      icon: TrendingUp,
      iconBg: 'bg-[#168575]',
    },
  ];

  const quickActions = [
    {
      title: 'Upload New Resume',
      desc: 'Get instant AI analysis & ATS score',
      href: '/resume-studio',
      icon: Upload,
      iconBg: 'bg-[#4F46D8]',
    },
    {
      title: 'Browse Resumes',
      desc: `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} stored & analyzed`,
      href: '/history',
      icon: BarChart3,
      iconBg: 'bg-[#4F46D8]',
    },
    {
      title: 'Match a Job',
      desc: 'Compare skills against job requirements',
      href: '/job-matcher',
      icon: Briefcase,
      iconBg: 'bg-[#168575]',
    },
    {
      title: 'Start an Interview',
      desc: 'Role-relevant questions with real rubric scoring',
      href: '/interview',
      icon: Mic,
      iconBg: 'bg-[#B7791F]',
    },
  ];

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Brain className="w-4 h-4 text-[#4F46D8]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">Dashboard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#171A35]">
          Welcome back,{' '}
          <span className="text-[#4F46D8]">{user?.name ? user.name.split(' ')[0] : 'Candidate'}!</span>
        </h1>
        <p className="text-sm text-[#77798B] mt-1">
          {formattedDate} • Elevate your career readiness with real-time AI analytics
        </p>
      </motion.div>

      {/* ─── Statistics Cards ─────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs hover:border-[#4F46D8]/30 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3 shadow-xs`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-black text-[#171A35] font-['Outfit']">{stat.value}</div>
              <div className="text-[#77798B] text-xs font-medium mt-1">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── Quick Actions Grid ───────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#171A35] font-['Outfit']">Quick Actions</h2>
          <span className="text-xs text-[#77798B]">Select a workflow to get started</span>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <motion.div key={action.title} variants={itemVariants}>
                <Link href={action.href}>
                  <div className="group rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs hover:border-[#4F46D8] transition-all relative overflow-hidden h-full flex flex-col justify-between cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <ActionIcon className="w-6 h-6" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#77798B] group-hover:text-[#4F46D8] group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#171A35] font-['Outfit'] mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-[#77798B] leading-relaxed">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ─── Recent Activity (Resumes & Interviews) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Resumes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#171A35] font-['Outfit']">Recent Resumes</h2>
            <Link
              href="/resume-studio"
              className="text-[#4F46D8] text-xs font-semibold hover:underline transition-colors"
            >
              Upload new +
            </Link>
          </div>

          {dataLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-2xl p-8 text-center bg-[#FFFFFF] border border-[#E7E1D4]">
              <FileText className="w-10 h-10 text-[#77798B]/50 mx-auto mb-2" />
              <p className="text-[#171A35] font-bold text-sm mb-1">No resumes uploaded yet</p>
              <p className="text-[#77798B] text-xs mb-4">
                Upload your resume in PDF, DOCX, or TXT format to generate your first AI score.
              </p>
              <Link href="/resume-studio">
                <button className="bg-[#4F46D8] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs">
                  Upload Resume
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 5).map((resume) => (
                <div
                  key={resume._id}
                  className="rounded-2xl p-4 bg-[#FFFFFF] border border-[#E7E1D4] hover:border-[#4F46D8]/40 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F3F0FC] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#4F46D8]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#171A35] truncate">{resume.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-[#77798B]" />
                          <span className="text-[11px] text-[#77798B]">
                            {formatRelativeTime(resume.createdAt)}
                          </span>
                          {resume.targetRole && (
                            <span className="text-[11px] bg-[#F3F0FC] text-[#4F46D8] px-2 py-0.2 rounded-md font-medium">
                              {resume.targetRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {resume.analysis && typeof resume.analysis.overallScore === 'number' && (
                      <ScoreBadge score={resume.analysis.overallScore} />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/resume/${resume._id}`} className="flex-1">
                      <button className="w-full bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] hover:bg-[#F3F0FC] hover:text-[#4F46D8] text-xs py-1.5 rounded-lg transition-all font-semibold">
                        View Analysis
                      </button>
                    </Link>
                    <Link href={`/job-matcher`} className="flex-1">
                      <button className="w-full bg-[#F3F0FC] border border-[#4F46D8]/20 text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white text-xs py-1.5 rounded-lg transition-all font-semibold">
                        Match Job
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#171A35] font-['Outfit']">Recent Interviews</h2>
            <Link
              href="/interview"
              className="text-[#4F46D8] text-xs font-semibold hover:underline transition-colors"
            >
              Start new +
            </Link>
          </div>

          {dataLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="rounded-2xl p-8 text-center bg-[#FFFFFF] border border-[#E7E1D4]">
              <Mic className="w-10 h-10 text-[#77798B]/50 mx-auto mb-2" />
              <p className="text-[#171A35] font-bold text-sm mb-1">No interviews practiced yet</p>
              <p className="text-[#77798B] text-xs mb-4">
                Practice role-specific mock interviews with instant rubric-based AI evaluations.
              </p>
              <Link href="/interview">
                <button className="bg-[#4F46D8] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs">
                  Start Mock Interview
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 5).map((interview) => {
                const resumeName =
                  typeof interview.resumeId === 'object' && interview.resumeId !== null
                    ? interview.resumeId.fileName
                    : 'Resume Reference';
                return (
                  <div
                    key={interview._id}
                    className="rounded-2xl p-4 bg-[#FFFFFF] border border-[#E7E1D4] hover:border-[#4F46D8]/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#F3F0FC] flex items-center justify-center flex-shrink-0">
                          <Mic className="w-4 h-4 text-[#4F46D8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#171A35] truncate">{resumeName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-[#77798B]" />
                            <span className="text-[11px] text-[#77798B]">
                              {formatRelativeTime(interview.createdAt)}
                            </span>
                            {interview.targetRole && (
                              <span className="text-[11px] text-[#77798B]">
                                • {interview.targetRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          interview.status === 'completed'
                            ? 'bg-[#168575]/15 text-[#168575]'
                            : 'bg-[#B7791F]/15 text-[#B7791F]'
                        }`}
                      >
                        {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    {interview.status === 'completed' && interview.finalResults && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E7E1D4]">
                        <ScoreBadge score={interview.finalResults.overallScore} />
                        <Link href={`/interview/${interview._id}/results`}>
                          <span className="text-xs text-[#4F46D8] hover:underline font-semibold transition-colors cursor-pointer">
                            View Results →
                          </span>
                        </Link>
                      </div>
                    )}
                    {interview.status === 'in_progress' && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E7E1D4]">
                        <div className="flex items-center gap-1.5 text-xs text-[#B7791F]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Session paused</span>
                        </div>
                        <Link href={`/interview/${interview._id}`}>
                          <span className="text-xs text-[#4F46D8] hover:underline font-semibold cursor-pointer">
                            Resume Session →
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
