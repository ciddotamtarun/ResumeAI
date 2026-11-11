'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AiAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'improve-summary' | 'polish-bullet' | 'suggest-skills' | 'grammar-fix';
  originalText: string;
  suggestedText: string | string[];
  isLoading: boolean;
  onApply: (appliedText: string | string[]) => void;
  onRetry: () => void;
}

export default function AiAssistModal({
  isOpen,
  onClose,
  title,
  type,
  originalText,
  suggestedText,
  isLoading,
  onApply,
  onRetry,
}: AiAssistModalProps) {
  if (!isOpen) return null;

  const isSkillList = type === 'suggest-skills' && Array.isArray(suggestedText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1D4] bg-[#FAF8F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">{title}</h3>
              <p className="text-[11px] text-[#77798B]">AI suggestions based on professional hiring standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77798B] hover:text-[#171A35] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#4F46D8] animate-spin" />
              <p className="text-sm font-medium text-[#171A35]">Crafting high-impact suggestion...</p>
              <p className="text-xs text-[#77798B]">Ensuring adherence to XYZ impact formulas</p>
            </div>
          ) : (
            <>
              {/* Original snippet */}
              {originalText && (
                <div>
                  <div className="text-[11px] font-bold text-[#77798B] uppercase tracking-wider mb-1">
                    Current Version
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 italic">
                    "{originalText}"
                  </div>
                </div>
              )}

              {/* AI Suggestion */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] font-bold text-[#4F46D8] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended Improvement
                  </div>
                </div>

                {isSkillList ? (
                  <div className="p-4 bg-[#F3F0FC]/60 rounded-xl border border-[#4F46D8]/20 space-y-2">
                    <p className="text-xs text-[#171A35] font-medium">Suggested technical & soft skills:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(suggestedText as string[]).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-[#4F46D8]/30 text-[#4F46D8] px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F3F0FC]/60 rounded-xl border border-[#4F46D8]/20 text-xs leading-relaxed text-[#171A35] font-medium">
                    {typeof suggestedText === 'string' ? suggestedText : ''}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  AI never invents false employers, degrees, or unverifiable numbers. Always review content for accuracy before applying.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7E1D4] bg-[#FAF8F1]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isLoading || !suggestedText}
              onClick={() => {
                onApply(suggestedText);
                onClose();
              }}
              className="bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-medium flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply to Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
