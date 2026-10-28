'use client';

import React from 'react';
import { FolderGit2, Plus, Trash2, ChevronDown, ChevronUp, Link as LinkIcon, Code2, Sparkles } from 'lucide-react';
import { ResumeProject } from '@/types/builder';

interface ProjectsSectionProps {
  projects: ResumeProject[];
  onChange: (projects: ResumeProject[]) => void;
  onAIBulletAssist: (bullet: string, roleContext: string, onApply: (newBullet: string) => void) => void;
}

export default function ProjectsSection({
  projects,
  onChange,
  onAIBulletAssist,
}: ProjectsSectionProps) {
  const addEntry = () => {
    const newEntry: ResumeProject = {
      id: `proj-${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      projectUrl: '',
      githubUrl: '',
      bullets: [''],
    };
    onChange([...projects, newEntry]);
  };

  const removeEntry = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<ResumeProject>) => {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const items = [...projects];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    onChange(items);
  };

  const handleTechChange = (id: string, value: string) => {
    const techArray = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateEntry(id, { technologies: techArray });
  };

  const addBullet = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    updateEntry(projId, { bullets: [...proj.bullets, ''] });
  };

  const updateBullet = (projId: string, index: number, val: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const newBullets = [...proj.bullets];
    newBullets[index] = val;
    updateEntry(projId, { bullets: newBullets });
  };

  const removeBullet = (projId: string, index: number) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const newBullets = proj.bullets.filter((_, idx) => idx !== index);
    updateEntry(projId, { bullets: newBullets.length ? newBullets : [''] });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171A35]">Technical & Open Source Projects</h3>
            <p className="text-xs text-[#77798B]">Showcase notable engineering systems, apps, and repositories</p>
          </div>
        </div>

        <button
          type="button"
          onClick={addEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-6 px-4 bg-[#FAF8F1] rounded-xl border border-dashed border-[#E7E1D4]">
          <FolderGit2 className="w-8 h-8 text-[#77798B] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#171A35]">No projects added yet</p>
          <p className="text-[11px] text-[#77798B] mt-0.5">Highlight your top technical projects to demonstrate hands-on mastery</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj, index) => (
            <div
              key={proj.id}
              className="bg-[#FAF8F1]/60 rounded-xl p-4 border border-[#E7E1D4] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171A35] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>{proj.title || 'New Project'}</span>
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
                    disabled={index === projects.length - 1}
                    onClick={() => moveEntry(index, 'down')}
                    className="p-1 hover:text-[#4F46D8] disabled:opacity-30 rounded text-[#77798B] transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEntry(proj.id)}
                    className="p-1 hover:text-red-600 rounded text-[#77798B] transition-colors ml-1"
                    title="Remove project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateEntry(proj.id, { title: e.target.value })}
                    placeholder="e.g. CloudPulse — Real-Time Telemetry Engine"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Technologies Used (comma separated)
                  </label>
                  <input
                    type="text"
                    value={proj.technologies.join(', ')}
                    onChange={(e) => handleTechChange(proj.id, e.target.value)}
                    placeholder="e.g. TypeScript, React, Node.js, Docker, Redis"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Live Demo URL (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={proj.projectUrl || ''}
                      onChange={(e) => updateEntry(proj.id, { projectUrl: e.target.value })}
                      placeholder="https://app.demo.io"
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    GitHub / Source Code URL (Optional)
                  </label>
                  <div className="relative">
                    <Code2 className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={proj.githubUrl || ''}
                      onChange={(e) => updateEntry(proj.id, { githubUrl: e.target.value })}
                      placeholder="https://github.com/username/project"
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#171A35] mb-1">
                    Brief Overview / Pitch
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateEntry(proj.id, { description: e.target.value })}
                    placeholder="e.g. Architected an open-source distributed log aggregation pipeline..."
                    className="w-full p-2 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] resize-y"
                  />
                </div>
              </div>

              {/* Key Contributions & Outcomes */}
              <div className="space-y-2 pt-1 border-t border-[#E7E1D4]/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#171A35]">
                    Key Contributions & Metrics
                  </label>
                  <button
                    type="button"
                    onClick={() => addBullet(proj.id)}
                    className="text-[11px] text-[#4F46D8] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                {proj.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-1.5">
                    <span className="text-[#77798B] mt-2 text-[10px]">•</span>
                    <textarea
                      rows={2}
                      value={b}
                      onChange={(e) => updateBullet(proj.id, bIdx, e.target.value)}
                      placeholder="Engineered low-latency ingestion engine handling 10,000 req/sec..."
                      className="flex-1 p-2 text-xs rounded-xl bg-white border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] resize-y"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onAIBulletAssist(b, proj.title || 'Technical Project', (polished) =>
                          updateBullet(proj.id, bIdx, polished)
                        )
                      }
                      className="p-1.5 text-[#77798B] hover:text-[#4F46D8] hover:bg-[#F3F0FC] rounded-lg transition-colors mt-1"
                      title="Polish with AI"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4F46D8]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeBullet(proj.id, bIdx)}
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
