'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, animate } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Mic,
  MessageSquare,
  Brain,
  ArrowLeft,
  Home,
  RefreshCw,
  Target,
  Award,
  BookOpen,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Interview, InterviewResults, CategoryScoreItem, QuestionAnalysis } from '@/types';
import { getScoreColor, getScoreLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

function AnimatedRing({ score, label, size = 150 }: { score: number; label: string; size?: number }) {
  const [display, setDisplay] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    const ctrl = animate(0, score, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return ctrl.stop;
  }, [score]);

  const dashoffset = circumference - (display / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7E1D4" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ filter: `drop-shadow(0 0 6px ${color}35)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-['Outfit']" style={{ color }}>
            {display}
          </span>
          <span className="text-[11px] font-semibold text-[#77798B]">{getScoreLabel(score)}</span>
        </div>
      </div>
      <p className="text-xs font-bold text-[#77798B] mt-2 text-center uppercase tracking-wider">{label}</p>
    </div>
  );
}

function CategoryBar({
  title,
  item,
  fallbackScore,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  item?: CategoryScoreItem;
  fallbackScore?: number;
  icon: React.ElementType;
  delay?: number;
}) {
  const isAssessed = item ? item.assessed : fallbackScore !== undefined;
  const score = item ? item.score : fallbackScore ?? 0;
  const color = isAssessed ? getScoreColor(score) : '#9CA3AF';

  return (
    <div className="rounded-xl p-4 border border-[#E7E1D4] bg-[#FFFFFF] shadow-2xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F1] border border-[#E7E1D4] flex items-center justify-center text-[#4F46D8]">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#171A35]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isAssessed ? (
            <span className="font-black text-sm font-['Outfit']" style={{ color }}>
              {score}/100
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Not Assessed
            </span>
          )}
        </div>
      </div>

      <div className="w-full bg-[#FAF8F1] rounded-full h-2 border border-[#E7E1D4]/60 overflow-hidden">
        {isAssessed && (
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay }}
          />
        )}
      </div>

      {item?.feedback && (
        <p className="text-[11px] text-[#77798B] line-clamp-2 leading-relaxed pt-1">
          {item.feedback}
        </p>
      )}
    </div>
  );
}

export default function InterviewResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      let isMounted = true;
      const fetchResults = () => {
        api
          .get(`/interview/${id}`)
          .then(({ data }) => {
            if (!isMounted) return;
            if (data.success && data.interview) {
              setInterview(data.interview);
              // If evaluating, poll again after 3 seconds
              if (data.interview.status === 'evaluating' && !data.interview.finalResults) {
                setTimeout(fetchResults, 3000);
              }
            } else {
              router.push('/interview');
            }
          })
          .catch(() => {
            if (!isMounted) return;
            toast.error('Failed to load interview evaluation');
            router.push('/interview');
          })
          .finally(() => {
            if (isMounted) setLoading(false);
          });
      };

      fetchResults();
      return () => {
        isMounted = false;
      };
    }
  }, [isAuthenticated, id, router]);

  const handleRetryEvaluation = async () => {
    setRetrying(true);
    try {
      toast.info('Generating comprehensive evaluation report...');
      const { data } = await api.post(`/interview/${id}/finish`);
      if (data.success && data.interview) {
        setInterview(data.interview);
        toast.success('Evaluation generated successfully!');
      } else {
        toast.error('Evaluation could not be completed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate evaluation. Please retry.');
    } finally {
      setRetrying(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!interview?.finalResults) {
    const isEvaluating = interview?.status === 'evaluating' || retrying;
    const isFailed = interview?.status === 'failed';

    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E7E1D4] text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center mx-auto">
            {isEvaluating ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : isFailed ? (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            ) : (
              <HelpCircle className="w-6 h-6 text-[#4F46D8]" />
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-[#171A35]">
              {isEvaluating
                ? 'Compiling Evaluation Report...'
                : isFailed
                ? 'Evaluation Incomplete'
                : 'Evaluation Report Pending'}
            </h2>
            <p className="text-xs text-[#77798B] mt-1 leading-relaxed">
              {isEvaluating
                ? 'Our AI hiring panel is reviewing your conversation transcript against role benchmarks and scoring each answer.'
                : isFailed
                ? 'The AI evaluation service experienced a temporary response issue. Your full interview transcript has been safely saved.'
                : 'This interview session is still in progress or the evaluation report has not yet been generated.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleRetryEvaluation}
              disabled={isEvaluating}
              className="w-full px-4 py-2.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Scoring Responses...' : 'Generate Evaluation Report'}</span>
            </button>

            <div className="flex gap-2">
              <Link href={`/interview/${id}`} className="flex-1">
                <button className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E1D4] text-[#171A35] hover:bg-[#FAF8F1] text-xs font-semibold">
                  Return to Chat
                </button>
              </Link>
              <Link href="/interview" className="flex-1">
                <button className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E1D4] text-[#77798B] hover:text-[#171A35] hover:bg-[#FAF8F1] text-xs font-semibold">
                  New Interview
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const results: InterviewResults = interview.finalResults;
  const overallScore = results.overallScore || 0;
  const performanceLevel = results.performanceLevel || getScoreLabel(overallScore);
  const questionsAnswered = results.questionsAnswered || interview.messages.filter((m) => m.role === 'candidate').length;
  const interviewerName = interview.interviewer?.name || 'AI Hiring Lead';

  // Category Score Items
  const catScores = results.categoryScores;

  return (
    <div className="min-h-screen bg-[#FAF8F1] text-[#171A35] pb-16">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="border-b border-[#E7E1D4] bg-[#FFFFFF] px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#4F46D8] text-white flex items-center justify-center shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm font-['Outfit'] text-[#171A35]">
              AI Mock Interview Evaluation Report
            </h1>
            <p className="text-[11px] text-[#77798B]">
              Role: <span className="font-semibold text-[#171A35]">{interview.targetRole || 'Software Professional'}</span> • Evaluated by {interviewerName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/interview">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E1D4] text-xs font-bold text-[#77798B] hover:text-[#171A35] hover:bg-[#FAF8F1] transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Interview</span>
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4F46D8] text-white text-xs font-bold hover:bg-[#4338CA] transition-all shadow-xs">
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Section 1: Hero Score Card ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <AnimatedRing score={overallScore} label="Overall Score" size={150} />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#4F46D8]/10 text-[#4F46D8] border border-[#4F46D8]/20">
                    Performance: {performanceLevel}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F1] text-[#77798B] border border-[#E7E1D4]">
                    {questionsAnswered} Questions Answered
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#168575]/10 text-[#168575] border border-[#168575]/20 capitalize">
                    {results.completionStatus || 'completed'} session
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-[#171A35]">
                  {overallScore >= 85
                    ? 'Exceptional Performance! Ready for the Role'
                    : overallScore >= 70
                    ? 'Strong Demonstration with Clear Refinement Areas'
                    : 'Foundational Knowledge with Practice Opportunities'}
                </h2>
                <p className="text-xs text-[#77798B] max-w-xl leading-relaxed">
                  {results.summary ||
                    results.detailedFeedback ||
                    'Comprehensive evaluation based on candidate depth, structured reasoning, STAR responses, and technical accuracy.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Link href="/interview" className="w-full">
                <button className="w-full px-5 py-2.5 rounded-xl bg-[#4F46D8] text-white text-xs font-bold hover:bg-[#4338CA] transition-all shadow-xs flex items-center justify-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Interview</span>
                </button>
              </Link>
              <Link href="/skillproof" className="w-full">
                <button className="w-full px-5 py-2.5 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-[#171A35] text-xs font-bold hover:border-[#4F46D8]/40 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#4F46D8]" />
                  <span>Practice in SkillProof</span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Category Breakdown ──────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4F46D8]" />
            <span>Category-by-Category Competency Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CategoryBar
              title="Technical Depth & Architecture"
              item={catScores?.technicalKnowledge}
              fallbackScore={results.technicalScore}
              icon={Brain}
              delay={0.1}
            />
            <CategoryBar
              title="Problem Solving & Critical Thinking"
              item={catScores?.problemSolving}
              fallbackScore={results.technicalScore}
              icon={Target}
              delay={0.15}
            />
            <CategoryBar
              title="Communication & Articulation"
              item={catScores?.communicationClarity}
              fallbackScore={results.communicationScore}
              icon={MessageSquare}
              delay={0.2}
            />
            <CategoryBar
              title="Behavioral & Leadership (STAR)"
              item={catScores?.behavioralCompetence}
              fallbackScore={results.behavioralScore}
              icon={Mic}
              delay={0.25}
            />
            <CategoryBar
              title="Role & Resume Grounding"
              item={catScores?.roleResumeAlignment}
              fallbackScore={results.overallScore}
              icon={UserCheck}
              delay={0.3}
            />
          </div>
        </div>

        {/* ── Section 3: Question-by-Question Analysis ───────────────── */}
        {results.questionAnalysis && results.questionAnalysis.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4F46D8]" />
              <span>Question-by-Question Deep Dive & Model Answers</span>
            </h2>

            <div className="space-y-4">
              {results.questionAnalysis.map((item, idx) => {
                const scoreColor = getScoreColor(item.score);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E1D4]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#4F46D8]/10 text-[#4F46D8] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-xs text-[#171A35]">
                          Question: {item.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B]">
                          Score:
                        </span>
                        <span className="text-xs font-black font-['Outfit']" style={{ color: scoreColor }}>
                          {item.score}/100
                        </span>
                      </div>
                    </div>

                    {/* Candidate Answer */}
                    <div className="p-3.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#77798B] block">
                        Your Transcript Answer:
                      </span>
                      <p className="text-xs text-[#171A35] leading-relaxed italic">
                        "{item.candidateAnswer || 'No response recorded'}"
                      </p>
                    </div>

                    {/* Feedback Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#168575]/5 border border-[#168575]/20 space-y-1">
                        <span className="font-bold text-[#168575] flex items-center gap-1.5 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> What Went Well
                        </span>
                        <p className="text-[11px] text-[#171A35] leading-relaxed">
                          {item.whatWentWell}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                        <span className="font-bold text-amber-700 flex items-center gap-1.5 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing Concepts
                        </span>
                        <p className="text-[11px] text-[#171A35] leading-relaxed">
                          {item.missingConcepts}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#4F46D8]/5 border border-[#4F46D8]/20 space-y-1">
                        <span className="font-bold text-[#4F46D8] flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> Recommended Adjustment
                        </span>
                        <p className="text-[11px] text-[#171A35] leading-relaxed">
                          {item.suggestedImprovement}
                        </p>
                      </div>
                    </div>

                    {/* Model Answer Box */}
                    {item.modelAnswerExample && (
                      <div className="p-3.5 rounded-xl bg-[#FAF8F1] border border-[#4F46D8]/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-[#4F46D8] font-bold text-[11px]">
                          <Award className="w-3.5 h-3.5" />
                          <span>Staff / Senior Benchmark Model Answer:</span>
                        </div>
                        <p className="text-xs text-[#171A35] leading-relaxed font-medium">
                          {item.modelAnswerExample}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Section 4: Strengths, Weaknesses & Resume Gaps ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strengths */}
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#168575] flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" /> Demonstrated Strengths
            </h3>
            <ul className="space-y-2">
              {results.strengths?.map((str, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#171A35] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#168575] mt-1.5 flex-shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-amber-700 flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Areas For Improvement
            </h3>
            <ul className="space-y-2">
              {results.areasForImprovement?.map((area, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#171A35] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Unsupported Claims & Gaps */}
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#4F46D8] flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Resume Claims & Interview Gaps
            </h3>
            <ul className="space-y-2">
              {(results.unsupportedClaimsOrGaps && results.unsupportedClaimsOrGaps.length > 0
                ? results.unsupportedClaimsOrGaps
                : ['Candidate answers aligned well with the claims presented on the resume.']
              ).map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#171A35] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46D8] mt-1.5 flex-shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Section 5: Personalized Improvement & Study Plan ───────── */}
        {results.personalizedPlan && (
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#4F46D8]" />
              <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                Personalized Improvement & Targeted Study Plan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2">
                <span className="font-bold text-[#171A35] block">
                  1. Priority Knowledge Domains to Review:
                </span>
                <ul className="space-y-1.5 text-[#77798B]">
                  {results.personalizedPlan.topicsToStudy?.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#4F46D8]" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2">
                <span className="font-bold text-[#171A35] block">
                  2. Targeted Exercises & Practice:
                </span>
                <ul className="space-y-1.5 text-[#77798B]">
                  {results.personalizedPlan.skillsToStrengthen?.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#4F46D8]" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2">
                <span className="font-bold text-[#171A35] block">
                  3. Recommended Practice Questions for Next Round:
                </span>
                <ul className="space-y-1.5 text-[#77798B]">
                  {results.personalizedPlan.recommendedPracticeQuestions?.map((q, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#4F46D8]" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2">
                <span className="font-bold text-[#171A35] block">
                  4. Actionable Next Steps:
                </span>
                <ul className="space-y-1.5 text-[#77798B]">
                  {results.personalizedPlan.actionableNextSteps?.map((a, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#4F46D8]" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 6: Readiness & Final Summary ───────────────────── */}
        <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4F46D8]" />
            <span>Hiring Readiness Assessment & Recommendations</span>
          </h2>

          <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#77798B] uppercase tracking-wider block mb-0.5">
                Readiness Assessment:
              </span>
              <p className="font-bold text-[#171A35] leading-relaxed">
                {results.finalSummary?.readinessAssessment ||
                  `Candidate exhibits solid capability for ${interview.targetRole || 'this position'}. Address the priority improvement points before live panels.`}
              </p>
            </div>

            {results.finalSummary?.priorityImprovements && results.finalSummary.priorityImprovements.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-[#77798B] uppercase tracking-wider block mb-1">
                  Top 3 Priority Improvements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {results.finalSummary.priorityImprovements.map((pri, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#E7E1D4] font-medium text-[11px] text-[#171A35]">
                      <span className="text-[#4F46D8] font-bold mr-1">#{idx + 1}</span> {pri}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.finalSummary?.recommendedNextSession && (
              <div className="pt-2 border-t border-[#E7E1D4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[#77798B] text-[11px]">
                  Recommended next practice: <span className="font-semibold text-[#171A35]">{results.finalSummary.recommendedNextSession}</span>
                </span>
                <Link href="/interview">
                  <button className="text-xs font-bold text-[#4F46D8] hover:underline flex items-center gap-1">
                    <span>Schedule this session</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/interview">
              <button className="px-6 py-2.5 rounded-xl bg-[#4F46D8] text-white text-xs font-bold hover:bg-[#4338CA] transition-all shadow-xs flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Mock Interview</span>
              </button>
            </Link>
            <Link href="/skillproof">
              <button className="px-6 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] text-xs font-bold hover:border-[#4F46D8]/50 transition-all flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46D8]" />
                <span>Test Skills in SkillProof</span>
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-2.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B] text-xs font-bold hover:text-[#171A35] transition-all flex items-center gap-2">
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
