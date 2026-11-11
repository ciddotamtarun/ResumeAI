'use client';

import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRelativeTime } from '@/lib/utils';
import { ResumeDraft } from '@/types/builder';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: ResumeDraft[];
  currentDraftId: string | null;
  onSelectDraft: (draftId: string) => void;
  onCreateNew: () => void;
  onRenameDraft: (draftId: string, newTitle: string) => Promise<void>;
  onDeleteDraft: (draftId: string) => Promise<void>;
}

export default function DraftsModal({
  isOpen,
  onClose,
  drafts,
  currentDraftId,
  onSelectDraft,
  onCreateNew,
  onRenameDraft,
  onDeleteDraft,
}: DraftsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleStartRename = (draft: ResumeDraft) => {
    setEditingId(draft._id);
    setEditingTitle(draft.title);
  };

  const handleSaveRename = async (draftId: string) => {
    if (!editingTitle.trim()) return;
    await onRenameDraft(draftId, editingTitle.trim());
    setEditingId(null);
  };

  const handleDelete = async (draftId: string) => {
    setIsDeleting(true);
    try {
      await onDeleteDraft(draftId);
      setDeleteConfirmId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1D4] bg-[#FAF8F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">My Resume Drafts</h3>
              <p className="text-[11px] text-[#77798B]">Switch between drafts or create a new version</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77798B] hover:text-[#171A35] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {drafts.length === 0 ? (
            <div className="py-8 text-center text-[#77798B] space-y-2">
              <FileText className="w-8 h-8 mx-auto text-[#77798B]/50" />
              <p className="text-xs">No saved drafts found.</p>
              <p className="text-[11px] text-[#77798B]/80">Create a new resume to get started.</p>
            </div>
          ) : (
            drafts.map((draft) => {
              const isActive = draft._id === currentDraftId;
              const isRenaming = editingId === draft._id;
              const isConfirmingDelete = deleteConfirmId === draft._id;

              return (
                <div
                  key={draft._id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                    isActive
                      ? 'bg-[#F3F0FC]/70 border-[#4F46D8]'
                      : 'bg-white border-[#E7E1D4] hover:border-[#4F46D8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-8 text-xs font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(draft._id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-emerald-600"
                            onClick={() => handleSaveRename(draft._id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#171A35] truncate">
                            {draft.title || 'Untitled Resume'}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold uppercase bg-[#4F46D8] text-white px-1.5 py-0.2 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-[#77798B] mt-1">
                        <span className="capitalize">{draft.template} Template</span>
                        {draft.updatedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(draft.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isRenaming && !isConfirmingDelete && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartRename(draft)}
                          title="Rename"
                          className="h-7 w-7 p-0 text-[#77798B] hover:text-[#171A35]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(draft._id)}
                          title="Delete"
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        {!isActive && (
                          <Button
                            size="sm"
                            onClick={() => {
                              onSelectDraft(draft._id);
                              onClose();
                            }}
                            className="h-7 text-xs bg-[#4F46D8] hover:bg-[#4338CA] text-white px-2.5"
                          >
                            Open
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete Confirmation Bar */}
                  {isConfirmingDelete && (
                    <div className="flex items-center justify-between p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 mt-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Delete this resume permanently?</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(null)}
                          className="h-6 text-[11px] px-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDelete(draft._id)}
                          className="h-6 text-[11px] bg-rose-600 hover:bg-rose-700 text-white px-2.5"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7E1D4] bg-[#FAF8F1]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-medium flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
