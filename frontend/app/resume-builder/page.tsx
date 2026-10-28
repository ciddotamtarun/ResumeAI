'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileEdit,
  FolderOpen,
  Printer,
  Brain,
  Save,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle,
  Layout,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import {
  ResumeBuilderData,
  SectionKey,
  TemplateType,
} from '@/types/builder';
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_ENABLED_SECTIONS,
  SAMPLE_RESUME_DATA,
  EMPTY_RESUME_DATA,
  calculateResumeScore,
} from '@/lib/builder-defaults';
import PersonalSection from '@/components/resume-builder/PersonalSection';
import SummarySection from '@/components/resume-builder/SummarySection';
import ExperienceSection from '@/components/resume-builder/ExperienceSection';
import EducationSection from '@/components/resume-builder/EducationSection';
import ProjectsSection from '@/components/resume-builder/ProjectsSection';
import SkillsSection from '@/components/resume-builder/SkillsSection';
import AdditionalSections from '@/components/resume-builder/AdditionalSections';
import SectionManager from '@/components/resume-builder/SectionManager';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import DraftManagerModal from '@/components/resume-builder/DraftManagerModal';
import AIAssistModal from '@/components/resume-builder/AIAssistModal';
import AnalyzeConfirmModal from '@/components/resume-builder/AnalyzeConfirmModal';
import { toast } from 'sonner';

type EditorTab = 'personal' | 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'additional' | 'reorder';

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Storage key based on user identity
  const storagePrefix = user ? `elevateai_${user.id || user.email}` : 'elevateai_guest';
  const DRAFTS_KEY = `${storagePrefix}_builder_drafts`;
  const ACTIVE_DRAFT_KEY = `${storagePrefix}_builder_active_id`;

  // State
  const [drafts, setDrafts] = useState<ResumeBuilderData[]>([]);
  const [currentData, setCurrentData] = useState<ResumeBuilderData>(SAMPLE_RESUME_DATA);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Modals state
  const [draftManagerOpen, setDraftManagerOpen] = useState(false);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    action: 'improve-summary' | 'improve-bullet' | 'suggest-skills';
    initialText: string;
    context?: string;
    onApply: (text: string) => void;
    onApplySkills?: (tech: string[], soft: string[]) => void;
  }>({
    isOpen: false,
    action: 'improve-summary',
    initialText: '',
    onApply: () => {},
  });

  // Load drafts on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFTS_KEY);
      const activeId = localStorage.getItem(ACTIVE_DRAFT_KEY);

      if (stored) {
        const parsed: ResumeBuilderData[] = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setDrafts(parsed);
          const found = parsed.find((d) => d.id === activeId) || parsed[0];
          setCurrentData(found);
          return;
        }
      }

      // Default initial sample
      const initial = { ...SAMPLE_RESUME_DATA, id: `draft-${Date.now()}` };
      setDrafts([initial]);
      setCurrentData(initial);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify([initial]));
      localStorage.setItem(ACTIVE_DRAFT_KEY, initial.id);
    } catch (e) {
      console.warn('Failed to parse saved drafts from localStorage:', e);
      setCurrentData(SAMPLE_RESUME_DATA);
    }
  }, [DRAFTS_KEY, ACTIVE_DRAFT_KEY]);

  // Autosave handler (debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveCurrentData = useCallback((dataToSave: ResumeBuilderData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const updated = {
          ...dataToSave,
          updatedAt: new Date().toISOString(),
        };

        setDrafts((prev) => {
          const exists = prev.some((d) => d.id === updated.id);
          const next = exists
            ? prev.map((d) => (d.id === updated.id ? updated : d))
            : [updated, ...prev];
          localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
          return next;
        });

        localStorage.setItem(ACTIVE_DRAFT_KEY, updated.id);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('unsaved');
      }
    }, 600);
  }, [DRAFTS_KEY, ACTIVE_DRAFT_KEY]);

  // Update data wrapper
  const handleUpdate = (updater: (prev: ResumeBuilderData) => ResumeBuilderData) => {
    setCurrentData((prev) => {
      const next = updater(prev);
      saveCurrentData(next);
      return next;
    });
  };

  // Draft operations
  const handleSelectDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setCurrentData(draft);
      localStorage.setItem(ACTIVE_DRAFT_KEY, draft.id);
      toast.success(`Opened "${draft.title}"`);
    }
  };

  const handleCreateNewDraft = (useSample = false) => {
    const newDraft: ResumeBuilderData = useSample
      ? {
          ...SAMPLE_RESUME_DATA,
          id: `draft-${Date.now()}`,
          title: `Resume ${drafts.length + 1}`,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
      : {
          ...EMPTY_RESUME_DATA,
          id: `draft-${Date.now()}`,
          title: `Untitled Resume ${drafts.length + 1}`,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

    const nextDrafts = [newDraft, ...drafts];
    setDrafts(nextDrafts);
    setCurrentData(newDraft);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(nextDrafts));
    localStorage.setItem(ACTIVE_DRAFT_KEY, newDraft.id);
    toast.success('Created new resume draft');
  };

  const handleRenameDraft = (draftId: string, newTitle: string) => {
    const next = drafts.map((d) => (d.id === draftId ? { ...d, title: newTitle } : d));
    setDrafts(next);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    if (currentData.id === draftId) {
      setCurrentData((prev) => ({ ...prev, title: newTitle }));
    }
  };

  const handleDuplicateDraft = (draftId: string) => {
    const source = drafts.find((d) => d.id === draftId);
    if (!source) return;

    const copy: ResumeBuilderData = {
      ...source,
      id: `draft-${Date.now()}`,
      title: `${source.title} (Copy)`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const next = [copy, ...drafts];
    setDrafts(next);
    setCurrentData(copy);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    localStorage.setItem(ACTIVE_DRAFT_KEY, copy.id);
    toast.success(`Duplicated "${source.title}"`);
  };

  const handleDeleteDraft = (draftId: string) => {
    const remaining = drafts.filter((d) => d.id !== draftId);
    setDrafts(remaining);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(remaining));

    if (currentData.id === draftId) {
      const nextActive = remaining[0] || SAMPLE_RESUME_DATA;
      setCurrentData(nextActive);
      localStorage.setItem(ACTIVE_DRAFT_KEY, nextActive.id);
    }
    toast.success('Resume draft deleted');
  };

  // PDF Print Functionality
  const handlePrintPDF = () => {
    const originalTitle = document.title;
    const sanitizedName = (currentData.contact.fullName || 'Candidate').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    document.title = `${sanitizedName}_Resume`;

    toast.info('Opening print dialog. Select "Save as PDF" for vector document export.');
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // AI Modal Triggers
  const openSummaryAI = (text: string) => {
    setAiModal({
      isOpen: true,
      action: 'improve-summary',
      initialText: text,
      context: currentData.contact.jobTitle,
      onApply: (improved) => {
        handleUpdate((prev) => ({ ...prev, summary: improved }));
      },
    });
  };

  const openBulletAI = (bullet: string, roleContext: string, onApply: (newBullet: string) => void) => {
    setAiModal({
      isOpen: true,
      action: 'improve-bullet',
      initialText: bullet,
      context: roleContext,
      onApply: (improved) => {
        onApply(improved);
      },
    });
  };

  const openSkillsAI = () => {
    setAiModal({
      isOpen: true,
      action: 'suggest-skills',
      initialText: currentData.skills.technical.join(', '),
      context: currentData.contact.jobTitle,
      onApply: () => {},
      onApplySkills: (tech, soft) => {
        handleUpdate((prev) => ({
          ...prev,
          skills: {
            technical: Array.from(new Set([...prev.skills.technical, ...tech])),
            soft: Array.from(new Set([...prev.skills.soft, ...soft])),
          },
        }));
      },
    });
  };

  const completionScore = calculateResumeScore(currentData);

  return (
    <AppShell>
      {/* ─── Dedicated Print Stylesheet for Real Vector PDF Export ────────── */}
      <style jsx global>{`
        @media print {
          /* Hide surrounding layout, sidebar, headers, and UI controls */
          header,
          nav,
          aside,
          button,
          .no-print,
          div[role='dialog'],
          #__next > div > div > aside,
          div:has(> aside) {
            display: none !important;
          }

          body,
          html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* Isolate printable A4 container */
          #resume-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="space-y-5 pb-12">
        {/* ─── Top Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E7E1D4]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F3F0FC] text-[#4F46D8]">
                <FileEdit className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-[#171A35]">
                Resume Builder
              </h1>
            </div>
            <p className="text-xs text-[#77798B] mt-1 flex items-center gap-2">
              <span>Craft professional, ATS-optimized resumes with live instant preview</span>
              <span>•</span>
              <span className="text-[#168575] font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {saveStatus === 'saving' ? 'Saving changes...' : 'Draft autosaved'}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Drafts Manager */}
            <button
              type="button"
              onClick={() => setDraftManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E7E1D4] text-xs font-semibold text-[#171A35] hover:bg-[#FAF8F1] transition-colors shadow-xs"
            >
              <FolderOpen className="w-4 h-4 text-[#4F46D8]" />
              <span>Drafts ({drafts.length})</span>
            </button>

            {/* Analyze with Resume Studio */}
            <button
              type="button"
              onClick={() => setAnalyzeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F3F0FC] hover:bg-[#4F46D8] text-[#4F46D8] hover:text-white border border-[#4F46D8]/20 text-xs font-semibold transition-all shadow-xs"
            >
              <Brain className="w-4 h-4" />
              <span>Analyze Resume</span>
            </button>

            {/* Print / Download PDF */}
            <button
              type="button"
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* ─── Score & Status Banner ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#E7E1D4] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3F0FC] flex items-center justify-center font-bold text-xs text-[#4F46D8]">
              {completionScore}%
            </div>
            <div>
              <div className="text-xs font-bold text-[#171A35]">
                Resume Completeness: {completionScore >= 80 ? 'Excellent' : completionScore >= 50 ? 'In Progress' : 'Needs Details'}
              </div>
              <div className="w-36 sm:w-48 bg-[#FAF8F1] h-1.5 rounded-full overflow-hidden mt-1 border border-[#E7E1D4]">
                <div
                  className="h-full bg-[#4F46D8] rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mobile View Toggle */}
          <div className="flex lg:hidden items-center bg-[#FAF8F1] p-1 rounded-xl border border-[#E7E1D4]">
            <button
              type="button"
              onClick={() => setMobileView('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mobileView === 'editor' ? 'bg-[#4F46D8] text-white' : 'text-[#77798B]'
              }`}
            >
              Edit Form
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mobileView === 'preview' ? 'bg-[#4F46D8] text-white' : 'text-[#77798B]'
              }`}
            >
              Live Preview
            </button>
          </div>

          <div className="text-[11px] text-[#77798B] hidden sm:block">
            Editing Draft: <strong className="text-[#171A35]">{currentData.title}</strong>
          </div>
        </div>

        {/* ─── Main Two-Column Layout ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor (lg:col-span-6 or 7) */}
          <div
            className={`space-y-4 lg:col-span-6 xl:col-span-6 ${
              mobileView === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Editor Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none bg-white p-1.5 rounded-2xl border border-[#E7E1D4]">
              {[
                { id: 'personal', label: 'Contact' },
                { id: 'summary', label: 'Summary' },
                { id: 'experience', label: 'Experience' },
                { id: 'projects', label: 'Projects' },
                { id: 'skills', label: 'Skills' },
                { id: 'education', label: 'Education' },
                { id: 'additional', label: 'More' },
                { id: 'reorder', label: 'Reorder' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as EditorTab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#F3F0FC] text-[#4F46D8] shadow-xs'
                      : 'text-[#77798B] hover:text-[#171A35] hover:bg-[#FAF8F1]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Section Panels */}
            {activeTab === 'personal' && (
              <PersonalSection
                contact={currentData.contact}
                onChange={(contact) => handleUpdate((prev) => ({ ...prev, contact }))}
              />
            )}

            {activeTab === 'summary' && (
              <SummarySection
                summary={currentData.summary}
                onChange={(summary) => handleUpdate((prev) => ({ ...prev, summary }))}
                onAIAssist={openSummaryAI}
              />
            )}

            {activeTab === 'experience' && (
              <ExperienceSection
                experience={currentData.experience}
                onChange={(experience) => handleUpdate((prev) => ({ ...prev, experience }))}
                onAIBulletAssist={openBulletAI}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsSection
                projects={currentData.projects}
                onChange={(projects) => handleUpdate((prev) => ({ ...prev, projects }))}
                onAIBulletAssist={openBulletAI}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsSection
                skills={currentData.skills}
                onChange={(skills) => handleUpdate((prev) => ({ ...prev, skills }))}
                onAISkillSuggest={openSkillsAI}
              />
            )}

            {activeTab === 'education' && (
              <EducationSection
                education={currentData.education}
                onChange={(education) => handleUpdate((prev) => ({ ...prev, education }))}
              />
            )}

            {activeTab === 'additional' && (
              <AdditionalSections
                certifications={currentData.certifications}
                awards={currentData.awards}
                volunteer={currentData.volunteer}
                languages={currentData.languages}
                enabledSections={currentData.enabledSections}
                onToggleSection={(key) =>
                  handleUpdate((prev) => ({
                    ...prev,
                    enabledSections: {
                      ...prev.enabledSections,
                      [key]: !prev.enabledSections[key],
                    },
                  }))
                }
                onUpdateCertifications={(certifications) =>
                  handleUpdate((prev) => ({ ...prev, certifications }))
                }
                onUpdateAwards={(awards) => handleUpdate((prev) => ({ ...prev, awards }))}
                onUpdateVolunteer={(volunteer) =>
                  handleUpdate((prev) => ({ ...prev, volunteer }))
                }
                onUpdateLanguages={(languages) =>
                  handleUpdate((prev) => ({ ...prev, languages }))
                }
              />
            )}

            {activeTab === 'reorder' && (
              <SectionManager
                sectionOrder={currentData.sectionOrder}
                enabledSections={currentData.enabledSections}
                onReorder={(sectionOrder) => handleUpdate((prev) => ({ ...prev, sectionOrder }))}
                onToggle={(key) =>
                  handleUpdate((prev) => ({
                    ...prev,
                    enabledSections: {
                      ...prev.enabledSections,
                      [key]: !prev.enabledSections[key],
                    },
                  }))
                }
              />
            )}
          </div>

          {/* Right Column: Live Sticky Resume Preview (lg:col-span-6 or 7) */}
          <div
            className={`lg:col-span-6 xl:col-span-6 sticky top-20 ${
              mobileView === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="h-[85vh]">
              <ResumePreview
                data={currentData}
                onTemplateChange={(template: TemplateType) =>
                  handleUpdate((prev) => ({ ...prev, template }))
                }
                onPrintPDF={handlePrintPDF}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────────────────────── */}
      <DraftManagerModal
        isOpen={draftManagerOpen}
        onClose={() => setDraftManagerOpen(false)}
        currentDraftId={currentData.id}
        drafts={drafts}
        onSelectDraft={handleSelectDraft}
        onCreateNewDraft={handleCreateNewDraft}
        onRenameDraft={handleRenameDraft}
        onDuplicateDraft={handleDuplicateDraft}
        onDeleteDraft={handleDeleteDraft}
      />

      <AIAssistModal
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal((prev) => ({ ...prev, isOpen: false }))}
        action={aiModal.action}
        initialText={aiModal.initialText}
        context={aiModal.context}
        onApply={aiModal.onApply}
        onApplySkills={aiModal.onApplySkills}
      />

      <AnalyzeConfirmModal
        isOpen={analyzeModalOpen}
        onClose={() => setAnalyzeModalOpen(false)}
        data={currentData}
      />
    </AppShell>
  );
}
