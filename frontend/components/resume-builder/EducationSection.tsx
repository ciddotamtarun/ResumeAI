'use client';

import React from 'react';
import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ResumeEducation } from '@/types/builder';

interface EducationSectionProps {
  education: ResumeEducation[];
  onChange: (edu: ResumeEducation[]) => void;
}

export default function EducationSection({ education, onChange }: EducationSectionProps) {
  const addEntry = () => {
    const newEntry: ResumeEducation = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: '',
    };
    onChange([...education, newEntry]);
  };

  const removeEntry = (id: string) => {
    onChange(education.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<ResumeEducation>) => {
    onChange(education.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= education.length) return;
    const items = [...education];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    onChange(items);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171A35]">Education</h3>
            <p className="text-xs text-[#77798B]">Academic degrees, diplomas, and certifications</p>
          </div>
        </div>

        <button
          type="button"
          onClick={addEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-6 px-4 bg-[#FAF8F1] rounded-xl border border-dashed border-[#E7E1D4]">
          <GraduationCap className="w-8 h-8 text-[#77798B] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#171A35]">No education entries added</p>
          <p className="text-[11px] text-[#77798B] mt-0.5">Click &ldquo;Add Education&rdquo; to add your degrees</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div
              key={edu.id}
              className="bg-[#FAF8F1]/60 rounded-xl p-4 border border-[#E7E1D4] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171A35] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>{edu.institution || 'New Institution'}</span>
                  {edu.degree && <span className="text-[#77798B] font-normal">• {edu.degree}</span>}
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
                    disabled={index === education.length - 1}
                    onClick={() => moveEntry(index, 'down')}
                    className="p-1 hover:text-[#4F46D8] disabled:opacity-30 rounded text-[#77798B] transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEntry(edu.id)}
                    className="p-1 hover:text-red-600 rounded text-[#77798B] transition-colors ml-1"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Institution / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEntry(edu.id, { institution: e.target.value })}
                    placeholder="e.g. University of California, Berkeley"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEntry(edu.id, { degree: e.target.value })}
                    placeholder="e.g. Bachelor of Science"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateEntry(edu.id, { fieldOfStudy: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => updateEntry(edu.id, { startDate: e.target.value })}
                    placeholder="e.g. 2017-08"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-[#171A35]">End Date</label>
                    <label className="flex items-center gap-1.5 text-[10px] text-[#77798B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edu.current || false}
                        onChange={(e) => updateEntry(edu.id, { current: e.target.checked, endDate: '' })}
                        className="rounded border-[#E7E1D4] text-[#4F46D8] focus:ring-0"
                      />
                      <span>Currently Enrolled</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={edu.current}
                    value={edu.current ? 'Present' : edu.endDate}
                    onChange={(e) => updateEntry(edu.id, { endDate: e.target.value })}
                    placeholder={edu.current ? 'Present' : 'e.g. 2021-05'}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      edu.current
                        ? 'bg-[#FAF8F1] border-[#E7E1D4] text-[#77798B]'
                        : 'bg-white border-[#E7E1D4] text-[#171A35] focus:border-[#4F46D8]'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    GPA or Grade (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => updateEntry(edu.id, { gpa: e.target.value })}
                    placeholder="e.g. 3.8 / 4.0 or First Class Honors"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Additional Highlights / Coursework (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={edu.description || ''}
                    onChange={(e) => updateEntry(edu.id, { description: e.target.value })}
                    placeholder="e.g. Dean's Honor List, Relevant Coursework: Data Structures, Machine Learning, Cloud Architecture"
                    className="w-full p-2 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
