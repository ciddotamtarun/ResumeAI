'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  FileText,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { ResumeBuilderData, ResumeDraftMeta } from '@/types/builder';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface DraftManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDraftId: string;
  drafts: ResumeBuilderData[];
  onSelectDraft: (draftId: string) => void;
  onCreateNewDraft: (useSample?: boolean) => void;
  onRenameDraft: (draftId: string, newTitle: string) => void;
  onDuplicateDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
}

export default function DraftManagerModal({
  isOpen,
  onClose,
  currentDraftId,
  drafts,
  onSelectDraft,
  onCreateNewDraft,
  onRenameDraft,
  onDuplicateDraft,
  onDeleteDraft,
}: DraftManagerModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const startRename = (draft: ResumeBuilderData) => {
    setEditingId(draft.id);
    setEditingTitle(draft.title);
  };

  const saveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameDraft(id, editingTitle.trim());
      toast.success('Resume renamed');
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E7E1D4] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E1D4] bg-[#FAF8F1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#4F46D8] text-white flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Resume Drafts Manager</h3>
              <p className="text-[11px] text-[#77798B]">Switch between drafts or create multiple tailored resumes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#77798B] hover:text-[#171A35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar inside modal */}
        <div className="px-5 py-3 bg-[#FAF8F1]/60 border-b border-[#E7E1D4] flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#171A35]">
            Saved Resumes ({drafts.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onCreateNewDraft(true);
                onClose();
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-xl border border-[#4F46D8]/30 bg-[#F3F0FC] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Sample Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onCreateNewDraft(false);
                onClose();
              }}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Blank Resume</span>
            </button>
          </div>
        </div>

        {/* Drafts List */}
        <div className="p-5 space-y-2.5 overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-[#77798B] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[#77798B]">No drafts found. Create your first resume draft above!</p>
            </div>
          ) : (
            drafts.map((draft) => {
              const isCurrent = draft.id === currentDraftId;
              const isDeleting = confirmDeleteId === draft.id;

              return (
                <div
                  key={draft.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-[#F3F0FC]/60 border-[#4F46D8]'
                      : 'bg-[#FAF8F1]/60 border-[#E7E1D4] hover:border-[#4F46D8]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Info or Rename Input */}
                    <div className="flex-1 min-w-0">
                      {editingId === draft.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRename(draft.id)}
                            autoFocus
                            className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-[#4F46D8] text-[#171A35]"
                          />
                          <button
                            type="button"
                            onClick={() => saveRename(draft.id)}
                            className="p-1 text-[#168575] hover:bg-white rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-[#77798B] hover:bg-white rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#171A35] truncate">
                              {draft.title || 'Untitled Resume'}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#4F46D8] text-white">
                                Active
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-semibold text-[#77798B] bg-white px-1.5 py-0.2 rounded border border-[#E7E1D4]">
                              {draft.template}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-[#77798B] mt-1">
                            <span>
                              {draft.contact.fullName || 'No name'} •{' '}
                              {draft.experience.length} job{draft.experience.length !== 1 ? 's' : ''}
                            </span>
                            <span>•</span>
                            <span>
                              Saved {formatRelativeTime(draft.updatedAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDraft(draft.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E7E1D4] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-colors"
                        >
                          Open
                        </button>
                      )}

                      {/* Rename */}
                      <button
                        type="button"
                        onClick={() => startRename(draft)}
                        className="p-1.5 text-[#77798B] hover:text-[#171A35] rounded-lg hover:bg-white transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => onDuplicateDraft(draft.id)}
                        className="p-1.5 text-[#77798B] hover:text-[#171A35] rounded-lg hover:bg-white transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                          <span className="text-[10px] text-red-600 font-medium">Delete?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteDraft(draft.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 bg-gray-200 text-[#171A35] text-[10px] rounded"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={drafts.length <= 1}
                          onClick={() => setConfirmDeleteId(draft.id)}
                          className="p-1.5 text-[#77798B] hover:text-red-600 rounded-lg hover:bg-white transition-colors disabled:opacity-30"
                          title="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E7E1D4] bg-[#FAF8F1] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#E7E1D4] text-[#171A35] hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
