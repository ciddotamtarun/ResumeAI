'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileText,
  Volume2,
  Play,
  RotateCcw,
  Award,
  Layers,
  Flame,
  Check,
  AlertCircle,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, Interview, InterviewCategory, InterviewDifficulty } from '@/types';
import { formatDate, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

interface InterviewerOption {
  id: 'female' | 'male';
  name: string;
  role: string;
  avatar: string;
  persona: string;
  voiceStyle: string;
  previewText: string;
}

const INTERVIEWERS: InterviewerOption[] = [
  {
    id: 'female',
    name: 'Sarah Jenkins',
    role: 'Senior Technical Recruiter & Hiring Lead',
    avatar: '/avatars/female.svg',
    persona: 'Professional, warm, highly structured, and focused on behavioral depth, team leadership, and culture addition.',
    voiceStyle: 'Clear, encouraging, natural cadence',
    previewText: "Hello! I'm Sarah Jenkins. I'm excited to learn more about your experience and how you approach complex challenges.",
  },
  {
    id: 'male',
    name: 'David Chen',
    role: 'Director of Engineering & Systems Architect',
    avatar: '/avatars/male.svg',
    persona: 'Analytical, direct, deeply technical, probing system design choices, architectural trade-offs, and scalability.',
    voiceStyle: 'Methodical, measured, authoritative',
    previewText: "Hello! I'm David Chen. I look forward to discussing your technical background, architecture decisions, and problem solving.",
  },
];

const CATEGORIES: { id: InterviewCategory; title: string; desc: string; icon: any }[] = [
  {
    id: 'mixed',
    title: 'Balanced Simulation',
    desc: 'Holistic mix of technical depth, real-world architecture, leadership, and STAR behavioral scenarios.',
    icon: Sparkles,
  },
  {
    id: 'technical',
    title: 'Technical & Architecture',
    desc: 'Deep dive into coding fundamentals, data structures, concurrency, distributed systems, and trade-offs.',
    icon: Brain,
  },
  {
    id: 'hr',
    title: 'HR & Culture Addition',
    desc: 'Career trajectory, compensation expectations, work style, values alignment, and communication.',
    icon: UserCheck,
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Leadership',
    desc: 'Scenario-based evaluation following the STAR framework, conflict resolution, and high-stakes ownership.',
    icon: Mic,
  },
];

const DIFFICULTIES: { id: InterviewDifficulty; label: string; desc: string; badgeColor: string }[] = [
  {
    id: 'easy',
    label: 'Entry / Junior Bar',
    desc: 'Foundational concepts, structured behavioral prompts, supportive guidance.',
    badgeColor: 'text-[#168575] bg-[#168575]/10 border-[#168575]/30',
  },
  {
    id: 'medium',
    label: 'Mid / Senior Bar',
    desc: 'Industry standard expectations, situational debugging, architectural trade-offs.',
    badgeColor: 'text-[#4F46D8] bg-[#4F46D8]/10 border-[#4F46D8]/30',
  },
  {
    id: 'difficult',
    label: 'Staff / Principal Bar',
    desc: 'Ambiguous systems, edge cases, failure recovery under pressure, high-level governance.',
    badgeColor: 'text-[#B45309] bg-[#B45309]/10 border-[#B45309]/30',
  },
];

const QUESTION_COUNTS = [
  { count: 5, label: '5 Questions', time: '~10 mins (Quick Check)' },
  { count: 10, label: '10 Questions', time: '~20 mins (Standard Round)' },
  { count: 15, label: '15 Questions', time: '~35 mins (Full Loop)' },
];

export default function InterviewLabPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');
  const [interviewerId, setInterviewerId] = useState<'female' | 'male'>('female');
  const [category, setCategory] = useState<InterviewCategory>('mixed');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [starting, setStarting] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<'female' | 'male' | null>(null);

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
        setCustomRole(resList[0].targetRole || 'Full Stack Engineer');
      }
    } catch {
      toast.error('Failed to load interview setup data');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  const handleResumeChange = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const found = resumes.find((r) => r._id === resumeId);
    if (found && found.targetRole) {
      setCustomRole(found.targetRole);
    }
  };

  const playVoicePreview = (interviewer: InterviewerOption) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Speech synthesis is not supported by your browser.');
      return;
    }
    window.speechSynthesis.cancel();
    setPreviewingVoice(interviewer.id);

    const utterance = new SpeechSynthesisUtterance(interviewer.previewText);
    const voices = window.speechSynthesis.getVoices();

    if (interviewer.id === 'female') {
      const femaleVoice = voices.find(
        (v) => /female|zira|samantha|victoria|karen/i.test(v.name) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.05;
      utterance.rate = 0.98;
    } else {
      const maleVoice = voices.find(
        (v) => /male|david|george|alex|daniel/i.test(v.name) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.9;
      utterance.rate = 0.98;
    }

    utterance.onend = () => setPreviewingVoice(null);
    utterance.onerror = () => setPreviewingVoice(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartInterview = async () => {
    if (!selectedResumeId) {
      toast.error('Please upload and select an analyzed resume before starting.');
      return;
    }

    setStarting(true);
    try {
      const res = await api.post('/interview/start', {
        resumeId: selectedResumeId,
        targetRole: customRole.trim() || selectedResume?.targetRole || 'Software Professional',
        interviewerId,
        category,
        difficulty,
        questionCount,
        provider: 'gemini',
      });

      if (res.data.success && res.data.interview) {
        toast.success(`Starting session with ${interviewerId === 'male' ? 'David Chen' : 'Sarah Jenkins'}`);
        router.push(`/interview/${res.data.interview._id}`);
      } else {
        toast.error('Could not create interview session');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Server error starting interview';
      toast.error(msg);
    } finally {
      setStarting(false);
    }
  };

  const completedInterviews = interviews.filter((i) => i.status === 'completed');

  return (
    <AppShell>
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mic className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              AI Mock Interview Simulator
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            Interactive Interview Simulator
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Real-time conversational practice grounded in your uploaded resume, with speech, avatar feedback, and rubric evaluation.
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
            <span className="text-[10px] text-[#77798B]">Full rubric evaluations</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* ── Left / Main Config Column ────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section A: Resume & Target Role */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#4F46D8]/10 text-[#4F46D8] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                    Resume & Target Job Role
                  </h2>
                  <p className="text-[11px] text-[#77798B]">
                    Questions will be directly grounded in the skills, projects, and work history from this document.
                  </p>
                </div>
              </div>
              <Link href="/resume-studio" className="text-xs font-bold text-[#4F46D8] hover:underline flex items-center gap-1">
                <span>Upload New</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {resumes.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FAF8F1] border border-dashed border-[#E7E1D4] text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-[#B45309] mx-auto" />
                <p className="text-xs font-bold text-[#171A35]">No analyzed resumes found</p>
                <p className="text-[11px] text-[#77798B]">
                  To conduct a personalized interview that references your real background, please upload and analyze a resume first.
                </p>
                <Link href="/resume-studio">
                  <button className="mt-2 px-4 py-2 rounded-xl bg-[#4F46D8] text-white text-xs font-bold shadow-xs hover:bg-[#4338CA]">
                    Upload Resume Now
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resumes.map((r) => {
                  const isSelected = r._id === selectedResumeId;
                  const score = r.analysis?.overallScore || 0;
                  return (
                    <div
                      key={r._id}
                      onClick={() => handleResumeChange(r._id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-[#4F46D8] bg-[#F3F0FC] shadow-xs ring-2 ring-[#4F46D8]/20'
                          : 'border-[#E7E1D4] bg-[#FAF8F1] hover:border-[#4F46D8]/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-[#4F46D8]' : 'text-[#77798B]'}`} />
                        <div>
                          <p className="font-bold text-[#171A35] line-clamp-1">{r.fileName}</p>
                          <p className="text-[10px] text-[#77798B] mt-0.5">
                            Target: <span className="font-semibold text-[#171A35]">{r.targetRole || 'General'}</span>
                          </p>
                          <p className="text-[10px] text-[#77798B] mt-0.5">
                            Analyzed: {formatDate(r.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white border border-[#E7E1D4] text-[#4F46D8]">
                          {score} pts
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#4F46D8]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Target Role input / edit */}
            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                Target Interview Role
              </label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer, Frontend Specialist, Cloud Architect"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs font-semibold text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
              />
            </div>
          </div>

          {/* Section B: AI Interviewer Avatar & Voice */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4F46D8]/10 text-[#4F46D8] flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div>
                <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                  Select AI Interviewer Persona & Voice
                </h2>
                <p className="text-[11px] text-[#77798B]">
                  Choose who conducts your session. Each interviewer has an avatar, tailored tone, and distinct vocal style.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTERVIEWERS.map((interviewer) => {
                const isSelected = interviewerId === interviewer.id;
                const isPlaying = previewingVoice === interviewer.id;
                return (
                  <div
                    key={interviewer.id}
                    onClick={() => setInterviewerId(interviewer.id)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#4F46D8] bg-[#F3F0FC]/70 ring-2 ring-[#4F46D8]/20 shadow-xs'
                        : 'border-[#E7E1D4] bg-[#FAF8F1] hover:border-[#4F46D8]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-[#4F46D8]/30 shadow-xs flex-shrink-0">
                            <img
                              src={interviewer.avatar}
                              alt={interviewer.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-xs text-[#171A35]">{interviewer.name}</h3>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-[#4F46D8] text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-[#4F46D8] block">
                              {interviewer.role}
                            </span>
                            <span className="text-[10px] text-[#77798B] mt-0.5 block">
                              Voice: {interviewer.voiceStyle}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#77798B] leading-relaxed line-clamp-3 mb-3">
                        {interviewer.persona}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E7E1D4] flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#77798B]">
                        {interviewer.id === 'female' ? 'Recruiter Focus' : 'Engineering Focus'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoicePreview(interviewer);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          isPlaying
                            ? 'bg-[#4F46D8] text-white animate-pulse'
                            : 'bg-white border border-[#E7E1D4] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isPlaying ? 'Speaking...' : 'Preview Voice'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Interview Category */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4F46D8]/10 text-[#4F46D8] flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                  Interview Category & Question Focus
                </h2>
                <p className="text-[11px] text-[#77798B]">
                  Tailor the distribution of questions to the specific round you are preparing for.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#4F46D8] bg-[#F3F0FC] ring-2 ring-[#4F46D8]/20 shadow-xs'
                        : 'border-[#E7E1D4] bg-[#FAF8F1] hover:border-[#4F46D8]/40'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#4F46D8] text-white' : 'bg-[#FFFFFF] border border-[#E7E1D4] text-[#77798B]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#171A35]">{cat.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#4F46D8]" />}
                      </div>
                      <p className="text-[11px] text-[#77798B] mt-0.5 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D: Difficulty Level */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4F46D8]/10 text-[#4F46D8] flex items-center justify-center font-bold text-xs">
                D
              </div>
              <div>
                <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                  Difficulty Level
                </h2>
                <p className="text-[11px] text-[#77798B]">
                  Calibrate the scrutiny and depth applied during follow-up questions and final rubric scoring.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <div
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#4F46D8] bg-[#F3F0FC] ring-2 ring-[#4F46D8]/20 shadow-xs'
                        : 'border-[#E7E1D4] bg-[#FAF8F1] hover:border-[#4F46D8]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#171A35]">{diff.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#4F46D8]" />}
                    </div>
                    <p className="text-[11px] text-[#77798B] leading-relaxed">
                      {diff.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section E: Session Length */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4F46D8]/10 text-[#4F46D8] flex items-center justify-center font-bold text-xs">
                E
              </div>
              <div>
                <h2 className="text-sm font-bold font-['Outfit'] text-[#171A35]">
                  Question Count Preset
                </h2>
                <p className="text-[11px] text-[#77798B]">
                  Select the target number of interview questions before comprehensive evaluation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {QUESTION_COUNTS.map((opt) => {
                const isSelected = questionCount === opt.count;
                return (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setQuestionCount(opt.count)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#4F46D8] bg-[#4F46D8] text-white shadow-xs'
                        : 'border-[#E7E1D4] bg-[#FAF8F1] text-[#77798B] hover:text-[#171A35]'
                    }`}
                  >
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#77798B]'}`}>
                      {opt.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Right Column: Summary Card & Action ──────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs sticky top-6 space-y-5">
            <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46D8]" />
              <span>Session Configuration</span>
            </h3>

            {/* Selected Interviewer Banner */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex items-center gap-3">
              <img
                src={interviewerId === 'male' ? '/avatars/male.svg' : '/avatars/female.svg'}
                alt="Selected Interviewer"
                className="w-12 h-12 rounded-full border border-[#4F46D8]/30 bg-white"
              />
              <div>
                <span className="text-xs font-bold text-[#171A35] block">
                  {interviewerId === 'male' ? 'David Chen' : 'Sarah Jenkins'}
                </span>
                <span className="text-[10px] text-[#4F46D8] font-semibold block">
                  {interviewerId === 'male' ? 'Director of Engineering' : 'Senior Hiring Lead'}
                </span>
                <span className="text-[10px] text-[#77798B]">
                  Voice: {interviewerId === 'male' ? 'Male (Analytical)' : 'Female (Structured)'}
                </span>
              </div>
            </div>

            {/* Config Specs Table */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#E7E1D4]">
                <span className="text-[#77798B]">Target Role</span>
                <span className="font-bold text-[#171A35] line-clamp-1 max-w-[180px] text-right">
                  {customRole || 'Software Professional'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E7E1D4]">
                <span className="text-[#77798B]">Category</span>
                <span className="font-bold text-[#171A35] capitalize">
                  {category}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E7E1D4]">
                <span className="text-[#77798B]">Difficulty</span>
                <span className="font-bold text-[#171A35] capitalize">
                  {difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E7E1D4]">
                <span className="text-[#77798B]">Questions</span>
                <span className="font-bold text-[#4F46D8]">
                  {questionCount} Questions
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#77798B]">Grounding Resume</span>
                <span className="font-bold text-[#171A35] line-clamp-1 max-w-[160px] text-right">
                  {selectedResume ? selectedResume.fileName : 'None selected'}
                </span>
              </div>
            </div>

            {/* Launch CTA */}
            <button
              onClick={handleStartInterview}
              disabled={starting || !selectedResumeId}
              className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Preparing AI Interview Environment...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Mock Interview</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-[#77798B] leading-relaxed">
              Camera & microphone access is requested in-session for realistic simulation. You can also type answers at any time.
            </p>
          </div>
        </div>
      </div>

      {/* ── Completed Interview Sessions & History ────────────────── */}
      <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-['Outfit'] text-[#171A35]">
            Past Interview Sessions & Evaluations
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
              const interviewerName = intv.interviewer?.name || 'AI Interviewer';
              const avatarSrc = intv.interviewer?.avatar || '/avatars/female.svg';

              return (
                <div
                  key={intv._id}
                  className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#4F46D8]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarSrc}
                      alt={interviewerName}
                      className="w-10 h-10 rounded-full border border-[#E7E1D4] bg-white object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#171A35]">
                          {intv.targetRole || 'Software Professional'}
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
                        <span className="text-[10px] text-[#77798B] hidden md:inline">
                          Interviewer: {interviewerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#77798B] mt-0.5">
                        <span>{resumeName}</span>
                        <span>•</span>
                        <span>{formatDate(intv.createdAt)}</span>
                        <span>•</span>
                        <span>{intv.messages?.length || 0} exchanges</span>
                        {intv.category && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{intv.category}</span>
                          </>
                        )}
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
