'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Target,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

const analysisSteps = [
  { label: 'Parsing document...', duration: 1500 },
  { label: 'Analyzing with AI...', duration: 3000 },
  { label: 'Generating insights...', duration: 2000 },
  { label: 'Finalizing report...', duration: 1000 },
];

function ResumeUploadContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role state
  const [targetRole, setTargetRole] = useState('');
  const [roleChecked, setRoleChecked] = useState(false);

  // File & Upload State
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 1: Detect and validate role from URL query param or sessionStorage
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('resumeai_target_role') : null;
    const role = roleParam || storedRole || '';

    if (!role) {
      // Prevent direct access to the upload workflow without a valid role. Redirect to role selection.
      router.replace('/resume/role');
      return;
    }

    setTargetRole(role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('resumeai_target_role', role);
    }
    setRoleChecked(true);
  }, [searchParams, router]);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    const validExts = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'md', 'html', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    if (!validExts.includes(ext) && !selectedFile.type.startsWith('image/')) {
      toast.error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setUploadError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file) {
      toast.error('Please select a resume file');
      return;
    }

    if (!targetRole) {
      toast.error('Please select a target job role first');
      router.push('/resume/role');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(5);
    setCurrentStep(0);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Smooth real-time progress tracker
    const startTime = Date.now();
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        setCurrentStep(0);
        setUploadProgress(5 + (elapsed / 3000) * 20);
      } else if (elapsed < 12000) {
        setCurrentStep(1);
        setUploadProgress(25 + ((elapsed - 3000) / 9000) * 35);
      } else if (elapsed < 22000) {
        setCurrentStep(2);
        setUploadProgress(60 + ((elapsed - 12000) / 10000) * 25);
      } else {
        setCurrentStep(3);
        const slowGlide = 85 + Math.min(10, ((elapsed - 22000) / 15000) * 10);
        setUploadProgress(Math.min(slowGlide, 95));
      }
    }, 200);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole);
      formData.append('provider', provider);

      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal,
        timeout: 85000,
      });

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      if (data.success && data.resume?._id) {
        setCurrentStep(3);
        setUploadProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        toast.success('Resume analyzed successfully!');
        router.push(`/resume/${data.resume._id}`);
      } else {
        throw new Error('Analysis completed but no report was returned.');
      }
    } catch (err: unknown) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsUploading(false);
      setUploadProgress(0);

      const axiosErr = err as {
        name?: string;
        code?: string;
        message?: string;
        response?: { data?: { message?: string } };
      };

      let msg = 'Upload failed. Please try again.';
      if (axiosErr.response?.data?.message) {
        msg = axiosErr.response.data.message;
      } else if (axiosErr.code === 'ECONNABORTED' || axiosErr.name === 'AbortError') {
        msg = 'Request timed out waiting for AI analysis. Please try again.';
      } else if (axiosErr.message) {
        msg = axiosErr.message;
      }

      setUploadError(msg);
      toast.error(msg);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading || !roleChecked) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4F46D8]/20 border-t-[#4F46D8]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#FFFFFF] px-4 py-1.5 rounded-full text-xs font-bold text-[#4F46D8] border border-[#E7E1D4] shadow-xs mb-3">
            <Target className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Step 2 — Resume Upload</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#171A35] mb-2 tracking-tight">
            Upload Your Resume
          </h1>

          <p className="text-sm text-[#77798B] max-w-xl mx-auto">
            Upload your document to generate deep AI insights, ATS scoring, and recruiter improvements tailored to your target position.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs"
        >
          {/* ── TARGET JOB ROLE SECTION ── */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#171A35] mb-2 uppercase tracking-wide">
              Target Job Role
            </label>
            <div className="rounded-xl p-4 bg-[#F3F0FC] border border-[#E7E1D4] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#4F46D8] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#77798B] block">
                    Target Role
                  </span>
                  <p className="text-base font-bold text-[#171A35] truncate">
                    {targetRole}
                  </p>
                </div>
              </div>

              <Link
                id="change-role-btn"
                href={`/resume/role?role=${encodeURIComponent(targetRole)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46D8] hover:text-[#4338CA] bg-[#FFFFFF] px-3.5 py-2 rounded-lg border border-[#E7E1D4] hover:border-[#4F46D8]/50 shadow-xs transition-all flex-shrink-0"
              >
                <span>Change Role</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">

            {/* Error Message */}
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-xs rounded-xl p-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Upload Failed</p>
                  <p className="mt-0.5">{uploadError}</p>
                </div>
              </div>
            )}

            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-[#171A35] mb-2 uppercase tracking-wide">
                Resume Document
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#4F46D8] bg-[#F3F0FC]'
                    : file
                    ? 'border-[#168575] bg-[#168575]/5'
                    : 'border-[#E7E1D4] hover:border-[#4F46D8] bg-[#FAF8F1]'
                }`}
              >
                <input
                  id="resume-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#168575] text-white flex items-center justify-center mb-2 shadow-xs">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#171A35]">{file.name}</p>
                    <p className="text-xs text-[#77798B] mt-1">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-3 text-xs text-[#DC2626] hover:underline font-semibold"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#171A35]">
                      Click to upload or drag &amp; drop your resume
                    </p>
                    <p className="text-xs text-[#77798B] mt-1">PDF, DOCX, TXT up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Engine Selector */}
            <div>
              <label className="block text-xs font-bold text-[#171A35] mb-2 uppercase tracking-wide">
                AI Engine
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setProvider('gemini')}
                  className={`cursor-pointer rounded-xl p-3.5 border text-center transition-all ${
                    provider === 'gemini'
                      ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#4F46D8] font-bold shadow-xs'
                      : 'border-[#E7E1D4] bg-[#FFFFFF] text-[#77798B] hover:border-[#4F46D8]/40'
                  }`}
                >
                  <div className="text-xs font-bold">Google Gemini</div>
                  <div className="text-[10px] text-[#77798B] mt-0.5">High-speed deep analysis</div>
                </div>

                <div
                  onClick={() => setProvider('openai')}
                  className={`cursor-pointer rounded-xl p-3.5 border text-center transition-all ${
                    provider === 'openai'
                      ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#4F46D8] font-bold shadow-xs'
                      : 'border-[#E7E1D4] bg-[#FFFFFF] text-[#77798B] hover:border-[#4F46D8]/40'
                  }`}
                >
                  <div className="text-xs font-bold">OpenAI GPT-4o</div>
                  <div className="text-[10px] text-[#77798B] mt-0.5">Standard analysis</div>
                </div>
              </div>
            </div>

            {/* Progress Bar while uploading */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4 bg-[#F3F0FC] border border-[#E7E1D4]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#171A35]">
                    {analysisSteps[currentStep]?.label || 'Analyzing...'}
                  </span>
                  <span className="text-xs font-bold text-[#4F46D8]">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <div className="w-full bg-[#FFFFFF] rounded-full h-2 overflow-hidden border border-[#E7E1D4]">
                  <motion.div
                    className="h-full bg-[#4F46D8] rounded-full"
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Action */}
            <motion.button
              id="upload-submit"
              type="submit"
              disabled={!file || isUploading || !targetRole}
              whileHover={{ scale: file && !isUploading ? 1.01 : 1 }}
              whileTap={{ scale: file && !isUploading ? 0.99 : 1 }}
              className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-md glow-sm flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume with AI ({Math.round(uploadProgress)}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Analysis</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {!file && (
              <p className="text-center text-[#77798B] text-xs">
                Select a resume file above to enable AI analysis.
              </p>
            )}

          </form>
        </motion.div>
      </div>
    </AppShell>
  );
}

export default function ResumeUploadPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4F46D8]/20 border-t-[#4F46D8]" />
          </div>
        </AppShell>
      }
    >
      <ResumeUploadContent />
    </Suspense>
  );
}
