'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Maximize,
  Minimize,
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function InterviewVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Interview state
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [sending, setSending] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // A/V State
  const [cameraActive, setCameraActive] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [triggerAutoSend, setTriggerAutoSend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const latestMessageIdRef = useRef<string | null>(null);
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const id = resolvedParams?.id;

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
      if (data.success) {
        setInterview(data.interview);
        const aiMessages = data.interview.messages.filter((m: any) => m.role === 'interviewer');
        if (aiMessages.length > 0) {
          const latest = aiMessages[aiMessages.length - 1];
          latestMessageIdRef.current = latest._id || latest.timestamp;
        }
      }
    } catch {
      toast.error('Failed to load interview');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (isAuthenticated && id) fetchInterview();
  }, [isAuthenticated, id, fetchInterview]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages, isAiTyping]);

  // ─── Camera Setup (User) ───────────────────────────────────────────────────
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (userVideoRef.current) userVideoRef.current.srcObject = null;
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
        console.error('Camera access error:', err);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          toast.error('No camera found on your device.');
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          toast.error('Camera access denied. Please allow camera permissions in your browser settings.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          toast.error('Camera is already in use by another application.');
        } else {
          toast.error(`Camera error: ${err.message || 'Check permissions'}`);
        }
      }
    }
  };

  useEffect(() => {
    toggleCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── AI Speech Trigger ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!interview || !aiVoiceEnabled) return;
    
    const aiMessages = interview.messages.filter(m => m.role === 'interviewer');
    if (aiMessages.length === 0) return;

    const latestMsg = aiMessages[aiMessages.length - 1];
    const msgId = latestMsg._id || latestMsg.timestamp?.toString();

    if (msgId && msgId !== latestMessageIdRef.current) {
      latestMessageIdRef.current = msgId;
      
      // Native Browser Text-to-Speech
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(latestMsg.content);
      
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha')) || voices.find(v => v.lang.startsWith('en'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [interview, aiVoiceEnabled]);

  // ─── Speech Recognition (User Voice to Text) ───────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
          }
          setAnswer(finalTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          if (event.error === 'network') {
            toast.error('Speech recognition network error. Your browser may not support this feature. Please type your answer instead.');
          } else if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please allow microphone permissions.');
          } else {
            toast.error(`Speech recognition failed: ${event.error}. Please type your answer.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setTriggerAutoSend(true);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    if (triggerAutoSend) {
      if (answer.trim().length > 0 && !sending) {
        if (isFullscreen) {
          toast('Voice ended. Sending in 5 seconds...', { icon: '⏳', duration: 4500 });
          autoSendTimerRef.current = setTimeout(() => {
            if (document.getElementById('hidden-send-btn')) {
              document.getElementById('hidden-send-btn')?.click();
            }
          }, 5000);
        } else {
          handleSend();
        }
      }
      setTriggerAutoSend(false);
    }
  }, [triggerAutoSend, answer, sending, isFullscreen]);

  const toggleListening = () => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
      toast('Auto-send cancelled.', { icon: '🛑' });
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setAnswer(''); // Clear previous answer when starting new dictation
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // ─── Messaging ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    if (!answer.trim() || sending || !id || !interview) return;
    
    // Stop recording if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setSending(true);
    setIsAiTyping(true);

    const userAnswer = answer;
    setAnswer('');
    
    // Optimistic update
    setInterview(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { role: 'candidate', content: userAnswer, timestamp: new Date().toISOString() }]
    } : prev);

    try {
      const { data } = await api.post(`/interview/${id}/respond`, { answer: userAnswer });
      if (data.success) {
        setInterview(data.interview);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send answer');
      fetchInterview(); 
    } finally {
      setSending(false);
      setIsAiTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading || loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F1] text-[#171A35] flex flex-col h-screen overflow-hidden">
      <button id="hidden-send-btn" onClick={handleSend} className="hidden" aria-hidden="true" />
      
      {/* ── Header ── */}
      <header className="h-16 border-b border-[#E7E1D4] bg-[#FFFFFF] backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#77798B] hover:text-[#171A35] transition-colors">
            <X className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg font-['Outfit'] text-[#171A35]">Mock Interview</h1>
            <p className="text-xs text-[#4F46D8] font-medium">Target: {interview.targetRole || 'General'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setAiVoiceEnabled(!aiVoiceEnabled);
              if (aiVoiceEnabled) window.speechSynthesis.cancel();
            }}
            className={`p-2 rounded-lg border transition-all ${aiVoiceEnabled ? 'bg-[#F3F0FC] border-[#4F46D8]/40 text-[#4F46D8]' : 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B]'}`}
            title={aiVoiceEnabled ? "Disable AI Voice" : "Enable AI Voice"}
          >
            {aiVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg border border-[#E7E1D4] bg-[#FAF8F1] text-[#77798B] hover:bg-[#F3F0FC] hover:text-[#171A35] transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Video"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          
          <div className="px-3 py-1.5 rounded-full bg-[#F3F0FC] border border-[#E7E1D4] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4F46D8] animate-pulse" />
            <span className="text-xs font-semibold text-[#4F46D8]">Live Session</span>
          </div>
        </div>
      </header>

      {/* ── Main Content Area (Split Screen) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT: Video Grid */}
        <div className={`w-full bg-[#FAF8F1] p-4 flex gap-4 overflow-y-auto pb-32 transition-all duration-300 ${
          isFullscreen ? 'absolute inset-0 flex-col md:flex-row z-0' : 'flex-col lg:w-[45%] border-r border-[#E7E1D4] relative'
        }`}>
          
          {/* AI Interviewer Feed */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E7E1D4] shadow-sm flex items-center justify-center">
            {aiVoiceEnabled ? (
              <div className="flex flex-col items-center justify-center relative w-full h-full">
                {/* Simulated Avatar / Audio Wave */}
                <div className="relative flex items-center justify-center">
                  <div className={`absolute inset-0 bg-[#4F46D8] rounded-full blur-xl opacity-20 transition-all duration-300 ${isAiSpeaking ? 'scale-150 animate-pulse opacity-40' : 'scale-100'}`} />
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#4F46D8] to-purple-600 p-1 relative z-10 transition-transform duration-300 ${isAiSpeaking ? 'scale-110' : 'scale-100'}`}>
                    <div className="w-full h-full bg-[#FAF8F1] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#4F46D8]/30">
                      <img src="/ai-interviewer.jpg" alt="AI Interviewer" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-1.5 h-6">
                  {isAiSpeaking ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-[#4F46D8] rounded-full"
                        animate={{ height: ['4px', '20px', '4px'] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      />
                    ))
                  ) : (
                    <span className="text-sm text-[#77798B] font-medium">AI is listening...</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-[#77798B]">
                <VolumeX className="w-8 h-8 mb-2 opacity-50" />
                <span>Voice Disabled</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 z-20 border border-[#E7E1D4] text-[#171A35]">
              <Brain className="w-3.5 h-3.5 text-[#4F46D8]" /> AI Interviewer
            </div>
          </div>

          {/* User Webcam Feed */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E7E1D4] shadow-sm">
            {cameraActive ? (
              <video 
                ref={userVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#77798B] gap-3 bg-[#FAF8F1]">
                <VideoOff className="w-8 h-8 opacity-50" />
                <span className="text-sm">Camera is off</span>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="glass px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border border-[#E7E1D4] text-[#171A35]">
                <User className="w-3.5 h-3.5 text-[#168575]" /> You
              </div>
              <button
                onClick={toggleCamera}
                className="glass p-2 rounded-full hover:bg-[#F3F0FC] transition-all text-[#171A35] border border-[#E7E1D4]"
              >
                {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: Chat & Controls */}
        <div className={`flex flex-col bg-[#FAF8F1] transition-all duration-300 ${
          isFullscreen ? 'absolute bottom-0 left-0 right-0 z-10 bg-transparent' : 'flex-1'
        }`}>
          
          {/* Chat History */}
          <div className={`flex-1 overflow-y-auto p-6 scroll-smooth ${isFullscreen ? 'hidden' : 'block'}`}>
            <div className="max-w-3xl mx-auto space-y-6">
              {interview.messages.map((message, idx) => {
                const isInterviewer = message.role === 'interviewer';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-3 ${isInterviewer ? '' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isInterviewer ? 'bg-[#F3F0FC] text-[#4F46D8]' : 'bg-[#168575]/15 text-[#168575]'
                    }`}>
                      {isInterviewer ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] ${isInterviewer ? '' : 'items-end flex flex-col'}`}>
                      <div className={`px-4 py-3 text-sm leading-relaxed ${
                        isInterviewer
                          ? 'bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] rounded-2xl rounded-bl-sm shadow-sm'
                          : 'bg-[#F3F0FC] border border-[#4F46D8]/30 text-[#171A35] rounded-2xl rounded-br-sm'
                      }`}>
                        {message.content}
                      </div>
                      <p className="text-[#77798B] text-xs mt-1 px-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              
              {isAiTyping && (
                <div className="flex items-end gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3F0FC] flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-[#4F46D8]" />
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#E7E1D4] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
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
              <div ref={chatEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className={`p-4 transition-all duration-300 ${
            isFullscreen ? 'bg-[#FFFFFF]/90 backdrop-blur-xl border-t border-[#E7E1D4]' : 'border-t border-[#E7E1D4] bg-[#FFFFFF] backdrop-blur-md'
          }`}>
            <div className="max-w-3xl mx-auto">
              
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center justify-center gap-2 text-rose-600 text-sm font-medium"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Listening... Speak your answer. Click Send when done.
                </motion.div>
              )}

              <div className="relative flex items-end gap-3">
                
                {/* Voice Dictation Button */}
                <button
                  onClick={toggleListening}
                  className={`p-4 rounded-2xl transition-all flex-shrink-0 ${
                    isListening 
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                      : 'bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B] hover:bg-[#F3F0FC] hover:text-[#4F46D8]'
                  }`}
                  title={isListening ? "Stop listening" : "Dictate answer"}
                >
                  {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Textarea */}
                <div className="flex-1 relative bg-[#FAF8F1] rounded-2xl border border-[#E7E1D4] overflow-hidden focus-within:border-[#4F46D8] transition-colors">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or dictate your answer..."
                    className="w-full bg-transparent text-[#171A35] p-4 pr-14 outline-none resize-none min-h-[56px] max-h-[150px] placeholder-[#77798B]"
                    rows={1}
                    disabled={sending || interview.status === 'completed'}
                  />
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!answer.trim() || sending || interview.status === 'completed'}
                    className="absolute right-2 bottom-2 p-2.5 rounded-xl bg-[#4F46D8] text-white hover:bg-[#4338CA] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Send answer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-center text-[#77798B] text-xs mt-3">
                Click the microphone to transcribe your voice, then click Send (or press Enter).
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
