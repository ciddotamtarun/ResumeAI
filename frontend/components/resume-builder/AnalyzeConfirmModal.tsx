'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowRight, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { ResumeBuilderData } from '@/types/builder';
import { resumeToPlainText } from '@/lib/builder-defaults';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AnalyzeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeBuilderData;
}

const COMMON_TARGET_ROLES = [
  'Full Stack Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps & Cloud Engineer',
  'Product Manager',
  'Mobile Developer (iOS/Android)',
  'Cybersecurity Analyst',
];

export default function AnalyzeConfirmModal({
  isOpen,
  onClose,
  data,
}: AnalyzeConfirmModalProps) {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState(data.contact.jobTitle || 'Full Stack Software Engineer');
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [analyzing, setAnalyzing] = useState(false);
  const [stepMessage, setStepMessage] = useState('');

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    setStepMessage('Extracting structured resume content...');

    try {
      const rawText = resumeToPlainText(data);

      if (rawText.trim().length < 50) {
        toast.error('Resume is too brief. Please fill in your experience, skills, or education before analyzing.');
        setAnalyzing(false);
        return;
      }

      setStepMessage('Running deep AI ATS compatibility scan & scoring...');

      const fileName = `${(data.contact.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

      // Call our builder analysis endpoint
      const res = await api.post('/resume/builder-analyze', {
        rawText,
        targetRole,
        provider,
        fileName,
      });

      const newResume = res.data.resume;
      toast.success('Resume analyzed successfully!');

      // Redirect to the resume detail/results view
      router.push(`/resume/${newResume._id}`);
    } catch (err: any) {
      console.error('Builder analysis error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Analysis failed. Please try again.';
      toast.error(`Analysis error: ${msg}`);
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E7E1D4] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E1D4] bg-[#FAF8F1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#4F46D8] text-white flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Analyze with Resume Studio</h3>
              <p className="text-[11px] text-[#77798B]">Pass your draft to the AI analysis & ATS scoring pipeline</p>
            </div>
          </div>
          {!analyzing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#77798B] hover:text-[#171A35] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {analyzing ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-[#4F46D8]/20 border-t-[#4F46D8] animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-[#171A35]">Analyzing Your Resume</h4>
                <p className="text-xs text-[#77798B] mt-1">{stepMessage}</p>
              </div>
              <p className="text-[11px] text-[#77798B] max-w-xs">
                Your draft is securely preserved. You can return to editing anytime.
              </p>
            </div>
          ) : (
            <>
              {/* Target Role */}
              <div>
                <label className="block text-xs font-semibold text-[#171A35] mb-1">
                  Target Job Title / Career Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                />

                {/* Role Suggestion chips */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {COMMON_TARGET_ROLES.slice(0, 4).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                        targetRole === role
                          ? 'bg-[#F3F0FC] text-[#4F46D8] border-[#4F46D8]/30 font-medium'
                          : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4] hover:text-[#171A35]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#171A35] mb-1">
                  AI Evaluation Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      provider === 'gemini'
                        ? 'bg-[#F3F0FC] border-[#4F46D8] text-[#4F46D8]'
                        : 'bg-white border-[#E7E1D4] text-[#171A35] hover:bg-[#FAF8F1]'
                    }`}
                  >
                    <div className="text-xs font-bold">Google Gemini</div>
                    <div className="text-[10px] text-[#77798B]">High-speed ATS evaluation</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('openai')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      provider === 'openai'
                        ? 'bg-[#F3F0FC] border-[#4F46D8] text-[#4F46D8]'
                        : 'bg-white border-[#E7E1D4] text-[#171A35] hover:bg-[#FAF8F1]'
                    }`}
                  >
                    <div className="text-xs font-bold">OpenAI GPT-4o</div>
                    <div className="text-[10px] text-[#77798B]">Deep contextual reasoning</div>
                  </button>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] text-[11px] text-[#77798B] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#168575] shrink-0 mt-0.5" />
                <span>
                  This runs full section scoring, keywords extraction, and targeted recommendations. Your current draft in Resume Builder will remain intact so you can make updates right away.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!analyzing && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E7E1D4] bg-[#FAF8F1]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-[#E7E1D4] text-[#77798B] hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartAnalysis}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white shadow-xs transition-colors"
            >
              <span>Begin Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
