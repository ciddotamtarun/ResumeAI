'use client';

import React, { useState } from 'react';
import { Cpu, Plus, X, Sparkles } from 'lucide-react';

interface SkillsSectionProps {
  skills: {
    technical: string[];
    soft: string[];
  };
  onChange: (skills: { technical: string[]; soft: string[] }) => void;
  onAISkillSuggest: () => void;
}

const COMMON_TECH_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Git',
  'Tailwind CSS',
  'REST APIs',
  'GraphQL',
];

const COMMON_SOFT_SUGGESTIONS = [
  'Team Leadership',
  'Agile / Scrum',
  'Problem Solving',
  'Cross-Functional Collaboration',
  'Technical Communication',
  'Mentorship',
];

export default function SkillsSection({ skills, onChange, onAISkillSuggest }: SkillsSectionProps) {
  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  const addTechSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.technical.includes(trimmed)) return;
    onChange({
      ...skills,
      technical: [...skills.technical, trimmed],
    });
    setTechInput('');
  };

  const removeTechSkill = (skillToRemove: string) => {
    onChange({
      ...skills,
      technical: skills.technical.filter((s) => s !== skillToRemove),
    });
  };

  const addSoftSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.soft.includes(trimmed)) return;
    onChange({
      ...skills,
      soft: [...skills.soft, trimmed],
    });
    setSoftInput('');
  };

  const removeSoftSkill = (skillToRemove: string) => {
    onChange({
      ...skills,
      soft: skills.soft.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171A35]">Skills & Competencies</h3>
            <p className="text-xs text-[#77798B]">Keywords that match target job descriptions & ATS systems</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAISkillSuggest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F0FC] hover:bg-[#4F46D8] text-[#4F46D8] hover:text-white text-xs font-semibold transition-all border border-[#4F46D8]/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Suggest Skills</span>
        </button>
      </div>

      {/* Technical Skills */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#171A35]">
          Technical Skills & Tools ({skills.technical.length})
        </label>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTechSkill(techInput);
              }
            }}
            placeholder="Type skill & press Enter (e.g. Next.js, Docker)"
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
          />
          <button
            type="button"
            onClick={() => addTechSkill(techInput)}
            className="px-3 py-1.5 rounded-xl bg-[#4F46D8] text-white text-xs font-medium hover:bg-[#4338CA] transition-colors"
          >
            Add
          </button>
        </div>

        {/* Active Technical Skill Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {skills.technical.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F0FC] text-[#4F46D8] text-xs font-medium border border-[#4F46D8]/20"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeTechSkill(skill)}
                className="hover:text-red-600 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="pt-1">
          <span className="text-[10px] text-[#77798B] font-semibold uppercase tracking-wider block mb-1">
            Quick Add:
          </span>
          <div className="flex flex-wrap gap-1">
            {COMMON_TECH_SUGGESTIONS.filter((s) => !skills.technical.includes(s)).slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTechSkill(s)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F1] hover:bg-[#F3F0FC] text-[#77798B] hover:text-[#4F46D8] border border-[#E7E1D4] transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Soft Skills */}
      <div className="space-y-2 pt-3 border-t border-[#E7E1D4]/60">
        <label className="block text-xs font-semibold text-[#171A35]">
          Soft Skills & Methodologies ({skills.soft.length})
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={softInput}
            onChange={(e) => setSoftInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSoftSkill(softInput);
              }
            }}
            placeholder="Type skill & press Enter (e.g. Agile Leadership, Conflict Resolution)"
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
          />
          <button
            type="button"
            onClick={() => addSoftSkill(softInput)}
            className="px-3 py-1.5 rounded-xl bg-[#4F46D8] text-white text-xs font-medium hover:bg-[#4338CA] transition-colors"
          >
            Add
          </button>
        </div>

        {/* Active Soft Skill Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {skills.soft.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F1] text-[#171A35] text-xs font-medium border border-[#E7E1D4]"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSoftSkill(skill)}
                className="hover:text-red-600 rounded text-[#77798B]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Quick Soft Suggestion Pills */}
        <div className="pt-1">
          <div className="flex flex-wrap gap-1">
            {COMMON_SOFT_SUGGESTIONS.filter((s) => !skills.soft.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSoftSkill(s)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F1] hover:bg-[#F3F0FC] text-[#77798B] hover:text-[#4F46D8] border border-[#E7E1D4] transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
