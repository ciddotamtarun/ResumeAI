'use client';

import { useEffect, useState, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Send,
  X,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  CheckCircle,
  Flag,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Interview } from '@/types';
import { toast } from 'sonner';

// ─── Web Speech API Typings ──────────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function LiveInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Interview state
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [canRetryQuestion, setCanRetryQuestion] = useState(false);

  // A/V State
  const [cameraActive, setCameraActive] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Refs
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const latestSpokenMsgIdRef = useRef<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch Interview
  const fetchInterview = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/interview/${id}`);
      if (data.success && data.interview) {
        setInterview(data.interview);
        // If interview was already completed, redirect to results
        if (data.interview.status === 'completed' && data.interview.finalResults) {
          router.push(`/interview/${id}/results`);
        }
      }
    } catch {
      toast.error('Failed to load interview session');
      router.push('/interview');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchInterview();
    }
  }, [isAuthenticated, id, fetchInterview]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages, isAiTyping]);

  // ─── Camera Setup (User) ───────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera could not be started:', err?.message || err);
      setCameraActive(false);
    }
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err: any) {
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          toast.error('No camera found on your device.');
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          toast.error('Camera permission denied.');
        } else {
          toast.error(`Camera error: ${err.message || 'Check permissions'}`);
        }
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ─── AI Speech Output (TTS) ────────────────────────────────────────────────
  useEffect(() => {
    if (!interview || !aiVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    const aiMessages = interview.messages.filter((m) => m.role === 'interviewer');
    if (aiMessages.length === 0) return;

    const latestMsg = aiMessages[aiMessages.length - 1];
    const msgId = (latestMsg as any)._id || latestMsg.timestamp?.toString() || latestMsg.content;

    if (msgId && msgId !== latestSpokenMsgIdRef.current) {
      latestSpokenMsgIdRef.current = msgId;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(latestMsg.content);
      const voices = window.speechSynthesis.getVoices();

      const isMale = interview.interviewer?.gender === 'male';

      if (isMale) {
        const maleVoice = voices.find(
          (v) => /male|david|george|alex|daniel/i.test(v.name) && v.lang.startsWith('en')
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.9;
        utterance.rate = 0.98;
      } else {
        const femaleVoice = voices.find(
          (v) => /female|zira|samantha|victoria|karen/i.test(v.name) && v.lang.startsWith('en')
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.05;
        utterance.rate = 0.98;
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [interview, aiVoiceEnabled]);

  // ─── Speech Recognition (Dictation to Editable Text) ───────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript + ' ';
          }
          setAnswer(accumulated.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone permission denied. Please allow microphone access or type your answers.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice dictation is not supported in this browser. Please type your response.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak your answer now. You can edit before sending.', { duration: 3000 });
      } catch (err: any) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  // ─── Submitting Answers ────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!answer.trim() || sending || !id || !interview) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const candidateText = answer.trim();
    setAnswer('');
    setSending(true);
    setIsAiTyping(true);

    // Optimistic update
    setInterview((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              { role: 'candidate', content: candidateText, timestamp: new Date() },
            ],
          }
        : prev
    );

    try {
      const { data } = await api.post(`/interview/${id}/respond`, { answer: candidateText });
      if (data.success && data.interview) {
        setInterview(data.interview);
        setCanRetryQuestion(false);

        // Check if session completed
        if (data.interview.status === 'completed' && data.interview.finalResults) {
          toast.success('Interview complete! Preparing your evaluation report...');
          setTimeout(() => {
            router.push(`/interview/${id}/results`);
          }, 1200);
        }
      }
    } catch (error: any) {
      if (error.response?.data?.interview) {
        setInterview(error.response.data.interview);
      }
      if (error.response?.data?.retryQuestion) {
        setCanRetryQuestion(true);
      }
      toast.error(error.response?.data?.message || 'Failed to submit response. Please try again.');
    } finally {
      setSending(false);
      setIsAiTyping(false);
    }
  };

  const handleRetryQuestion = async () => {
    if (!id || sending) return;
    setSending(true);
    setIsAiTyping(true);
    try {
      toast.info('Retrying question generation...');
      const { data } = await api.post(`/interview/${id}/retry-question`);
      if (data.success && data.interview) {
        setInterview(data.interview);
        setCanRetryQuestion(false);
        toast.success('Next question ready!');
        const lastMsg = data.interview.messages[data.interview.messages.length - 1];
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate question. Please try again.');
    } finally {
      setSending(false);
      setIsAiTyping(false);
    }
  };

  const handleFinishEarly = async () => {
    if (!id || finishing) return;
    const confirmEarly = window.confirm(
      'Are you sure you want to wrap up the interview early? We will generate your evaluation based on the questions completed so far.'
    );
    if (!confirmEarly) return;

    setFinishing(true);
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      toast.info('Finalizing session and scoring responses...');
      const { data } = await api.post(`/interview/${id}/finish`);
      if (data.success) {
        toast.success('Evaluation ready!');
        router.push(`/interview/${id}/results`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to finish session early');
      setFinishing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!interview) return null;

  const interviewer = interview.interviewer || {
    name: 'Sarah Jenkins',
    title: 'Senior Technical Recruiter',
    role: 'Senior Technical Recruiter',
    avatar: '/avatars/female.svg',
    gender: 'female' as const,
  };

  const candidateAnswersCount = interview.messages.filter((m) => m.role === 'candidate').length;
  const totalTargetQuestions = interview.questionCount || 5;
  const currentQuestionNumber = Math.min(candidateAnswersCount + 1, totalTargetQuestions);

  return (
    <div className="min-h-screen bg-[#FAF8F1] text-[#171A35] flex flex-col h-screen overflow-hidden">
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <header className="h-16 border-b border-[#E7E1D4] bg-[#FFFFFF] flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/interview"
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="text-[#77798B] hover:text-[#171A35] p-1.5 rounded-lg hover:bg-[#FAF8F1] transition-colors"
            title="Exit to Setup"
          >
            <X className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm font-['Outfit'] text-[#171A35]">
                Mock Interview Simulation
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4F46D8]/10 text-[#4F46D8] border border-[#4F46D8]/20 capitalize">
                {interview.category || 'Mixed'} Round
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F1] text-[#77798B] border border-[#E7E1D4] capitalize">
                {interview.difficulty || 'Medium'}
              </span>
            </div>
            <p className="text-[11px] text-[#77798B]">
              Target: <span className="font-bold text-[#171A35]">{interview.targetRole || 'Software Professional'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Question Progress Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-xs font-bold text-[#171A35] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4F46D8]" />
            <span>
              Question {currentQuestionNumber} of {totalTargetQuestions}
            </span>
          </div>

          {/* Sound / TTS Toggle */}
          <button
            onClick={() => {
              setAiVoiceEnabled(!aiVoiceEnabled);
              if (aiVoiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              aiVoiceEnabled
                ? 'bg-[#F3F0FC] border-[#4F46D8]/30 text-[#4F46D8]'
                : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B]'
            }`}
            title={aiVoiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            {aiVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{aiVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Finish Early Button */}
          <button
            onClick={handleFinishEarly}
            disabled={finishing || candidateAnswersCount === 0}
            className="px-3.5 py-1.5 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] hover:bg-[#FAF8F1] text-xs font-bold text-[#B45309] hover:border-[#B45309]/40 transition-all flex items-center gap-1.5 disabled:opacity-40"
            title="Finish interview and get evaluation immediately"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{finishing ? 'Scoring...' : 'Finish Early'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Split Screen Body ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* ── Left Column: Video Feeds (Interviewer + Candidate) ─────── */}
        <div className="w-full lg:w-[44%] bg-[#FAF8F1] p-4 flex flex-col gap-4 overflow-y-auto border-r border-[#E7E1D4]">

          {/* AI Interviewer Avatar Feed */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex flex-col items-center justify-center p-4">
            <div className="relative flex flex-col items-center justify-center">
              {/* Outer pulsing ring while speaking */}
              <div
                className={`absolute inset-0 rounded-full blur-xl bg-[#4F46D8] transition-all duration-300 ${
                  isAiSpeaking ? 'opacity-30 scale-125 animate-pulse' : 'opacity-0 scale-90'
                }`}
              />

              <div
                className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#4F46D8] to-[#6366F1] p-1 relative z-10 transition-transform duration-300 shadow-md ${
                  isAiSpeaking ? 'scale-105 ring-4 ring-[#4F46D8]/20' : 'scale-100'
                }`}
              >
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={interviewer.avatar || '/avatars/female.svg'}
                    alt={interviewer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Dynamic Audio Waveform Indicator */}
              <div className="mt-4 flex items-center gap-1 h-6">
                {isAiSpeaking ? (
                  [1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-[#4F46D8] rounded-full"
                      animate={{ height: ['4px', '22px', '4px'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.45,
                        delay: i * 0.08,
                        ease: 'easeInOut',
                      }}
                    />
                  ))
                ) : (
                  <span className="text-[11px] font-semibold text-[#77798B] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#168575] animate-ping" />
                    Listening to your response...
                  </span>
                )}
              </div>
            </div>

            {/* Corner Badge: Interviewer Identity */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-[#E7E1D4] text-[#171A35] shadow-2xs">
              <Brain className="w-3.5 h-3.5 text-[#4F46D8]" />
              <span>{interviewer.name}</span>
              <span className="text-[10px] text-[#77798B] hidden sm:inline">
                • {interviewer.title || (interviewer as any).role || 'AI Interviewer'}
              </span>
            </div>
          </div>

          {/* Candidate Camera Feed */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#77798B] gap-2 bg-[#FAF8F1]">
                <VideoOff className="w-8 h-8 opacity-40" />
                <span className="text-xs font-medium">Camera is disabled</span>
                <button
                  onClick={toggleCamera}
                  className="mt-1 px-3 py-1 text-[11px] font-bold text-[#4F46D8] bg-white border border-[#E7E1D4] rounded-lg shadow-2xs hover:bg-[#F3F0FC]"
                >
                  Turn On Camera
                </button>
              </div>
            )}

            {/* Corner Controls on Candidate Feed */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#E7E1D4] text-[#171A35] shadow-2xs">
                <User className="w-3.5 h-3.5 text-[#168575]" />
                <span>You (Candidate)</span>
              </div>
              <button
                onClick={toggleCamera}
                className="bg-white/90 backdrop-blur-md p-2 rounded-full hover:bg-white text-[#171A35] border border-[#E7E1D4] shadow-2xs transition-all"
                title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraActive ? <Video className="w-4 h-4 text-[#168575]" /> : <VideoOff className="w-4 h-4 text-[#77798B]" />}
              </button>
            </div>
          </div>

        </div>

        {/* ── Right Column: Conversation History & Voice Dictation Input ── */}
        <div className="flex-1 flex flex-col bg-[#FFFFFF]">

          {/* Chat / Transcript Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {interview.messages.map((message, idx) => {
              const isInterviewer = message.role === 'interviewer';
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${isInterviewer ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isInterviewer ? 'bg-[#F3F0FC] text-[#4F46D8]' : 'bg-[#168575]/15 text-[#168575]'
                    }`}
                  >
                    {isInterviewer ? (
                      <img
                        src={interviewer.avatar || '/avatars/female.svg'}
                        alt={interviewer.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  <div className={`max-w-[82%] ${isInterviewer ? '' : 'items-end flex flex-col'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#171A35]">
                        {isInterviewer ? interviewer.name : 'You'}
                      </span>
                      <span className="text-[10px] text-[#77798B]">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`px-4 py-3 text-xs leading-relaxed ${
                        isInterviewer
                          ? 'bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] rounded-2xl rounded-tl-xs shadow-2xs font-medium'
                          : 'bg-[#4F46D8] text-white rounded-2xl rounded-tr-xs shadow-2xs'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F3F0FC] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-[#4F46D8]" />
                </div>
                <div className="bg-[#FAF8F1] border border-[#E7E1D4] rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#77798B] mr-1">
                      {interviewer.name} is formulating question...
                    </span>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#4F46D8]"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-2" />
          </div>

          {/* Response Box & Voice Controls */}
          <div className="p-4 border-t border-[#E7E1D4] bg-[#FFFFFF]">
            <div className="max-w-3xl mx-auto space-y-2">

              {canRetryQuestion && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Your answer was saved. AI question generation encountered a delay.</span>
                  </div>
                  <button
                    onClick={handleRetryQuestion}
                    disabled={sending}
                    className="px-3 py-1 rounded-lg bg-[#4F46D8] hover:bg-[#4338CA] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className={`w-3 h-3 ${sending ? 'animate-spin' : ''}`} />
                    <span>Retry Question</span>
                  </button>
                </div>
              )}

              {isListening && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span>Listening... Dictate your answer now. You can edit text before sending.</span>
                  </div>
                  <button
                    onClick={toggleListening}
                    className="text-[11px] font-bold underline hover:text-rose-900"
                  >
                    Done Speaking
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2.5">
                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3.5 rounded-xl transition-all flex-shrink-0 border ${
                    isListening
                      ? 'bg-rose-500 border-rose-600 text-white shadow-md animate-pulse'
                      : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B] hover:text-[#4F46D8] hover:border-[#4F46D8]/50'
                  }`}
                  title={isListening ? 'Stop recording voice' : 'Click to dictate answer using your microphone'}
                >
                  {isListening ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Editable Answer Input */}
                <div className="flex-1 relative bg-[#FAF8F1] rounded-xl border border-[#E7E1D4] focus-within:border-[#4F46D8] transition-colors">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or dictate your answer here (Shift + Enter for new lines, Enter to send)..."
                    className="w-full bg-transparent text-[#171A35] p-3 pr-12 outline-none resize-none min-h-[56px] max-h-[140px] text-xs placeholder-[#77798B]"
                    rows={2}
                    disabled={sending || interview.status === 'completed'}
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!answer.trim() || sending || interview.status === 'completed'}
                    className="absolute right-2 bottom-2 p-2 rounded-lg bg-[#4F46D8] text-white hover:bg-[#4338CA] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                    title="Send answer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#77798B] px-1">
                <span>
                  Tip: Use the microphone to transcribe your voice, then review and click Send.
                </span>
                <span>
                  {candidateAnswersCount}/{totalTargetQuestions} Questions Answered
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
