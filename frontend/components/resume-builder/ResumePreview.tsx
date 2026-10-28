'use client';

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Printer, Eye, Sparkles, Layout } from 'lucide-react';
import { ResumeBuilderData, TemplateType } from '@/types/builder';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import TechnicalTemplate from './templates/TechnicalTemplate';

interface ResumePreviewProps {
  data: ResumeBuilderData;
  onTemplateChange: (template: TemplateType) => void;
  onPrintPDF: () => void;
}

export default function ResumePreview({ data, onTemplateChange, onPrintPDF }: ResumePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [showA4Guide, setShowA4Guide] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(60, prev - 10));
  const handleResetZoom = () => setZoom(100);

  const renderTemplate = () => {
    switch (data.template) {
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'technical':
        return <TechnicalTemplate data={data} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F0FC]/40 rounded-2xl border border-[#E7E1D4] overflow-hidden">
      {/* Top Preview Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#FFFFFF] border-b border-[#E7E1D4]">
        {/* Template Selector */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F1] p-1 rounded-xl border border-[#E7E1D4]">
          <button
            type="button"
            onClick={() => onTemplateChange('modern')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              data.template === 'modern'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35]'
            }`}
          >
            <span>Modern</span>
          </button>
          <button
            type="button"
            onClick={() => onTemplateChange('classic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              data.template === 'classic'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35]'
            }`}
          >
            <span>Classic</span>
          </button>
          <button
            type="button"
            onClick={() => onTemplateChange('technical')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              data.template === 'technical'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35]'
            }`}
          >
            <span>ATS-Friendly</span>
          </button>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[#FAF8F1] px-2 py-1 rounded-xl border border-[#E7E1D4] text-xs font-medium text-[#77798B]">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:text-[#171A35] rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-[11px] font-semibold text-[#171A35]">{zoom}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:text-[#171A35] rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 hover:text-[#171A35] rounded transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Toggle A4 Guide */}
          <button
            type="button"
            onClick={() => setShowA4Guide(!showA4Guide)}
            className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1 ${
              showA4Guide
                ? 'bg-[#F3F0FC] border-[#4F46D8] text-[#4F46D8]'
                : 'bg-white border-[#E7E1D4] text-[#77798B] hover:text-[#171A35]'
            }`}
            title="Toggle A4 Page Boundary Markers"
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden md:inline">A4 Grid</span>
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={onPrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4F46D8] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Scrollable Document Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-[#FAF8F1]"
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
          }}
          className="relative my-2"
        >
          {/* A4 Sheet Container: Standard A4 ratio (210mm x 297mm ≈ 794px x 1123px) */}
          <div
            id="resume-printable-area"
            className={`w-[794px] min-h-[1123px] bg-white rounded shadow-md border border-[#E7E1D4] transition-shadow relative overflow-hidden ${
              showA4Guide ? 'ring-2 ring-dashed ring-[#4F46D8]/30' : ''
            }`}
          >
            {/* Visual Page Break Marker for Multi-page view guide */}
            {showA4Guide && (
              <div
                className="absolute left-0 right-0 top-[1123px] border-b-2 border-dashed border-red-400 pointer-events-none z-10 flex items-center justify-end px-4"
                title="Approximate A4 Page 1 Boundary"
              >
                <span className="text-[10px] font-bold text-red-500 bg-white/90 px-2 py-0.5 rounded shadow-xs">
                  Page 1 End (A4)
                </span>
              </div>
            )}

            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}
