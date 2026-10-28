'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Award,
  FileText,
  Mic,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, Interview } from '@/types';
import { formatDate, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { AssessmentAttempt } from '@/app/skillproof/page';

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [roadmapCount, setRoadmapCount] = useState(0);
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

      const storedTasks = localStorage.getItem('resumeai_roadmap_tasks');
      if (storedTasks) setRoadmapCount(JSON.parse(storedTasks).length);
    } catch {
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

  // Calculated Metrics from real records
  const validScores = resumes
    .map((r) => r.analysis?.overallScore)
    .filter((s): s is number => typeof s === 'number' && s > 0);

  const bestResumeScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const avgResumeScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
      : 0;

  // First vs Latest Resume Score Delta
  const firstScore = validScores.length > 0 ? validScores[validScores.length - 1] : 0;
  const latestScore = validScores.length > 0 ? validScores[0] : 0;
  const scoreDelta = validScores.length > 1 ? latestScore - firstScore : 0;

  // Interview metrics
  const completedIntvs = interviews.filter((i) => i.status === 'completed' && i.finalResults);
  const avgCommScore =
    completedIntvs.length > 0
      ? Math.round(
          completedIntvs.reduce((sum, i) => sum + (i.finalResults?.communicationScore || 0), 0) /
            completedIntvs.length
        )
      : 0;
  const avgTechScore =
    completedIntvs.length > 0
      ? Math.round(
          completedIntvs.reduce((sum, i) => sum + (i.finalResults?.technicalScore || 0), 0) /
            completedIntvs.length
        )
      : 0;
  const avgBehScore =
    completedIntvs.length > 0
      ? Math.round(
          completedIntvs.reduce((sum, i) => sum + (i.finalResults?.behavioralScore || 0), 0) /
            completedIntvs.length
        )
      : 0;

  // SkillProof metrics
  const verifiedCount = Array.from(new Set(attempts.filter((a) => a.passed).map((a) => a.domainId))).length;
  const avgAssessmentScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              Progress Analytics • Performance Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            Career Preparedness Analytics
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Real data tracking your score trends, verified technical credentials, and mock interview performance
          </p>
        </div>

        <Link href="/reports">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F46D8] text-white hover:bg-[#4338CA] transition-all shadow-xs self-start sm:self-auto">
            <span>View Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* ─── Top 4 Metric Summaries ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#77798B] font-bold mb-2">
            <span>RESUME QUALITY</span>
            <FileText className="w-4 h-4 text-[#4F46D8]" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            {latestScore > 0 ? `${latestScore} pts` : '—'}
          </div>
          <div className="text-[11px] text-[#77798B] mt-1 flex items-center gap-1">
            {scoreDelta > 0 && <span className="text-[#168575] font-bold">+{scoreDelta} pts improvement</span>}
            {scoreDelta < 0 && <span className="text-[#DC2626] font-bold">{scoreDelta} pts decrease</span>}
            {scoreDelta === 0 && <span>{resumes.length} total versions</span>}
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#77798B] font-bold mb-2">
            <span>SKILLPROOF TESTS</span>
            <ShieldCheck className="w-4 h-4 text-[#168575]" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            {attempts.length > 0 ? `${avgAssessmentScore}%` : '—'}
          </div>
          <div className="text-[11px] text-[#77798B] mt-1">
            <span>{verifiedCount} verified credential{verifiedCount !== 1 ? 's' : ''} earned</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#77798B] font-bold mb-2">
            <span>INTERVIEW RUBRIC</span>
            <Mic className="w-4 h-4 text-[#B7791F]" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            {completedIntvs.length > 0
              ? `${Math.round(
                  completedIntvs.reduce((sum, i) => sum + (i.finalResults?.overallScore || 0), 0) /
                    completedIntvs.length
                )}%`
              : '—'}
          </div>
          <div className="text-[11px] text-[#77798B] mt-1">
            <span>Across {completedIntvs.length} completed session{completedIntvs.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#77798B] font-bold mb-2">
            <span>ROADMAP PROGRESS</span>
            <TrendingUp className="w-4 h-4 text-[#4F46D8]" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            {roadmapCount} tasks
          </div>
          <div className="text-[11px] text-[#77798B] mt-1">
            <span>Milestones achieved</span>
          </div>
        </div>
      </div>

      {/* ─── Main Charts & Data Displays ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Resume Score Evolution History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4F46D8]" />
                <span>Resume Analysis Score Progression</span>
              </h2>
              <span className="text-xs text-[#77798B]">Real stored uploads</span>
            </div>

            {resumes.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#77798B]">
                No resume score history yet. Upload your resume to begin tracking score trajectory.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {resumes.slice(0, 5).map((r, idx) => {
                  const score = r.analysis?.overallScore || 0;
                  const color = getScoreColor(score);
                  return (
                    <div key={r._id} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#171A35] truncate max-w-[200px] sm:max-w-xs">
                          {r.fileName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#77798B]">{formatDate(r.createdAt)}</span>
                          <span className="font-black text-sm" style={{ color }}>
                            {score} / 100
                          </span>
                        </div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-[#FAF8F1] overflow-hidden border border-[#E7E1D4]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${score}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Mock Interview Rubric Performance */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#4F46D8]" />
              <span>Interview Rubric Sub-Scores</span>
            </h2>
            <p className="text-xs text-[#77798B]">
              Average rubric performance breakdown across communication, technical depth, and behavioral STAR answers:
            </p>

            {completedIntvs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#77798B]">
                Complete your first mock interview to generate rubric analytics.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#171A35]">Technical Problem Solving</span>
                    <span className="font-black text-[#4F46D8]">{avgTechScore}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#FAF8F1] overflow-hidden border border-[#E7E1D4]">
                    <div
                      className="h-full rounded-full bg-[#4F46D8]"
                      style={{ width: `${avgTechScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#171A35]">Communication & Clarity</span>
                    <span className="font-black text-[#168575]">{avgCommScore}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#FAF8F1] overflow-hidden border border-[#E7E1D4]">
                    <div
                      className="h-full rounded-full bg-[#168575]"
                      style={{ width: `${avgCommScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#171A35]">Behavioral & Leadership</span>
                    <span className="font-black text-[#B7791F]">{avgBehScore}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#FAF8F1] overflow-hidden border border-[#E7E1D4]">
                    <div
                      className="h-full rounded-full bg-[#B7791F]"
                      style={{ width: `${avgBehScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── SkillProof Assessment Performance Table ───────────────────────── */}
      <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#168575]" />
          <span>Practical Assessment Competency Matrix</span>
        </h3>

        {attempts.length === 0 ? (
          <p className="text-xs text-[#77798B] py-4 text-center">
            No assessment attempts yet. Take a technical assessment in SkillProof Lab to populate your competence matrix.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7E1D4] text-[#77798B] uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Domain</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Correct Answers</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D4]/60">
                {attempts.map((att) => (
                  <tr key={att.id}>
                    <td className="py-2.5 font-bold text-[#171A35]">{att.domainName}</td>
                    <td className="py-2.5 font-black text-sm">{att.score}%</td>
                    <td className="py-2.5 text-[#77798B]">
                      {att.correctCount} / {att.totalQuestions}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          att.passed
                            ? 'bg-[#168575]/15 text-[#168575]'
                            : 'bg-[#DC2626]/15 text-[#DC2626]'
                        }`}
                      >
                        {att.passed ? 'SkillProof Verified ★' : 'Needs Practice'}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#77798B]">{new Date(att.date).toLocaleDateString()}</td>
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
