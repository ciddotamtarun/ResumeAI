'use client';

import React, { useState } from 'react';
import { Download, Printer, Copy, Check, FileJson, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types/builder';
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

  if (!isOpen) return null;

  const candidateName = resumeData.personalInfo?.fullName || 'Candidate';
  const safeFileName = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume`;

  const handleCopyPlainText = () => {
    const lines: string[] = [];
    const p = resumeData.personalInfo || {};
    if (p.fullName) lines.push(p.fullName.toUpperCase());
    if (p.jobTitle) lines.push(p.jobTitle);
    lines.push([p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean).join(' | '));
    lines.push('\n--- SUMMARY ---\n' + (resumeData.summary || ''));

    if (resumeData.experience?.length) {
      lines.push('\n--- EXPERIENCE ---');
      resumeData.experience.forEach((e) => {
        lines.push(`${e.title} @ ${e.company} (${e.startDate} - ${e.current ? 'Present' : e.endDate})`);
        if (e.bullets?.length) e.bullets.forEach((b) => lines.push(`• ${b}`));
      });
    }

    if (resumeData.projects?.length) {
      lines.push('\n--- PROJECTS ---');
      resumeData.projects.forEach((proj) => {
        lines.push(`${proj.title}${proj.technologies?.length ? ` [${proj.technologies.join(', ')}]` : ''}`);
        if (proj.description) lines.push(proj.description);
        if (proj.bullets?.length) proj.bullets.forEach((b) => lines.push(`• ${b}`));
      });
    }

    if (resumeData.education?.length) {
      lines.push('\n--- EDUCATION ---');
      resumeData.education.forEach((edu) => {
        lines.push(`${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startDate} - ${edu.endDate})`);
      });
    }

    const tech = resumeData.skills?.technical?.map((s) => s.name).join(', ');
    if (tech) lines.push(`\n--- SKILLS ---\nTechnical: ${tech}`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    toast.success('Plain text resume copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON draft backup downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
            className="p-1 rounded-lg text-[#77798B] hover:text-[#171A35] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Action: PDF Print */}
          <div className="p-4 rounded-xl border-2 border-[#4F46D8]/30 bg-[#F3F0FC]/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#171A35]">Download as A4 PDF</h4>
                <p className="text-xs text-[#77798B] mt-0.5">
                  Suggested Filename: <span className="font-mono text-[#4F46D8]">{safeFileName}.pdf</span>
                </p>
              </div>
              <Printer className="w-5 h-5 text-[#4F46D8]" />
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-[#E7E1D4] text-[11px] text-[#77798B]">
              <Info className="w-4 h-4 text-[#4F46D8] shrink-0 mt-0.5" />
              <span>
                In the print window, select <strong>"Save as PDF"</strong> as the Destination. For best quality, set Margins to <strong>Default</strong> and enable <strong>"Background graphics"</strong>.
              </span>
            </div>

            <Button
              type="button"
              onClick={() => {
                onTriggerPrint();
                onClose();
              }}
              className="w-full bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Open PDF Print Dialog
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-[#77798B] uppercase tracking-wider">
              Alternative Formats
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
