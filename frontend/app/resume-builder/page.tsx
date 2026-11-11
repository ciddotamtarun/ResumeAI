'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileEdit,
  Save,
  FolderOpen,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ResumeData,
  ResumeDraft,
  TemplateType,
  INITIAL_RESUME_DATA,
  EMPTY_RESUME_DATA,
} from '@/types/builder';
import ResumeEditor from '@/components/resume-builder/ResumeEditor';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import AiAssistModal from '@/components/resume-builder/AiAssistModal';
import DraftsModal from '@/components/resume-builder/DraftsModal';
import ExportModal from '@/components/resume-builder/ExportModal';
import { normalizeResumeData } from '@/lib/builder-defaults';

const LOCAL_STORAGE_KEY = 'resume_builder_active_draft_v1';
type AiAssistContext = string | Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) return fallback;

  const response = isRecord(error.response) ? error.response : undefined;
  const responseData = response && isRecord(response.data) ? response.data : undefined;
  const responseMessage = responseData?.message;
  if (typeof responseMessage === 'string') return responseMessage;
  return typeof error.message === 'string' ? error.message : fallback;
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Core Builder State
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('Senior Full Stack Resume');
  const [template, setTemplate] = useState<TemplateType>('classic');
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Mobile View Toggle
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Modals
  const [draftsModalOpen, setDraftsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<ResumeDraft[]>([]);

  // AI Assist Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [aiModalType, setAiModalType] = useState<'improve-summary' | 'polish-bullet' | 'suggest-skills' | 'grammar-fix'>('improve-summary');
  const [aiOriginalText, setAiOriginalText] = useState('');
  const [aiSuggestedText, setAiSuggestedText] = useState<string | string[]>('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiContextRef = useRef<AiAssistContext | undefined>(undefined);

  // Analyzing state
  const [analyzing, setAnalyzing] = useState(false);

  // 2. Fetch User Drafts from Backend
  const loadSavedDrafts = useCallback(async () => {
    try {
      const res = await api.get('/builder/drafts');
      if (res.data?.success && Array.isArray(res.data.drafts)) {
        setSavedDrafts(res.data.drafts);
      }
    } catch {
      // Backend may be offline; fallback to local drafts
    }
  }, []);

  // 1. Initial Load: Restore from LocalStorage or API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isRecord(parsed)) {
            if ('data' in parsed) {
              // Restoring persisted client state is intentional during initial mount.
              // eslint-disable-next-line react-hooks/set-state-in-effect
              setResumeData(normalizeResumeData(parsed.data));
            }
            if (typeof parsed.title === 'string') setDraftTitle(parsed.title);
            if (parsed.template === 'classic' || parsed.template === 'modern' || parsed.template === 'technical') {
              setTemplate(parsed.template);
            }
            if (typeof parsed.id === 'string') setCurrentDraftId(parsed.id);
          }
        }
      } catch (err) {
        console.error('Failed to parse local resume draft', err);
      }
    }

    if (isAuthenticated) {
      loadSavedDrafts();
    }
  }, [isAuthenticated, loadSavedDrafts]);

  // 3. Auto-save to LocalStorage on Change
  const handleDataChange = (updated: ResumeData) => {
    setResumeData(updated);
    setSaveStatus('unsaved');

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          id: currentDraftId,
          title: draftTitle,
          template,
          data: updated,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  };

  // 4. Save Draft to Backend
  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    try {
      if (isAuthenticated) {
        const res = await api.post('/builder/drafts', {
          id: currentDraftId,
          title: draftTitle,
          targetRole: resumeData.personalInfo.jobTitle,
          template,
          data: resumeData,
        });

        if (res.data?.success && res.data.draft) {
          setCurrentDraftId(res.data.draft._id);
          toast.success('Resume draft saved to your account!');
          loadSavedDrafts();
        }
      } else {
        toast.success('Resume draft saved locally!');
      }
      setSaveStatus('saved');
    } catch (err: unknown) {
      console.error('Save failed', err);
      toast.error(getErrorMessage(err, 'Failed to sync with cloud. Draft saved locally.'));
      setSaveStatus('saved');
    }
  };

  // 5. Select & Load a Draft
  const handleSelectDraft = async (draftId: string) => {
    try {
      const res = await api.get(`/builder/drafts/${draftId}`);
      if (res.data?.success && res.data.draft) {
        const draft = res.data.draft;
        setCurrentDraftId(draft._id);
        setDraftTitle(draft.title);
        setTemplate(draft.template || 'classic');
        if (draft.data) setResumeData(normalizeResumeData(draft.data));
        setSaveStatus('saved');
        toast.success(`Loaded draft "${draft.title}"`);
      }
    } catch {
      toast.error('Could not load resume draft.');
    }
  };

  // 6. Create New Resume
  const handleCreateNew = () => {
    setCurrentDraftId(null);
    setDraftTitle('New Untitled Resume');
    setResumeData(EMPTY_RESUME_DATA);
    setSaveStatus('saved');
    toast.info('Started fresh resume draft.');
  };

  // 7. Rename Draft
  const handleRenameDraft = async (draftId: string, newTitle: string) => {
    try {
      const res = await api.patch(`/builder/drafts/${draftId}/rename`, { title: newTitle });
      if (res.data?.success) {
        toast.success('Draft renamed.');
        if (draftId === currentDraftId) setDraftTitle(newTitle);
        loadSavedDrafts();
      }
    } catch {
      toast.error('Failed to rename draft.');
    }
  };

  // 8. Delete Draft
  const handleDeleteDraft = async (draftId: string) => {
    try {
      const res = await api.delete(`/builder/drafts/${draftId}`);
      if (res.data?.success) {
        toast.success('Draft deleted.');
        if (draftId === currentDraftId) {
          handleCreateNew();
        }
        loadSavedDrafts();
      }
    } catch {
      toast.error('Failed to delete draft.');
    }
  };

  // 9. AI Assistance Trigger
  const handleTriggerAiAssist = async (
    type: 'improve-summary' | 'polish-bullet' | 'suggest-skills' | 'grammar-fix',
    text: string,
    context?: AiAssistContext
  ) => {
    setAiModalType(type);
    setAiOriginalText(text);
    aiContextRef.current = context;

    let modalTitle = 'AI Professional Summary Refinement';
    if (type === 'polish-bullet') modalTitle = 'Polish Achievement with XYZ Formula';
    if (type === 'suggest-skills') modalTitle = 'Suggest In-Demand Skills';
    if (type === 'grammar-fix') modalTitle = 'Grammar & Clarity Enhancement';

    setAiModalTitle(modalTitle);
    setAiModalOpen(true);
    setAiLoading(true);

    try {
      const res = await api.post('/builder/ai-assist', {
        type,
        text,
        role: resumeData.personalInfo.jobTitle,
        context: typeof context === 'string' ? context : JSON.stringify(context || {}),
      });

      if (res.data?.success && res.data.result) {
        setAiSuggestedText(res.data.result);
      } else {
        setAiSuggestedText(text);
      }
    } catch {
      toast.error('AI refinement unavailable. Providing heuristic suggestions.');
      if (type === 'improve-summary') {
        setAiSuggestedText(
          `Results-driven ${resumeData.personalInfo.jobTitle || 'Professional'} with demonstrable expertise in designing scalable architectures and accelerating product delivery.`
        );
      } else if (type === 'polish-bullet') {
        setAiSuggestedText(
          'Engineered and optimized core features, improving system performance and reducing processing overhead.'
        );
      } else if (type === 'suggest-skills') {
        setAiSuggestedText(['System Design', 'CI/CD Pipelines', 'REST APIs', 'Cloud Architecture', 'Agile / Scrum']);
      }
    } finally {
      setAiLoading(false);
    }
  };

  // 10. Apply AI Suggestion
  const handleApplyAiSuggestion = (applied: string | string[]) => {
    if (aiModalType === 'improve-summary' && typeof applied === 'string') {
      handleDataChange({ ...resumeData, summary: applied });
      toast.success('Summary updated with AI recommendation!');
    } else if (aiModalType === 'suggest-skills' && Array.isArray(applied)) {
      const existingNames = new Set(resumeData.skills.technical.map((s) => s.name.toLowerCase()));
      const newItems = applied
        .filter((name) => !existingNames.has(name.toLowerCase()))
        .map((name) => ({ id: `sk_${Date.now()}_${Math.random()}`, name, level: 'Advanced' as const }));

      handleDataChange({
        ...resumeData,
        skills: {
          ...resumeData.skills,
          technical: [...resumeData.skills.technical, ...newItems],
        },
      });
      toast.success(`Added ${newItems.length} skills to your resume!`);
    } else if (aiModalType === 'polish-bullet' && typeof applied === 'string') {
      toast.info('Copy the polished bullet point into your experience entry.');
    }
  };

  // 11. PDF Print Trigger
  const handleTriggerPrint = () => {
    const originalTitle = document.title;
    const safeName = (resumeData.personalInfo.fullName || 'Resume').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    document.title = `${safeName}_Resume`;

    window.print();

    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // 12. Run Full AI Analysis on this Resume
  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/builder/analyze', {
        draftId: currentDraftId,
        resumeData,
        targetRole: resumeData.personalInfo.jobTitle,
      });

      if (res.data?.success && res.data.resumeId) {
        toast.success('Resume analyzed successfully!');
        router.push(`/resume/${res.data.resumeId}`);
      } else {
        toast.error('Analysis failed. Please ensure your resume has sufficient content.');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to complete resume analysis.'));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AppShell>
            {/* ─── Global Print Styles ────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
          }

          /* Explicitly HIDE all non-resume application UI chrome */
          aside,
          nav,
          header.lg\\:hidden,
          footer,
          button,
          input,
          textarea,
          select,
          [role="dialog"],
          [data-sonner-toaster],
          .no-print,
          .resume-editor-pane,
          .resume-control-bar,
          .resume-mobile-switcher,
          .preview-toolbar {
            display: none !important;
          }

          /* Reset all ancestor layout containers */
          div[class*="min-h-screen"],
          div[class*="flex-1"],
          main,
          div[class*="max-w-7xl"],
          .resume-builder-container,
          .resume-builder-grid,
          .resume-preview-column,
          .resume-preview-wrapper,
          .resume-canvas-container,
          .resume-scale-wrapper {
            display: block !important;
            position: static !important;
            float: none !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: visible !important;
            transform: none !important;
            top: auto !important;
            left: auto !important;
          }

          /* Format printable resume document for A4 */
          #resume-print-document {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: visible !important;
            transform: none !important;
          }

          /* Prevent unwanted section splitting across page boundaries */
          .break-inside-avoid,
          section,
          .resume-section-item,
          header {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          h1, h2, h3 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      <div className="resume-builder-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Top Control Bar */}
        <div className="resume-control-bar no-print bg-white rounded-2xl border border-[#E7E1D4] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Draft Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8] shrink-0">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Input
                  value={draftTitle}
                  onChange={(e) => {
                    setDraftTitle(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="h-8 font-bold text-sm text-[#171A35] max-w-[260px] border-transparent hover:border-[#E7E1D4] focus:border-[#4F46D8] px-1.5 transition-colors"
                />
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Saved
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[#4F46D8] bg-[#F3F0FC] px-2 py-0.5 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3" />
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#77798B] px-1.5">
                Target: <span className="font-semibold text-[#171A35]">{resumeData.personalInfo.jobTitle || 'General'}</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDraftsModalOpen(true)}
              className="h-8 text-xs font-medium text-[#171A35] flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#4F46D8]" />
              <span>My Resumes</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saveStatus === 'saving'}
              className="h-8 text-xs font-medium text-[#171A35] flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save Draft</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAnalyzeResume}
              disabled={analyzing}
              className="h-8 text-xs font-semibold text-[#4F46D8] border-[#4F46D8]/30 hover:bg-[#F3F0FC] flex items-center gap-1.5"
            >
              {analyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>{analyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="h-8 text-xs font-semibold bg-[#4F46D8] hover:bg-[#4338CA] text-white flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="resume-mobile-switcher no-print flex lg:hidden bg-white p-1 rounded-xl border border-[#E7E1D4]">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'editor'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35]'
            }`}
          >
            ✏️ Edit Content
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'preview'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35]'
            }`}
          >
            📄 Live Preview
          </button>
        </div>

        {/* Main Work Area: 2 Columns on Desktop */}
        <div className="resume-builder-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor */}
          <div className={`resume-editor-pane no-print lg:col-span-6 space-y-4 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-[#171A35] uppercase tracking-wider">
                Resume Content Sections
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDataChange(INITIAL_RESUME_DATA)}
                  className="h-7 text-[11px] text-[#4F46D8] hover:bg-[#F3F0FC]"
                >
                  Load Sample Data
                </Button>
                <span className="text-gray-300">|</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDataChange(EMPTY_RESUME_DATA)}
                  className="h-7 text-[11px] text-gray-500 hover:text-rose-600"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <ResumeEditor
              data={resumeData}
              onChange={handleDataChange}
              onAiAssist={handleTriggerAiAssist}
            />
          </div>

          {/* Right Column: Live Document Preview */}
          <div className={`resume-preview-column lg:col-span-6 sticky top-24 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
            <ResumePreview
              data={resumeData}
              template={template}
              onChangeTemplate={(t) => {
                setTemplate(t);
                setSaveStatus('unsaved');
              }}
              onOpenExport={() => setExportModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AiAssistModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={aiModalTitle}
        type={aiModalType}
        originalText={aiOriginalText}
        suggestedText={aiSuggestedText}
        isLoading={aiLoading}
        onApply={handleApplyAiSuggestion}
        onRetry={() =>
          handleTriggerAiAssist(aiModalType, aiOriginalText, aiContextRef.current)
        }
      />

      <DraftsModal
        isOpen={draftsModalOpen}
        onClose={() => setDraftsModalOpen(false)}
        drafts={savedDrafts}
        currentDraftId={currentDraftId}
        onSelectDraft={handleSelectDraft}
        onCreateNew={handleCreateNew}
        onRenameDraft={handleRenameDraft}
        onDeleteDraft={handleDeleteDraft}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        resumeData={resumeData}
        onTriggerPrint={handleTriggerPrint}
      />
    </AppShell>
  );
}
