'use client';

import React from 'react';
import { AlignLeft, Sparkles } from 'lucide-react';

interface SummarySectionProps {
  summary: string;
  onChange: (val: string) => void;
  onAIAssist: (text: string) => void;
}

export default function SummarySection({ summary, onChange, onAIAssist }: SummarySectionProps) {
  const charCount = summary.length;
  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
            <AlignLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171A35]">Professional Summary</h3>
            <p className="text-xs text-[#77798B]">Brief, impactful overview of your career trajectory</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAIAssist(summary)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F0FC] hover:bg-[#4F46D8] text-[#4F46D8] hover:text-white text-xs font-semibold transition-all border border-[#4F46D8]/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Polish with AI</span>
        </button>
      </div>

      <div className="relative">
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Innovative and outcome-driven Senior Software Engineer with 5+ years of experience architecting distributed cloud systems and scalable web applications..."
          className="w-full p-3 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors resize-y leading-relaxed"
        />

        <div className="flex justify-between items-center text-[11px] text-[#77798B] mt-1 px-1">
          <span>Tip: 2–4 sentences highlighting your years of experience, primary domain, and top outcomes.</span>
          <span className={`font-mono ${charCount > 500 ? 'text-amber-600 font-semibold' : ''}`}>
            {wordCount} words ({charCount} chars)
          </span>
        </div>
      </div>
    </div>
  );
}
