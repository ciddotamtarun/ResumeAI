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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, Interview } from '@/types';
import { formatRelativeTime, getScoreColor, getScoreLabel } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
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
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: `${color}20`, color }}
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
      hasFetched.current = false; // allow retry
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const bestScore = resumes.length > 0
    ? Math.max(...resumes.map(r => r.analysis?.overallScore || 0))
    : 0;
  const avgScore = resumes.length > 0
    ? Math.round(resumes.reduce((sum, r) => sum + (r.analysis?.overallScore || 0), 0) / resumes.length)
    : 0;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;

  const stats = [
    { label: 'Total Resumes', value: resumes.length.toString(), icon: FileText, color: 'from-blue-500 to-indigo-600' },
    { label: 'Best Score', value: bestScore > 0 ? bestScore.toString() : '—', icon: Star, color: 'from-amber-500 to-orange-600' },
    { label: 'Interviews Done', value: completedInterviews.toString(), icon: Mic, color: 'from-violet-500 to-purple-600' },
    { label: 'Avg Score', value: avgScore > 0 ? avgScore.toString() : '—', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-400 text-sm font-medium">Dashboard</span>
          </div>
          <h1 className="text-4xl font-black font-['Outfit'] text-white">
            Welcome back,{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-gray-400 mt-2">
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="glass rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-black text-white font-['Outfit']">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
        >
          <motion.div variants={itemVariants}>
            <Link href="/resume/upload">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass rounded-2xl p-6 cursor-pointer group hover:border-indigo-500/30 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-sm group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white font-['Outfit']">Upload New Resume</h3>
                    <p className="text-gray-400 text-sm">Get instant AI analysis & score</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="glass rounded-2xl p-6 cursor-pointer group hover:border-violet-500/30 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white font-['Outfit']">Browse Resumes</h3>
                  <p className="text-gray-400 text-sm">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} analyzed</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Resumes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-['Outfit']">Recent Resumes</h2>
              <Link href="/resume/upload" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
                Upload new +
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : resumes.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">No resumes yet</p>
                <p className="text-gray-600 text-sm mb-4">Upload your first resume to get started</p>
                <Link href="/resume/upload">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    Upload Resume
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.slice(0, 5).map((resume) => (
                  <motion.div
                    key={resume._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-4 hover:border-indigo-500/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{resume.fileName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-500 text-xs">{formatRelativeTime(resume.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {resume.analysis && (
                        <ScoreBadge score={resume.analysis.overallScore} />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/resume/${resume._id}`} className="flex-1">
                        <button className="w-full glass border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-xs py-1.5 rounded-lg transition-all hover:bg-indigo-500/10">
                          View Analysis
                        </button>
                      </Link>
                      <Link href={`/resume/${resume._id}`} className="flex-1">
                        <button className="w-full glass border border-violet-500/20 text-violet-400 hover:text-violet-300 text-xs py-1.5 rounded-lg transition-all hover:bg-violet-500/10">
                          Start Interview
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Interviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-['Outfit']">Recent Interviews</h2>
              <span className="text-gray-500 text-sm">{interviews.length} total</span>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : interviews.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Mic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">No interviews yet</p>
                <p className="text-gray-600 text-sm">Upload a resume and start a mock interview</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 5).map((interview) => {
                  const resumeName = typeof interview.resumeId === 'object'
                    ? interview.resumeId.fileName
                    : 'Resume';
                  return (
                    <motion.div
                      key={interview._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass rounded-2xl p-4 hover:border-violet-500/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center">
                            <Mic className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium truncate max-w-[160px]">{resumeName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-500 text-xs">{formatRelativeTime(interview.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          interview.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      {interview.status === 'completed' && interview.finalResults && (
                        <div className="flex items-center justify-between">
                          <ScoreBadge score={interview.finalResults.overallScore} />
                          <Link href={`/interview/${interview._id}/results`}>
                            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                              View Results →
                            </button>
                          </Link>
                        </div>
                      )}
                      {interview.status === 'in_progress' && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <Link href={`/interview/${interview._id}`}>
                            <span className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
                              Continue interview →
                            </span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
