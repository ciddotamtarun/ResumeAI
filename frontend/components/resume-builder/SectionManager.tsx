'use client';

import React from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { SectionKey } from '@/types/builder';

interface SectionManagerProps {
  sectionOrder: SectionKey[];
  enabledSections: Record<SectionKey, boolean>;
  onReorder: (newOrder: SectionKey[]) => void;
  onToggle: (key: SectionKey) => void;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Key Projects',
  skills: 'Skills & Competencies',
  education: 'Education',
  certifications: 'Certifications',
  awards: 'Honors & Awards',
  volunteer: 'Volunteer & Leadership',
  languages: 'Languages',
};

export default function SectionManager({
  sectionOrder,
  enabledSections,
  onReorder,
  onToggle,
}: SectionManagerProps) {
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sectionOrder.length) return;
    const order = [...sectionOrder];
    const [moved] = order.splice(index, 1);
    order.splice(target, 0, moved);
    onReorder(order);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E7E1D4]">
        <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
          <ArrowUpDown className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#171A35]">Reorder & Customize Sections</h3>
          <p className="text-xs text-[#77798B]">Arrange the document structure to emphasize your strengths</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {sectionOrder.map((sectionKey, index) => {
          const isEnabled = enabledSections[sectionKey];
          return (
            <div
              key={sectionKey}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                isEnabled
                  ? 'bg-[#FAF8F1] border-[#E7E1D4] text-[#171A35]'
                  : 'bg-gray-50 border-gray-200 text-[#77798B] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-white border border-[#E7E1D4] flex items-center justify-center text-[10px] font-mono text-[#77798B]">
                  {index + 1}
                </span>
                <span className="font-medium">{SECTION_LABELS[sectionKey]}</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Move up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(index, 'up')}
                  className="p-1 hover:text-[#4F46D8] disabled:opacity-20 rounded text-[#77798B] transition-colors"
                  title="Move section up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                {/* Move down */}
                <button
                  type="button"
                  disabled={index === sectionOrder.length - 1}
                  onClick={() => moveSection(index, 'down')}
                  className="p-1 hover:text-[#4F46D8] disabled:opacity-20 rounded text-[#77798B] transition-colors"
                  title="Move section down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => onToggle(sectionKey)}
                  className={`p-1 ml-1 rounded transition-colors ${
                    isEnabled
                      ? 'text-[#168575] hover:bg-[#168575]/10'
                      : 'text-[#77798B] hover:text-[#171A35]'
                  }`}
                  title={isEnabled ? 'Hide section' : 'Show section'}
                >
                  {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
