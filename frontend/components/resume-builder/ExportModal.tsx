'use client';

import React, { useState } from 'react';
import { Download, Printer, Copy, Check, FileJson, X, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResumeData } from '@/types/builder';
import { normalizeResumeData, resumeToPlainText } from '@/lib/builder-defaults';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onTriggerPrint: () => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  resumeData,
  onTriggerPrint,
}: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const rawCandidateName = resumeData?.personalInfo?.fullName;
  const candidateName = typeof rawCandidateName === 'string' ? rawCandidateName.trim() || 'Candidate' : 'Candidate';
  const safeFileName = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Candidate'}_Resume`;

  // 1. Direct PDF Download using html2pdf.js with native A4 scaling
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating high-resolution PDF...');

    try {
      const normalizedData = normalizeResumeData(resumeData);
      const pdfName = normalizedData.personalInfo.fullName.trim() || 'Candidate';
      const pdfFileName = `${pdfName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Candidate'}_Resume.pdf`;
      const originalElement = document.getElementById('resume-print-document');
      if (!originalElement) {
        throw new Error('Resume preview element not found.');
      }

      // Wait for web fonts to finish rendering
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Dynamically load html2pdf.js on client
      const { default: html2pdf } = await import('html2pdf.js');

      const opt = {
        margin: 0,
        filename: pdfFileName,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2, // 2x resolution for retina-sharp text and graphics
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0,
          onclone: (clonedDoc: Document) => {
            const docEl = clonedDoc.getElementById('resume-print-document');
            if (docEl) {
              docEl.style.transform = 'none';
              docEl.style.margin = '0 auto';
              docEl.style.boxShadow = 'none';
              docEl.style.border = 'none';
            }
            // Strip screen-only page breaks
            clonedDoc.querySelectorAll('.no-print').forEach((el) => el.remove());
          },
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: ['.break-inside-avoid', '.resume-entry-item'],
        },
      };

      await html2pdf().set(opt).from(originalElement).save();

      toast.success('PDF downloaded successfully!', { id: toastId });
      onClose();
    } catch (error: unknown) {
      console.error('Direct PDF export error:', error);
      const message = error instanceof Error ? error.message : 'Unknown PDF generation error.';
      toast.error(`Could not generate the PDF: ${message}. You can try Browser Print instead.`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Copy Plain Text
  const handleCopyPlainText = async () => {
    try {
      const normalizedData = normalizeResumeData(resumeData);
      const plainText = resumeToPlainText(normalizedData);
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.');
      }
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast.success('Plain text resume copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error: unknown) {
      console.error('Copy resume text error:', error);
      const message = error instanceof Error ? error.message : 'Unknown clipboard error.';
      toast.error(`Could not copy the resume: ${message}`);
    }
  };

  // 3. Download JSON
  const handleDownloadJSON = () => {
    try {
      const normalizedData = normalizeResumeData(resumeData);
      const blob = new Blob([JSON.stringify(normalizedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeFileName}.json`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('JSON draft backup downloaded!');
    } catch (error: unknown) {
      console.error('JSON resume export error:', error);
      const message = error instanceof Error ? error.message : 'Unknown JSON export error.';
      toast.error(`Could not download the JSON backup: ${message}`);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#E7E1D4] shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1D4] bg-[#FAF8F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Export Resume</h3>
              <p className="text-[11px] text-[#77798B]">Export high-resolution PDF or copy plain text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded-lg text-[#77798B] hover:text-[#171A35] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Action 1: Direct PDF Download */}
          <div className="p-4 rounded-xl border-2 border-[#4F46D8]/30 bg-[#F3F0FC]/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[#171A35]">Download PDF File</h4>
                  <span className="text-[10px] font-semibold text-[#4F46D8] bg-[#F3F0FC] px-1.5 py-0.5 rounded border border-[#4F46D8]/20">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#77798B] mt-0.5">
                  Direct A4 download: <span className="font-mono text-[#4F46D8] font-medium">{safeFileName}.pdf</span>
                </p>
              </div>
              <Download className="w-5 h-5 text-[#4F46D8]" />
            </div>

            <Button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="w-full bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating High-Res PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </>
              )}
            </Button>
          </div>

          {/* Main Action 2: Browser Print / Save as PDF */}
          <div className="p-4 rounded-xl border border-[#E7E1D4] bg-stone-50/60 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#171A35]">Browser Print / Save as PDF</h4>
                <p className="text-xs text-[#77798B] mt-0.5">
                  Open browser print preview with native vector text
                </p>
              </div>
              <Printer className="w-5 h-5 text-gray-700" />
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-[#E7E1D4] text-[11px] text-[#77798B]">
              <Info className="w-4 h-4 text-[#4F46D8] shrink-0 mt-0.5" />
              <span>
                In the print preview, select <strong>&quot;Save as PDF&quot;</strong> as Destination. Margins: <strong>Default</strong>, and enable <strong>&quot;Background graphics&quot;</strong>.
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isGenerating}
              onClick={() => {
                onTriggerPrint();
                onClose();
              }}
              className="w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2 border-[#E7E1D4] hover:bg-[#F3F0FC] text-[#171A35]"
            >
              <Printer className="w-4 h-4 text-[#4F46D8]" />
              <span>Open Print Preview (Ctrl+P)</span>
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-[#77798B] uppercase tracking-wider">
              Alternative Formats
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGenerating}
                onClick={handleCopyPlainText}
                className="text-xs flex items-center justify-center gap-1.5 h-9"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Plaintext'}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGenerating}
                onClick={handleDownloadJSON}
                className="text-xs flex items-center justify-center gap-1.5 h-9"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Save JSON</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-[#E7E1D4] bg-[#FAF8F1]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isGenerating}
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
