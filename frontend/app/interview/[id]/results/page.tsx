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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Interview, InterviewResults } from '@/types';
import { getScoreColor, getScoreLabel } from '@/lib/utils';

function AnimatedRing({ score, label, size = 140 }: { score: number; label: string; size?: number }) {
  const [display, setDisplay] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    const ctrl = animate(0, score, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: v => setDisplay(Math.round(v)),
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
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashoffset}
            className="score-ring"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-['Outfit']" style={{ color }}>{display}</span>
          <span className="text-xs text-[#77798B]">{getScoreLabel(score)}</span>
        </div>
      </div>
      <p className="text-sm text-[#77798B] mt-2 text-center">{label}</p>
    </div>
  );
}

function AnimatedBar({ score, label, icon: Icon, delay = 0 }: { score: number; label: string; icon: React.ElementType; delay?: number }) {
  const color = getScoreColor(score);
  return (
    <div className="glass rounded-2xl p-4 border border-[#E7E1D4] bg-[#FFFFFF]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#77798B]" />
          <span className="text-[#171A35] text-sm font-medium">{label}</span>
        </div>
        <span className="font-bold text-lg" style={{ color }}>{score}</span>
      </div>
      <div className="w-full bg-[#F3F0FC] rounded-full h-2 border border-[#E7E1D4]/50">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}

export default function InterviewResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/interview/${id}`)
        .then(({ data }) => {
          if (data.success) setInterview(data.interview);
          else router.push('/dashboard');
        })
        .catch(() => router.push('/dashboard'))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, id, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!interview?.finalResults) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#77798B] mb-4">Results not available yet</p>
          <Link href="/dashboard">
            <button className="bg-[#4F46D8] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl transition-colors shadow-sm">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const results: InterviewResults = interview.finalResults;

  return (
    <div className="min-h-screen bg-[#FAF8F1] text-[#171A35]">
      {/* Top bar */}
      <div className="glass-strong border-b border-[#E7E1D4] px-6 py-4 flex items-center justify-between bg-[#FFFFFF]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#4F46D8] flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-[#171A35] font-bold font-['Outfit']">Interview Results</span>
        </div>
        <Link href="/dashboard">
          <button className="flex items-center gap-1.5 text-[#77798B] hover:text-[#171A35] text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-8 text-center border border-[#E7E1D4] bg-[#FFFFFF]"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-[#4F46D8] font-medium border border-[#E7E1D4] mb-6">
            <BarChart3 className="w-4 h-4" /> Overall Performance
          </div>
          <div className="flex justify-center mb-6">
            <AnimatedRing score={results.overallScore} label="Overall Score" size={180} />
          </div>
          <h2 className="text-3xl font-black font-['Outfit'] gradient-text mb-2">
            {results.overallScore >= 80 ? 'Excellent Work! 🎉' : results.overallScore >= 60 ? 'Good Effort! 👍' : 'Keep Practicing! 💪'}
          </h2>
          <p className="text-[#77798B]">
            You scored {results.overallScore}/100 in your mock interview
          </p>
        </motion.div>

        {/* Sub-scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <AnimatedBar score={results.communicationScore} label="Communication" icon={MessageSquare} delay={0.2} />
          <AnimatedBar score={results.technicalScore} label="Technical" icon={Brain} delay={0.3} />
          <AnimatedBar score={results.behavioralScore} label="Behavioral" icon={Mic} delay={0.4} />
        </motion.div>

        {/* Strengths & Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="glass rounded-2xl p-6 border border-[#E7E1D4] bg-[#FFFFFF]">
            <h3 className="text-[#168575] font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#168575]" /> Strengths
            </h3>
            <ul className="space-y-3">
              {results.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#168575]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#168575]" />
                  </div>
                  <span className="text-[#171A35] text-sm leading-relaxed">{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6 border border-[#E7E1D4] bg-[#FFFFFF]">
            <h3 className="text-amber-600 font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {results.areasForImprovement.map((area, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  </div>
                  <span className="text-[#171A35] text-sm leading-relaxed">{area}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Detailed Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-8 border border-[#E7E1D4] bg-[#FFFFFF]"
        >
          <h3 className="text-[#171A35] font-bold mb-4 flex items-center gap-2 font-['Outfit']">
            <Brain className="w-5 h-5 text-[#4F46D8]" /> Detailed AI Feedback
          </h3>
          <p className="text-[#171A35] text-sm leading-relaxed whitespace-pre-wrap">
            {results.detailedFeedback}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {typeof interview.resumeId === 'object' ? (
            <Link href={`/resume/${interview.resumeId._id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-2 bg-[#4F46D8] hover:bg-[#4338CA] text-white font-semibold px-8 py-3 rounded-xl transition-all glow-sm shadow-md"
              >
                <RefreshCw className="w-4 h-4" /> Start New Interview
              </motion.button>
            </Link>
          ) : null}
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 glass border border-[#E7E1D4] text-[#171A35] hover:bg-[#F3F0FC] font-semibold px-8 py-3 rounded-xl transition-all"
            >
              <Home className="w-4 h-4" /> Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
