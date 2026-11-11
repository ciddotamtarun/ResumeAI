'use client';

import React, { useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeData,
  SkillItem,
} from '@/types/builder';

type AiAssistContext = string | Record<string, unknown>;

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onAiAssist: (
    type: 'improve-summary' | 'polish-bullet' | 'suggest-skills' | 'grammar-fix',
    text: string,
    context?: AiAssistContext
  ) => void;
}

export default function ResumeEditor({ data, onChange, onAiAssist }: ResumeEditorProps) {
  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    projects: true,
    education: true,
    skills: true,
    additional: false,
    order: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Updaters
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const updateSummary = (value: string) => {
    onChange({ ...data, summary: value });
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu = {
      id: `edu_${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = <K extends keyof EducationEntry,>(
    index: number,
    field: K,
    value: EducationEntry[K]
  ) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, education: updated });
  };

  const removeEducation = (index: number) => {
    onChange({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  // Experience Helpers
  const addExperience = () => {
    const newExp = {
      id: `exp_${Date.now()}`,
      title: '',
      company: '',
      employmentType: 'Full-time',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = <K extends keyof ExperienceEntry,>(
    index: number,
    field: K,
    value: ExperienceEntry[K]
  ) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, experience: updated });
  };

  const removeExperience = (index: number) => {
    onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) });
  };

  const addExperienceBullet = (expIndex: number) => {
    const updated = [...data.experience];
    updated[expIndex].bullets = [...(updated[expIndex].bullets || []), ''];
    onChange({ ...data, experience: updated });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...data.experience];
    const newBullets = [...updated[expIndex].bullets];
    newBullets[bulletIndex] = text;
    updated[expIndex].bullets = newBullets;
    onChange({ ...data, experience: updated });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...data.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange({ ...data, experience: updated });
  };

  // Projects Helpers
  const addProject = () => {
    const newProj = {
      id: `proj_${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      projectUrl: '',
      githubUrl: '',
      bullets: [''],
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const updateProject = <K extends keyof ProjectEntry,>(
    index: number,
    field: K,
    value: ProjectEntry[K]
  ) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const removeProject = (index: number) => {
    onChange({ ...data, projects: data.projects.filter((_, i) => i !== index) });
  };

  // Skills Helpers
  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  const addTechSkill = (name: string, level: SkillItem['level'] = 'Advanced') => {
    if (!name.trim()) return;
    const exists = data.skills.technical.some(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!exists) {
      onChange({
        ...data,
        skills: {
          ...data.skills,
          technical: [...data.skills.technical, { id: `sk_${Date.now()}`, name: name.trim(), level }],
        },
      });
    }
    setTechInput('');
  };

  const removeTechSkill = (id: string) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        technical: data.skills.technical.filter((s) => s.id !== id),
      },
    });
  };

  const addSoftSkill = (name: string) => {
    if (!name.trim()) return;
    const exists = data.skills.soft.some(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!exists) {
      onChange({
        ...data,
        skills: {
          ...data.skills,
          soft: [...data.skills.soft, { id: `sk_${Date.now()}`, name: name.trim() }],
        },
      });
    }
    setSoftInput('');
  };

  const removeSoftSkill = (id: string) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        soft: data.skills.soft.filter((s) => s.id !== id),
      },
    });
  };

  // Additional sections toggle
  const toggleAdditionalSection = (key: keyof typeof data.additional.enabledSections) => {
    onChange({
      ...data,
      additional: {
        ...data.additional,
        enabledSections: {
          ...data.additional.enabledSections,
          [key]: !data.additional.enabledSections[key],
        },
      },
    });
  };

  const addAchievement = () => {
    onChange({
      ...data,
      additional: {
        ...data.additional,
        achievements: [
          ...data.additional.achievements,
          { id: `achievement_${Date.now()}`, title: '', description: '', date: '' },
        ],
      },
    });
  };

  const updateAchievement = (index: number, field: 'title' | 'description' | 'date', value: string) => {
    const achievements = data.additional.achievements.map((achievement, currentIndex) =>
      currentIndex === index ? { ...achievement, [field]: value } : achievement
    );
    onChange({ ...data, additional: { ...data.additional, achievements } });
  };

  const removeAchievement = (index: number) => {
    onChange({
      ...data,
      additional: {
        ...data.additional,
        achievements: data.additional.achievements.filter((_, currentIndex) => currentIndex !== index),
      },
    });
  };

  const addCoursework = () => {
    onChange({
      ...data,
      additional: { ...data.additional, coursework: [...data.additional.coursework, ''] },
    });
  };

  const updateCoursework = (index: number, value: string) => {
    const coursework = data.additional.coursework.map((course, currentIndex) =>
      currentIndex === index ? value : course
    );
    onChange({ ...data, additional: { ...data.additional, coursework } });
  };

  const removeCoursework = (index: number) => {
    onChange({
      ...data,
      additional: {
        ...data.additional,
        coursework: data.additional.coursework.filter((_, currentIndex) => currentIndex !== index),
      },
    });
  };

  // Section Reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...data.sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onChange({ ...data, sectionOrder: newOrder });
  };

  return (
    <div className="space-y-4">
      {/* 1. PERSONAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Personal Information</h3>
              <p className="text-[11px] text-[#77798B]">Name, professional title, and contact details</p>
            </div>
          </div>
          {openSections.personal ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.personal && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  Professional Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  Phone Number
                </label>
                <Input
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  Location (City, Country)
                </label>
                <Input
                  value={data.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="San Francisco, CA"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  LinkedIn URL
                </label>
                <Input
                  value={data.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/alexmorgan"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  GitHub URL
                </label>
                <Input
                  value={data.personalInfo.github}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="github.com/alexmorgan"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1">
                  Portfolio / Website
                </label>
                <Input
                  value={data.personalInfo.website}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  placeholder="alexmorgan.dev"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PROFESSIONAL SUMMARY */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Professional Summary</h3>
              <p className="text-[11px] text-[#77798B]">High-level elevator pitch and core strengths</p>
            </div>
          </div>
          {openSections.summary ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.summary && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider">
                Summary Text
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAiAssist('improve-summary', data.summary, data.personalInfo.jobTitle)}
                className="h-7 text-[11px] font-semibold text-[#4F46D8] border-[#4F46D8]/30 hover:bg-[#F3F0FC] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Improve with AI
              </Button>
            </div>

            <Textarea
              value={data.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="3-4 punchy sentences highlighting your core engineering achievements, leadership, and specializations..."
              rows={4}
              className="text-xs leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] text-[#77798B]">
              <span>Recommended: 200–450 characters</span>
              <span>{data.summary.length} characters</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. WORK EXPERIENCE */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Work Experience & Internships</h3>
              <p className="text-[11px] text-[#77798B]">{data.experience.length} position{data.experience.length === 1 ? '' : 's'} listed</p>
            </div>
          </div>
          {openSections.experience ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.experience && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-5">
            {data.experience.map((exp, expIdx) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]/30 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-[#E7E1D4]/70 pb-2">
                  <span className="text-xs font-bold text-[#171A35]">
                    Position #{expIdx + 1} {exp.company ? `— ${exp.company}` : ''}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(expIdx)}
                    className="h-7 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Job Title</label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(expIdx, 'title', e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Company / Organization</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
                      placeholder="e.g. CloudPulse Technologies"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Employment Type</label>
                    <Input
                      value={exp.employmentType || ''}
                      onChange={(e) => updateExperience(expIdx, 'employmentType', e.target.value)}
                      placeholder="Full-time / Internship / Contract"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Location</label>
                    <Input
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(expIdx, 'location', e.target.value)}
                      placeholder="San Francisco, CA or Remote"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Start Date</label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) => updateExperience(expIdx, 'startDate', e.target.value)}
                      placeholder="Jun 2022"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-[#77798B] uppercase">End Date</label>
                      <label className="flex items-center gap-1.5 text-[10px] text-[#171A35] font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(expIdx, 'current', e.target.checked)}
                          className="rounded text-[#4F46D8]"
                        />
                        <span>Current Role</span>
                      </label>
                    </div>
                    <Input
                      disabled={exp.current}
                      value={exp.current ? 'Present' : exp.endDate}
                      onChange={(e) => updateExperience(expIdx, 'endDate', e.target.value)}
                      placeholder="Present or Aug 2024"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-2 border-t border-[#E7E1D4]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#77798B] uppercase">Key Responsibilities & Quantified Achievements</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addExperienceBullet(expIdx)}
                      className="h-6 text-[10.5px] text-[#4F46D8] hover:bg-[#F3F0FC] px-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Bullet
                    </Button>
                  </div>

                  {exp.bullets?.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-gray-400 mt-2 text-xs">•</span>
                      <Textarea
                        value={bullet}
                        onChange={(e) => updateExperienceBullet(expIdx, bIdx, e.target.value)}
                        placeholder="Action verb + Context + Measurable result (e.g. Architected microservice that scaled throughput by 40%)..."
                        rows={2}
                        className="text-xs leading-relaxed flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          title="Polish Bullet with AI"
                          onClick={() => onAiAssist('polish-bullet', bullet, exp.title || 'Engineer')}
                          className="h-7 w-7 p-0 text-[#4F46D8] hover:bg-[#F3F0FC]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          title="Remove Bullet"
                          onClick={() => removeExperienceBullet(expIdx, bIdx)}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExperience}
              className="w-full border-dashed border-[#4F46D8]/50 text-[#4F46D8] hover:bg-[#F3F0FC] text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Another Work Experience
            </Button>
          </div>
        )}
      </div>

      {/* 4. PROJECTS */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('projects')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Projects</h3>
              <p className="text-[11px] text-[#77798B]">{data.projects.length} project{data.projects.length === 1 ? '' : 's'} listed</p>
            </div>
          </div>
          {openSections.projects ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.projects && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-4">
            {data.projects.map((proj, projIdx) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]/30 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-[#E7E1D4]/70 pb-2">
                  <span className="text-xs font-bold text-[#171A35]">
                    Project #{projIdx + 1} {proj.title ? `— ${proj.title}` : ''}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(projIdx)}
                    className="h-7 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Project Title</label>
                    <Input
                      value={proj.title}
                      onChange={(e) => updateProject(projIdx, 'title', e.target.value)}
                      placeholder="e.g. AI Resume Simulator"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Technologies Used (comma separated)</label>
                    <Input
                      value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''}
                      onChange={(e) =>
                        updateProject(
                          projIdx,
                          'technologies',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      placeholder="Next.js, TypeScript, Docker, PostgreSQL"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Live Project / Demo URL</label>
                    <Input
                      value={proj.projectUrl || ''}
                      onChange={(e) => updateProject(projIdx, 'projectUrl', e.target.value)}
                      placeholder="https://example.com"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">GitHub / Repository URL</label>
                    <Input
                      value={proj.githubUrl || ''}
                      onChange={(e) => updateProject(projIdx, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/user/repo"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Description & Key Outcomes</label>
                  <Textarea
                    value={proj.description}
                    onChange={(e) => updateProject(projIdx, 'description', e.target.value)}
                    placeholder="Brief description of architecture, technical challenges solved, and performance results..."
                    rows={2}
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProject}
              className="w-full border-dashed border-[#4F46D8]/50 text-[#4F46D8] hover:bg-[#F3F0FC] text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Another Project
            </Button>
          </div>
        )}
      </div>

      {/* 5. EDUCATION */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('education')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Education</h3>
              <p className="text-[11px] text-[#77798B]">{data.education.length} degree{data.education.length === 1 ? '' : 's'} listed</p>
            </div>
          </div>
          {openSections.education ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.education && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-4">
            {data.education.map((edu, eduIdx) => (
              <div
                key={edu.id}
                className="p-4 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1]/30 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-[#E7E1D4]/70 pb-2">
                  <span className="text-xs font-bold text-[#171A35]">
                    Degree #{eduIdx + 1} {edu.institution ? `— ${edu.institution}` : ''}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(eduIdx)}
                    className="h-7 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Institution</label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(eduIdx, 'institution', e.target.value)}
                      placeholder="University of California, Berkeley"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Degree</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(eduIdx, 'degree', e.target.value)}
                      placeholder="B.S. / M.S. / High School Diploma"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Field of Study</label>
                    <Input
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(eduIdx, 'fieldOfStudy', e.target.value)}
                      placeholder="Computer Science & Engineering"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Grade / GPA (Optional)</label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(eduIdx, 'gpa', e.target.value)}
                      placeholder="3.85 / 4.00"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Start Date</label>
                    <Input
                      value={edu.startDate}
                      onChange={(e) => updateEducation(eduIdx, 'startDate', e.target.value)}
                      placeholder="Aug 2018"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">End Date / Graduation</label>
                    <Input
                      value={edu.endDate}
                      onChange={(e) => updateEducation(eduIdx, 'endDate', e.target.value)}
                      placeholder="May 2022"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#77798B] uppercase block mb-1">Description / Honors (Optional)</label>
                  <Input
                    value={edu.description || ''}
                    onChange={(e) => updateEducation(eduIdx, 'description', e.target.value)}
                    placeholder="Dean’s Honors List, Relevant Coursework, Leadership..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEducation}
              className="w-full border-dashed border-[#4F46D8]/50 text-[#4F46D8] hover:bg-[#F3F0FC] text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Another Degree
            </Button>
          </div>
        )}
      </div>

      {/* 6. SKILLS */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Skills & Core Competencies</h3>
              <p className="text-[11px] text-[#77798B]">
                {data.skills.technical.length} technical, {data.skills.soft.length} soft skills
              </p>
            </div>
          </div>
          {openSections.skills ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.skills && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-4">
            {/* Technical Skills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider">
                  Technical Skills
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onAiAssist(
                      'suggest-skills',
                      data.personalInfo.jobTitle || 'Full Stack Developer',
                      data.summary
                    )
                  }
                  className="h-6 text-[10.5px] font-semibold text-[#4F46D8] border-[#4F46D8]/30 hover:bg-[#F3F0FC] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  Suggest Skills with AI
                </Button>
              </div>

              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechSkill(techInput);
                    }
                  }}
                  placeholder="Type skill and press Enter (e.g. Next.js, Docker, PostgreSQL)..."
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addTechSkill(techInput)}
                  className="h-8 bg-[#4F46D8] text-white text-xs px-3"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {data.skills.technical.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 bg-[#F3F0FC] border border-[#E7E1D4] text-[#4F46D8] px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    <span>{s.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTechSkill(s.id)}
                      className="text-[#77798B] hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="pt-2 border-t border-[#E7E1D4]/60">
              <label className="text-[11px] font-bold text-[#171A35] uppercase tracking-wider block mb-1.5">
                Soft Skills / Core Competencies
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={softInput}
                  onChange={(e) => setSoftInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSoftSkill(softInput);
                    }
                  }}
                  placeholder="Type soft skill (e.g. System Design, Agile Leadership)..."
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addSoftSkill(softInput)}
                  className="h-8 bg-[#4F46D8] text-white text-xs px-3"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {data.skills.soft.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    <span>{s.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSoftSkill(s.id)}
                      className="text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. ADDITIONAL SECTIONS */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('additional')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Additional Sections</h3>
              <p className="text-[11px] text-[#77798B]">Certifications, Achievements, Coursework, Languages, Volunteer & Honors</p>
            </div>
          </div>
          {openSections.additional ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.additional && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3 border-b border-[#E7E1D4]">
              {Object.entries(data.additional.enabledSections).map(([secKey, isEnabled]) => (
                <label
                  key={secKey}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isEnabled
                      ? 'bg-[#F3F0FC] border-[#4F46D8] text-[#171A35]'
                      : 'bg-white border-[#E7E1D4] text-[#77798B]'
                  }`}
                >
                  <span className="text-xs font-bold capitalize">{secKey}</span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() =>
                      toggleAdditionalSection(secKey as keyof typeof data.additional.enabledSections)
                    }
                  />
                </label>
              ))}
            </div>

            {/* Achievements Editor */}
            {data.additional.enabledSections.achievements && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A35] uppercase">Achievements</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addAchievement}
                    className="h-6 text-[10.5px] text-[#4F46D8] hover:bg-[#F3F0FC] px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Achievement
                  </Button>
                </div>

                {data.additional.achievements.map((achievement, index) => (
                  <div key={achievement.id} className="rounded-xl border border-[#E7E1D4] p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={achievement.title}
                        onChange={(event) => updateAchievement(index, 'title', event.target.value)}
                        placeholder="Achievement title"
                        aria-label="Achievement title"
                        className="h-8 text-xs flex-1"
                      />
                      <Input
                        value={achievement.date ?? ''}
                        onChange={(event) => updateAchievement(index, 'date', event.target.value)}
                        placeholder="Date"
                        aria-label="Achievement date"
                        className="h-8 text-xs w-28"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                        aria-label="Remove achievement"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      value={achievement.description}
                      onChange={(event) => updateAchievement(index, 'description', event.target.value)}
                      placeholder="Describe the achievement and its impact"
                      aria-label="Achievement description"
                      className="min-h-16 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Coursework Editor */}
            {data.additional.enabledSections.coursework && (
              <div className="space-y-3 pt-2 border-t border-[#E7E1D4]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A35] uppercase">Coursework</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addCoursework}
                    className="h-6 text-[10.5px] text-[#4F46D8] hover:bg-[#F3F0FC] px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Course
                  </Button>
                </div>

                {data.additional.coursework.map((course, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={course}
                      onChange={(event) => updateCoursework(index, event.target.value)}
                      placeholder="Course name"
                      aria-label={`Coursework entry ${index + 1}`}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoursework(index)}
                      aria-label="Remove coursework entry"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications Editor */}
            {data.additional.enabledSections.certifications && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A35] uppercase">Certifications</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newCert = { id: `cert_${Date.now()}`, name: '', issuer: '', date: '', url: '' };
                      onChange({
                        ...data,
                        additional: {
                          ...data.additional,
                          certifications: [...data.additional.certifications, newCert],
                        },
                      });
                    }}
                    className="h-6 text-[10.5px] text-[#4F46D8] hover:bg-[#F3F0FC] px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Certificate
                  </Button>
                </div>

                {data.additional.certifications.map((cert, cIdx) => (
                  <div key={cert.id} className="flex items-center gap-2">
                    <Input
                      value={cert.name}
                      onChange={(e) => {
                        const updated = [...data.additional.certifications];
                        updated[cIdx].name = e.target.value;
                        onChange({ ...data, additional: { ...data.additional, certifications: updated } });
                      }}
                      placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      value={cert.issuer}
                      onChange={(e) => {
                        const updated = [...data.additional.certifications];
                        updated[cIdx].issuer = e.target.value;
                        onChange({ ...data, additional: { ...data.additional, certifications: updated } });
                      }}
                      placeholder="Issuer (e.g. AWS)"
                      className="h-8 text-xs w-32"
                    />
                    <Input
                      value={cert.date}
                      onChange={(e) => {
                        const updated = [...data.additional.certifications];
                        updated[cIdx].date = e.target.value;
                        onChange({ ...data, additional: { ...data.additional, certifications: updated } });
                      }}
                      placeholder="Year"
                      className="h-8 text-xs w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onChange({
                          ...data,
                          additional: {
                            ...data.additional,
                            certifications: data.additional.certifications.filter((_, i) => i !== cIdx),
                          },
                        });
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Languages Editor */}
            {data.additional.enabledSections.languages && (
              <div className="space-y-3 pt-2 border-t border-[#E7E1D4]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A35] uppercase">Languages</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newLang = { id: `lang_${Date.now()}`, language: '', proficiency: 'Fluent' as const };
                      onChange({
                        ...data,
                        additional: {
                          ...data.additional,
                          languages: [...data.additional.languages, newLang],
                        },
                      });
                    }}
                    className="h-6 text-[10.5px] text-[#4F46D8] hover:bg-[#F3F0FC] px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Language
                  </Button>
                </div>

                {data.additional.languages.map((lang, lIdx) => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <Input
                      value={lang.language}
                      onChange={(e) => {
                        const updated = [...data.additional.languages];
                        updated[lIdx].language = e.target.value;
                        onChange({ ...data, additional: { ...data.additional, languages: updated } });
                      }}
                      placeholder="Language (e.g. English, Spanish, German)"
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      value={lang.proficiency}
                      onChange={(e) => {
                        const updated = [...data.additional.languages];
                        updated[lIdx].proficiency = e.target.value;
                        onChange({ ...data, additional: { ...data.additional, languages: updated } });
                      }}
                      placeholder="Proficiency (Fluent, Native...)"
                      className="h-8 text-xs w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onChange({
                          ...data,
                          additional: {
                            ...data.additional,
                            languages: data.additional.languages.filter((_, i) => i !== lIdx),
                          },
                        });
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 8. SECTION REORDERING */}
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('order')}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FAF8F1]/40 hover:bg-[#FAF8F1] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Reorder Resume Sections</h3>
              <p className="text-[11px] text-[#77798B]">Customize section priority (e.g. Experience before Education)</p>
            </div>
          </div>
          {openSections.order ? <ChevronUp className="w-4 h-4 text-[#77798B]" /> : <ChevronDown className="w-4 h-4 text-[#77798B]" />}
        </button>

        {openSections.order && (
          <div className="p-5 border-t border-[#E7E1D4] space-y-2">
            <p className="text-xs text-[#77798B] mb-2">
              Move sections up or down to reflect the flow best suited for your target role:
            </p>
            <div className="space-y-1.5">
              {data.sectionOrder.map((sec, idx) => (
                <div
                  key={sec}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-[#171A35] font-semibold"
                >
                  <span className="capitalize">{sec}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      className="h-7 w-7 p-0 text-gray-500 hover:text-[#4F46D8]"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === data.sectionOrder.length - 1}
                      onClick={() => moveSection(idx, 'down')}
                      className="h-7 w-7 p-0 text-gray-500 hover:text-[#4F46D8]"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
