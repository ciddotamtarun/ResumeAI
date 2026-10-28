'use client';

import React from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  MapPin,
  Building2,
  Check,
} from 'lucide-react';
import { ResumeExperience } from '@/types/builder';

interface ExperienceSectionProps {
  experience: ResumeExperience[];
  onChange: (exp: ResumeExperience[]) => void;
  onAIBulletAssist: (bullet: string, roleContext: string, onApply: (newBullet: string) => void) => void;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

export default function ExperienceSection({
  experience,
  onChange,
  onAIBulletAssist,
}: ExperienceSectionProps) {
  const addEntry = () => {
    const newEntry: ResumeExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      employmentType: 'Full-time',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    onChange([...experience, newEntry]);
  };

  const removeEntry = (id: string) => {
    onChange(experience.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<ResumeExperience>) => {
    onChange(experience.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experience.length) return;
    const items = [...experience];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    onChange(items);
  };

  const addBullet = (entryId: string) => {
    const entry = experience.find((e) => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, { bullets: [...entry.bullets, ''] });
  };

  const updateBullet = (entryId: string, bulletIndex: number, val: string) => {
    const entry = experience.find((e) => e.id === entryId);
    if (!entry) return;
    const newBullets = [...entry.bullets];
    newBullets[bulletIndex] = val;
    updateEntry(entryId, { bullets: newBullets });
  };

  const removeBullet = (entryId: string, bulletIndex: number) => {
    const entry = experience.find((e) => e.id === entryId);
    if (!entry) return;
    const newBullets = entry.bullets.filter((_, idx) => idx !== bulletIndex);
    updateEntry(entryId, { bullets: newBullets.length ? newBullets : [''] });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171A35]">Work Experience & Internships</h3>
            <p className="text-xs text-[#77798B]">List your career history, roles, and concrete achievements</p>
          </div>
        </div>

        <button
          type="button"
          onClick={addEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-6 px-4 bg-[#FAF8F1] rounded-xl border border-dashed border-[#E7E1D4]">
          <Briefcase className="w-8 h-8 text-[#77798B] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#171A35]">No work experience added yet</p>
          <p className="text-[11px] text-[#77798B] mt-0.5">Click &ldquo;Add Position&rdquo; to add your current or previous jobs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <div
              key={exp.id}
              className="bg-[#FAF8F1]/60 rounded-xl p-4 border border-[#E7E1D4] space-y-3 relative group"
            >
              {/* Header with Title and Reorder/Delete */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171A35] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>{exp.jobTitle || 'New Position'}</span>
                  {exp.company && <span className="text-[#77798B] font-normal">• {exp.company}</span>}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveEntry(index, 'up')}
                    className="p-1 hover:text-[#4F46D8] disabled:opacity-30 rounded text-[#77798B] transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === experience.length - 1}
                    onClick={() => moveEntry(index, 'down')}
                    className="p-1 hover:text-[#4F46D8] disabled:opacity-30 rounded text-[#77798B] transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEntry(exp.id)}
                    className="p-1 hover:text-red-600 rounded text-[#77798B] transition-colors ml-1"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.jobTitle}
                    onChange={(e) => updateEntry(exp.id, { jobTitle: e.target.value })}
                    placeholder="e.g. Lead Software Engineer"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateEntry(exp.id, { company: e.target.value })}
                    placeholder="e.g. Microsoft / Acme Corp"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Employment Type
                  </label>
                  <select
                    value={exp.employmentType || 'Full-time'}
                    onChange={(e) => updateEntry(exp.id, { employmentType: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => updateEntry(exp.id, { location: e.target.value })}
                    placeholder="e.g. New York, NY (or Remote)"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => updateEntry(exp.id, { startDate: e.target.value })}
                    placeholder="e.g. 2022-03 or Mar 2022"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-[#171A35]">End Date</label>
                    <label className="flex items-center gap-1.5 text-[10px] text-[#77798B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) => updateEntry(exp.id, { current: e.target.checked, endDate: '' })}
                        className="rounded border-[#E7E1D4] text-[#4F46D8] focus:ring-0"
                      />
                      <span>Current Position</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={exp.current}
                    value={exp.current ? 'Present' : exp.endDate}
                    onChange={(e) => updateEntry(exp.id, { endDate: e.target.value })}
                    placeholder={exp.current ? 'Present' : 'e.g. 2024-01 or Jan 2024'}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      exp.current
                        ? 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B]'
                        : 'bg-white border-[#E7E1D4] text-[#171A35] focus:border-[#4F46D8]'
                    }`}
                  />
                </div>
              </div>

              {/* Responsibilities / Achievement Bullets */}
              <div className="space-y-2 pt-1 border-t border-[#E7E1D4]/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#171A35]">
                    Key Responsibilities & Measurable Achievements
                  </label>
                  <button
                    type="button"
                    onClick={() => addBullet(exp.id)}
                    className="text-[11px] text-[#4F46D8] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-1.5">
                    <span className="text-[#77798B] mt-2 text-[10px]">•</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                      placeholder="Accomplished [X], as measured by [Y], by doing [Z]..."
                      className="flex-1 p-2 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] resize-y"
                    />

                    {/* AI Polish Button for this bullet */}
                    <button
                      type="button"
                      onClick={() =>
                        onAIBulletAssist(bullet, exp.jobTitle || 'Software Engineer', (polished) =>
                          updateBullet(exp.id, bIdx, polished)
                        )
                      }
                      className="p-1.5 text-[#77798B] hover:text-[#4F46D8] hover:bg-[#F3F0FC] rounded-lg transition-colors mt-1"
                      title="Polish with AI"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4F46D8]" />
                    </button>

                    {/* Remove Bullet */}
                    <button
                      type="button"
                      onClick={() => removeBullet(exp.id, bIdx)}
                      className="p-1.5 text-[#77798B] hover:text-red-500 rounded-lg transition-colors mt-1"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
