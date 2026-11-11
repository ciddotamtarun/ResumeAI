'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutTemplate,
  Printer,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeData, TemplateType } from '@/types/builder';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import TechnicalTemplate from './templates/TechnicalTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateType;
  onChangeTemplate: (t: TemplateType) => void;
  onOpenExport: () => void;
}

export default function ResumePreview({
  data,
  template,
  onChangeTemplate,
  onOpenExport,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(75);
  const [docHeight, setDocHeight] = useState(1123);
  const [autoFitted, setAutoFitted] = useState(false);

  // Measure rendered document height whenever content or template changes
  useEffect(() => {
    const updateHeight = () => {
      if (docRef.current) {
        const height = docRef.current.scrollHeight;
        if (height > 0) {
          setDocHeight(height);
        }
      }
    };

    updateHeight();
    const timer = setTimeout(updateHeight, 200);
    return () => clearTimeout(timer);
  }, [data, template]);

  // Compute the optimal zoom percentage that fits the container cleanly without horizontal clipping
  const computeFitZoom = () => {
    if (!containerRef.current) return 70;
    // Available width minus container padding (e.g. 48px)
    const availableWidth = containerRef.current.clientWidth - 48;
    if (availableWidth <= 0) return 70;
    const standardA4WidthPx = 794; // 210mm at 96 DPI
    const computed = Math.min(100, Math.max(40, Math.floor((availableWidth / standardA4WidthPx) * 100)));
    return computed;
  };

  // Auto-fit on initial mount and when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (!autoFitted) {
        setZoom(computeFitZoom());
        setAutoFitted(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFitted]);

  const handleFitToWidth = () => {
    setZoom(computeFitZoom());
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 40));
  const handleResetZoom = () => setZoom(100);

  // Standard A4 height is ~1123px at 96 DPI (297mm)
  const pageCount = Math.max(1, Math.ceil(docHeight / 1123));

  return (
    <div className="resume-preview-wrapper flex flex-col h-full space-y-3">
      {/* Top Preview Controls Bar */}
      <div className="preview-toolbar no-print bg-white rounded-2xl border border-[#E7E1D4] p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Template Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-[#77798B] uppercase tracking-wider hidden sm:inline mr-1">
            Template:
          </span>
          <button
            type="button"
            onClick={() => onChangeTemplate('classic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              template === 'classic'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'bg-[#F3F0FC]/60 text-[#77798B] hover:text-[#171A35] hover:bg-[#F3F0FC]'
            }`}
          >
            Classic Professional
          </button>
          <button
            type="button"
            onClick={() => onChangeTemplate('modern')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              template === 'modern'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'bg-[#F3F0FC]/60 text-[#77798B] hover:text-[#171A35] hover:bg-[#F3F0FC]'
            }`}
          >
            Modern Minimal
          </button>
          <button
            type="button"
            onClick={() => onChangeTemplate('technical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              template === 'technical'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'bg-[#F3F0FC]/60 text-[#77798B] hover:text-[#171A35] hover:bg-[#F3F0FC]'
            }`}
          >
            ATS-Friendly
          </button>
        </div>

        {/* Zoom & Page Count & Export Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Page Count Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
            <Layers className="w-3 h-3 text-[#4F46D8]" />
            <span>{pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</span>
          </span>

          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-gray-600 hover:text-black rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-medium text-gray-700 px-1.5 min-w-[34px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-gray-600 hover:text-black rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitToWidth}
              className="px-1.5 py-0.5 text-[10px] font-medium text-[#4F46D8] hover:bg-white rounded transition-colors"
              title="Fit to Container Width"
            >
              Fit
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onOpenExport}
            className="h-8 text-xs bg-[#4F46D8] hover:bg-[#4338CA] text-white flex items-center gap-1.5 shadow-xs px-3"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Live Document Canvas */}
      <div
        ref={containerRef}
        className="resume-canvas-container flex-1 bg-stone-100/80 rounded-2xl border border-[#E7E1D4] p-4 sm:p-6 overflow-y-auto overflow-x-auto max-h-[calc(100vh-175px)] flex justify-center"
      >
        <div
          className="resume-scale-wrapper flex justify-center shrink-0"
          style={{
            width: `${Math.round(794 * (zoom / 100))}px`,
            minHeight: `${Math.round(Math.max(1123, docHeight) * (zoom / 100))}px`,
            transition: 'width 0.15s ease, min-height 0.15s ease',
          }}
        >
          {/* Printable A4 Container */}
          <div
            id="resume-print-document"
            ref={docRef}
            style={{
              width: '794px',
              minHeight: '1123px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            className="bg-white text-gray-900 shadow-xl rounded-sm border border-gray-300 relative overflow-visible"
          >
            {/* Visual Page Break Lines for Multi-Page Preview (Screen only) */}
            {pageCount > 1 &&
              Array.from({ length: pageCount - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="no-print absolute left-0 right-0 border-b-2 border-dashed border-[#4F46D8]/40 pointer-events-none z-10 flex items-center justify-end pr-4"
                  style={{ top: `${(i + 1) * 1123}px` }}
                >
                  <span className="text-[10px] font-semibold text-[#4F46D8] bg-[#F3F0FC] px-2 py-0.5 rounded shadow-xs border border-[#4F46D8]/20">
                    Page Break (Page {i + 1} ➔ Page {i + 2})
                  </span>
                </div>
              ))}

            {template === 'classic' && <ClassicTemplate data={data} />}
            {template === 'modern' && <ModernTemplate data={data} />}
            {template === 'technical' && <TechnicalTemplate data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
}
