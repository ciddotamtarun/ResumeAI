'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion';
import {
  FileText,
  FileEdit,
  CheckCircle,
  AlertTriangle,
  Tag,
  Mic,
  ArrowLeft,
  ExternalLink,
  Brain,
  Zap,
  Target,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, ResumeImprovement } from '@/types';
import { formatDate, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AnimatedScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function AnimatedScore({ score, size = 180, strokeWidth = 12 }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return controls.stop;
  }, [score]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E1D4"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="score-ring"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black font-['Outfit']" style={{ color }}>
          {displayScore}
        </span>
        <span className="text-sm text-[#77798B]">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

const sectionKeys = ['contact', 'summary', 'experience', 'education', 'skills', 'formatting'] as const;

function SectionCard({ name, score, feedback }: { name: string; score: number; feedback: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(score);

  return (
    <motion.div
      className="glass rounded-2xl p-4 cursor-pointer hover:border-[#4F46D8]/30 transition-all border border-[#E7E1D4] bg-[#FFFFFF]"
      onClick={() => setExpanded(!expanded)}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg width="48" height="48" className="-rotate-90">
            <circle cx="24" cy="24" r="18" fill="none" stroke="#E7E1D4" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="18" fill="none"
              stroke={color} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 113} 113`}
              style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
            {score}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[#171A35] font-semibold capitalize">{name}</p>
            <span className="text-[#77798B] text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
          <div className="w-full bg-[#F3F0FC] rounded-full h-1.5 mt-1 border border-[#E7E1D4]/50">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </div>
      {expanded && feedback.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-1.5 border-t border-[#E7E1D4] pt-3"
        >
          {feedback.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#77798B]">
              <span className="text-[#4F46D8] mt-0.5 flex-shrink-0">•</span>
              {item}
            </li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}

function ImprovementCard({ improvement }: { improvement: ResumeImprovement }) {
  return (
    <div className="glass rounded-2xl p-5 border border-[#E7E1D4] bg-[#FFFFFF]">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-[#4F46D8] border-[#4F46D8]/30 bg-[#F3F0FC] capitalize">
          {improvement.section}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-red-500 font-semibold mb-2 uppercase tracking-wide">Before</p>
          <p className="text-[#171A35] text-sm leading-relaxed">{improvement.original}</p>
        </div>
        <div className="bg-[#168575]/5 border border-[#168575]/20 rounded-xl p-4">
          <p className="text-xs text-[#168575] font-semibold mb-2 uppercase tracking-wide">After</p>
          <p className="text-[#171A35] text-sm leading-relaxed">{improvement.suggested}</p>
        </div>
      </div>
      {improvement.reason && (
        <p className="text-[#77798B] text-xs mt-3 flex items-start gap-1.5">
          <Brain className="w-3.5 h-3.5 text-[#4F46D8] flex-shrink-0 mt-0.5" />
          {improvement.reason}
        </p>
      )}
    </div>
  );
}

export default function ResumeAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/resume/${id}`)
        .then(({ data }) => {
          if (data.success) setResume(data.resume);
        })
        .catch(() => router.push('/dashboard'))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, id, router]);

  const startInterview = async () => {
    if (!resume) return;
    setStartingInterview(true);
    try {
      const { data } = await api.post('/interview/start', {
        resumeId: resume._id,
        provider: resume.aiProvider,
      });
      if (data.success) {
        router.push(`/interview/${data.interview._id}`);
      }
    } catch {
      setStartingInterview(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!resume) return null;

  const { analysis, improvements } = resume;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-2">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Link href="/dashboard" className="flex items-center gap-1.5 text-[#77798B] hover:text-[#171A35] text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <span className="text-[#E7E1D4]">•</span>
              <Link href="/resume-builder" className="flex items-center gap-1.5 text-[#4F46D8] hover:underline text-sm font-semibold transition-colors">
                <FileEdit className="w-3.5 h-3.5" /> Resume Builder
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <FileText className="w-5 h-5 text-[#4F46D8]" />
              <h1 className="text-2xl font-black text-[#171A35] font-['Outfit'] truncate max-w-md">{resume.fileName}</h1>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(resume as any).targetRole && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-[#F3F0FC] text-[#4F46D8] border border-[#E7E1D4]">
                  <Target className="w-3 h-3" />
                  Targeting: {(resume as any).targetRole}
                </span>
              )}
              <span className="text-[#77798B] text-sm">{formatDate(resume.createdAt)}</span>
            </div>
          </div>

          <motion.button
            onClick={startInterview}
            disabled={startingInterview}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-[#4F46D8] hover:bg-[#4338CA] text-white font-semibold px-6 py-3 rounded-xl transition-all glow-sm disabled:opacity-60 flex-shrink-0 shadow-md"
          >
            <Mic className="w-4 h-4" />
            {startingInterview ? 'Starting...' : 'Start Mock Interview'}
          </motion.button>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 mb-8 border border-[#E7E1D4] bg-[#FFFFFF]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex flex-col items-center">
              <p className="text-[#77798B] text-sm mb-4 font-medium">Overall Resume Score</p>
              <AnimatedScore score={analysis.overallScore} />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#77798B]">ATS Compatibility</span>
                  <span className="text-[#171A35] font-bold">{analysis.atsCompatibility}%</span>
                </div>
                <div className="w-full bg-[#F3F0FC] rounded-full h-2 border border-[#E7E1D4]/50">
                  <motion.div
                    className="h-full rounded-full bg-[#4F46D8]"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.atsCompatibility}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sectionKeys.slice(0, 4).map((key) => (
                  <div key={key} className="bg-[#FAF8F1] rounded-xl p-3 border border-[#E7E1D4]">
                    <p className="text-[#77798B] text-xs capitalize mb-1">{key}</p>
                    <p className="font-bold text-lg" style={{ color: getScoreColor(analysis.sections[key]?.score || 0) }}>
                      {analysis.sections[key]?.score || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#168575]/10 border border-[#168575]/20 rounded-2xl p-4">
                <p className="text-[#168575] text-xs font-semibold uppercase mb-2">Top Strength</p>
                <p className="text-[#171A35] text-sm">{analysis.strengths[0] || 'N/A'}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-amber-600 text-xs font-semibold uppercase mb-2">Top Priority</p>
                <p className="text-[#171A35] text-sm">{analysis.improvements[0] || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="sections">
          <TabsList className="bg-[#FFFFFF] mb-6 p-1 rounded-xl border border-[#E7E1D4] shadow-sm">
            <TabsTrigger value="sections" className="data-[state=active]:bg-[#4F46D8] data-[state=active]:text-white text-[#77798B] rounded-lg">
              Section Scores
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-[#4F46D8] data-[state=active]:text-white text-[#77798B] rounded-lg">
              Insights
            </TabsTrigger>
            <TabsTrigger value="improvements" className="data-[state=active]:bg-[#4F46D8] data-[state=active]:text-white text-[#77798B] rounded-lg">
              Improvements
            </TabsTrigger>
            <TabsTrigger value="keywords" className="data-[state=active]:bg-[#4F46D8] data-[state=active]:text-white text-[#77798B] rounded-lg">
              Keywords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {sectionKeys.map((key) => (
                <SectionCard
                  key={key}
                  name={key}
                  score={analysis.sections[key]?.score || 0}
                  feedback={analysis.sections[key]?.feedback || []}
                />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6 border border-[#E7E1D4] bg-[#FFFFFF]">
                <h3 className="text-[#168575] font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#168575]" /> Strengths
                </h3>
                <ul className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#168575]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-[#168575]" />
                      </div>
                      <span className="text-[#171A35] text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 border border-[#E7E1D4] bg-[#FFFFFF]">
                <h3 className="text-amber-600 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {analysis.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="text-[#171A35] text-sm leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="improvements">
            <div className="space-y-4">
              {improvements && improvements.length > 0 ? (
                improvements.map((imp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <ImprovementCard improvement={imp} />
                  </motion.div>
                ))
              ) : (
                <div className="glass rounded-2xl p-10 text-center border border-[#E7E1D4] bg-[#FFFFFF]">
                  <ExternalLink className="w-10 h-10 text-[#77798B] mx-auto mb-3" />
                  <p className="text-[#77798B]">No improvement suggestions available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="keywords">
            <div className="glass rounded-2xl p-6 border border-[#E7E1D4] bg-[#FFFFFF]">
              <h3 className="text-[#171A35] font-bold mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#4F46D8]" /> Detected Keywords
              </h3>
              <p className="text-[#77798B] text-sm mb-5">These keywords were found in your resume and may help with ATS systems.</p>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((kw, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-3 py-1.5 rounded-full bg-[#F3F0FC] border border-[#E7E1D4] text-[#4F46D8] text-sm font-medium"
                  >
                    {kw}
                  </motion.span>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
