'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  History,
  FileText,
  ShieldCheck,
  Mic,
  Briefcase,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, Interview } from '@/types';
import { formatDate, formatRelativeTime, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { AssessmentAttempt } from '@/app/skillproof/page';
import { SavedJobMatch } from '@/app/job-matcher/page';
import { toast } from 'sonner';

type ActivityType = 'all' | 'resume' | 'skillproof' | 'interview' | 'match';

interface UnifiedActivity {
  id: string;
  type: 'resume' | 'skillproof' | 'interview' | 'match';
  title: string;
  subtitle: string;
  score?: number;
  statusText?: string;
  statusColor?: string;
  date: string;
  actionHref: string;
  actionLabel: string;
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [jobMatches, setJobMatches] = useState<SavedJobMatch[]>([]);
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
      setResumes(resRes.data.resumes || []);
      setInterviews(intRes.data.interviews || []);

      const storedAttempts = localStorage.getItem('resumeai_skillproof_attempts');
      if (storedAttempts) setAttempts(JSON.parse(storedAttempts));

      const storedMatches = localStorage.getItem('resumeai_job_matches');
      if (storedMatches) setJobMatches(JSON.parse(storedMatches));
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  if (isLoading || loading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4F46D8]/20 border-t-[#4F46D8]" />
        </div>
      </AppShell>
    );
  }

  // Combine into unified activity feed
  const activities: UnifiedActivity[] = [
    ...resumes.map((r) => ({
      id: `res_${r._id}`,
      type: 'resume' as const,
      title: r.fileName,
      subtitle: `Target Role: ${r.targetRole || 'General'} • ATS: ${r.analysis?.atsCompatibility || 0}%`,
      score: r.analysis?.overallScore || 0,
      statusText: `${r.analysis?.overallScore || 0} pts`,
      statusColor: getScoreColor(r.analysis?.overallScore || 0),
      date: r.createdAt,
      actionHref: `/resume/${r._id}`,
      actionLabel: 'View Analysis',
    })),
    ...attempts.map((a) => ({
      id: a.id,
      type: 'skillproof' as const,
      title: a.domainName,
      subtitle: `${a.correctCount} / ${a.totalQuestions} questions correct`,
      score: a.score,
      statusText: a.passed ? 'SkillProof Verified ★' : 'Needs Retest',
      statusColor: a.passed ? '#168575' : '#DC2626',
      date: a.date,
      actionHref: '/skillproof',
      actionLabel: 'Open SkillProof',
    })),
    ...interviews.map((i) => {
      const resumeName =
        typeof i.resumeId === 'object' && i.resumeId !== null
          ? i.resumeId.fileName
          : 'Resume';
      const isDone = i.status === 'completed';
      const score = i.finalResults?.overallScore;
      return {
        id: `int_${i._id}`,
        type: 'interview' as const,
        title: `${i.targetRole || 'Mock Interview'} Session`,
        subtitle: `Grounded in ${resumeName} • ${i.messages?.length || 0} messages`,
        score,
        statusText: isDone ? (score ? `Score: ${score}%` : 'Completed') : 'In Progress',
        statusColor: isDone ? '#168575' : '#B7791F',
        date: i.createdAt,
        actionHref: isDone ? `/interview/${i._id}/results` : `/interview/${i._id}`,
        actionLabel: isDone ? 'View Results' : 'Resume Session',
      };
    }),
    ...jobMatches.map((m) => ({
      id: m.id,
      type: 'match' as const,
      title: `${m.jobTitle} @ ${m.company}`,
      subtitle: `Compared with ${m.resumeName} • ${m.matchedCount} matched skills`,
      score: m.matchScore,
      statusText: `${m.matchScore}% Match`,
      statusColor: m.matchScore >= 75 ? '#168575' : '#B7791F',
      date: m.date,
      actionHref: '/job-matcher',
      actionLabel: 'Open Job Matcher',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = activities.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText className="w-4 h-4 text-[#4F46D8]" />;
      case 'skillproof':
        return <ShieldCheck className="w-4 h-4 text-[#168575]" />;
      case 'interview':
        return <Mic className="w-4 h-4 text-[#B7791F]" />;
      case 'match':
        return <Briefcase className="w-4 h-4 text-[#4F46D8]" />;
      default:
        return <History className="w-4 h-4 text-[#77798B]" />;
    }
  };

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              History • Activity Timeline
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            Unified Career Activity Log
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Audit history across all uploaded resumes, technical assessments, mock interviews, and job match evaluations
          </p>
        </div>

        <div className="text-xs text-[#77798B] bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#E7E1D4]">
          <strong className="text-[#171A35]">{activities.length}</strong> total events recorded
        </div>
      </div>

      {/* ─── Filter Tabs & Search Bar ──────────────────────────────────────── */}
      <div className="rounded-2xl p-4 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All (${activities.length})` },
              { id: 'resume', label: `Resumes (${resumes.length})` },
              { id: 'skillproof', label: `SkillProof (${attempts.length})` },
              { id: 'interview', label: `Interviews (${interviews.length})` },
              { id: 'match', label: `Job Matches (${jobMatches.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  filterType === tab.id
                    ? 'bg-[#4F46D8] text-white border-[#4F46D8] font-bold shadow-xs'
                    : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4] hover:text-[#171A35]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77798B]" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
            />
          </div>
        </div>
      </div>

      {/* ─── Timeline Feed ────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#77798B]">
            No activity matches your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-[#E7E1D4]/60">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#171A35]">{item.title}</span>
                      {item.statusText && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.2 rounded-md"
                          style={{
                            background: `${item.statusColor || '#4F46D8'}15`,
                            color: item.statusColor || '#4F46D8',
                          }}
                        >
                          {item.statusText}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#77798B] mt-0.5">{item.subtitle}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#77798B] mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.date)}</span>
                      <span>({formatRelativeTime(item.date)})</span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-auto">
                  <Link href={item.actionHref}>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FAF8F1] border border-[#E7E1D4] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-all shadow-xs">
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
