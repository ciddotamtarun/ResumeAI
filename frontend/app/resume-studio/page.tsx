'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Brain,
  Star,
  TrendingUp,
  Tag,
  Briefcase,
  Mic,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume, ResumeImprovement } from '@/types';
import { formatDate, formatRelativeTime, getScoreColor, getScoreLabel } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

const POPULAR_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'Software Engineer',
  'Mobile Developer',
];

export default function ResumeStudioPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'upload'>('view');
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume');
      const list: Resume[] = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
      } else {
        setActiveTab('upload');
      }
    } catch (err: any) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
  }, [isAuthenticated, fetchResumes]);

  const selectedResume = resumes.find((r) => r._id === selectedResumeId) || resumes[0];

  // File drop handler
  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      toast.error('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a resume file');
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole);
      formData.append('provider', provider);

      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      toast.success('Resume analyzed successfully!');
      const newResume = res.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResumeId(newResume._id);
      setActiveTab('view');
      setFile(null);
    } catch (err: any) {
      clearInterval(progressTimer);
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      toast.error(`Upload error: ${msg}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading || loading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4F46D8]/20 border-t-[#4F46D8]" />
        </div>
      </AppShell>
    );
  }

  const analysis = selectedResume?.analysis;

  return (
    <AppShell>
      {/* ─── Header & Top Controls ────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">Resume Studio</span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            AI Resume Analyzer & Studio
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Audit formatting, ATS compatibility, keywords, and structural quality
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1 rounded-xl border border-[#E7E1D4] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('view')}
            disabled={resumes.length === 0}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'view'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35] disabled:opacity-40'
            }`}
          >
            Review Analysis
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-[#4F46D8] text-white shadow-xs'
                : 'text-[#77798B] hover:text-[#171A35]'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* ─── UPLOAD VIEW ──────────────────────────────────────────────────── */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto py-4">
          <div className="rounded-2xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
            <h2 className="text-xl font-bold font-['Outfit'] text-[#171A35] mb-2">
              Upload Resume for AI Evaluation
            </h2>
            <p className="text-xs text-[#77798B] mb-6">
              Supported formats: PDF, DOCX, TXT (up to 10MB). Text extraction is fully verified.
            </p>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-[#168575] bg-[#168575]/5'
                    : 'border-[#E7E1D4] hover:border-[#4F46D8] bg-[#FAF8F1]'
                }`}
              >
                <input
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
                    <p className="text-xs text-[#77798B] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
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
                      Click to upload or drag & drop your resume
                    </p>
                    <p className="text-xs text-[#77798B] mt-1">PDF, DOCX, TXT up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Target Role input & popular tags */}
              <div>
                <label className="block text-xs font-bold text-[#171A35] mb-2 uppercase tracking-wide">
                  Target Job Role (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Data Scientist..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] text-sm text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {POPULAR_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        targetRole === role
                          ? 'bg-[#4F46D8] text-white border-[#4F46D8]'
                          : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4] hover:text-[#171A35]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Provider selector */}
              <div>
                <label className="block text-xs font-bold text-[#171A35] mb-2 uppercase tracking-wide">
                  AI Engine
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setProvider('gemini')}
                    className={`cursor-pointer rounded-xl p-3 border text-center transition-all ${
                      provider === 'gemini'
                        ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#4F46D8] font-bold'
                        : 'border-[#E7E1D4] bg-[#FFFFFF] text-[#77798B]'
                    }`}
                  >
                    <div className="text-xs font-bold">Google Gemini</div>
                    <div className="text-[10px] text-[#77798B]">High-speed deep analysis</div>
                  </div>
                  <div
                    onClick={() => setProvider('openai')}
                    className={`cursor-pointer rounded-xl p-3 border text-center transition-all ${
                      provider === 'openai'
                        ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#4F46D8] font-bold'
                        : 'border-[#E7E1D4] bg-[#FFFFFF] text-[#77798B]'
                    }`}
                  >
                    <div className="text-xs font-bold">OpenAI GPT-4o</div>
                    <div className="text-[10px] text-[#77798B]">Standard analysis</div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Resume with AI ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── ANALYSIS REVIEW VIEW ─────────────────────────────────────────── */}
      {activeTab === 'view' && selectedResume && (
        <div className="space-y-6">
          {/* Active Resume Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] p-3 sm:p-4 rounded-2xl border border-[#E7E1D4]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#171A35] truncate">
                    {selectedResume.fileName}
                  </span>
                  {selectedResume.targetRole && (
                    <span className="text-[10px] bg-[#F3F0FC] text-[#4F46D8] font-semibold px-2 py-0.5 rounded-md">
                      {selectedResume.targetRole}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#77798B] mt-0.5">
                  <span>Uploaded {formatDate(selectedResume.createdAt)}</span>
                  <span>•</span>
                  <span>Engine: {selectedResume.aiProvider || 'Gemini'}</span>
                </div>
              </div>
            </div>

            {/* Switch resume dropdown if multiple */}
            {resumes.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#77798B]">Switch Resume:</span>
                <select
                  value={selectedResumeId || ''}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="text-xs font-semibold bg-[#FAF8F1] border border-[#E7E1D4] rounded-lg px-2.5 py-1.5 text-[#171A35]"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} ({r.analysis?.overallScore || 0} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl font-['Outfit'] shadow-xs"
                style={{
                  background: `${getScoreColor(analysis?.overallScore || 0)}15`,
                  color: getScoreColor(analysis?.overallScore || 0),
                }}
              >
                {analysis?.overallScore || 0}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#77798B] uppercase tracking-wider">
                  Overall Score
                </p>
                <p className="text-base font-bold text-[#171A35]">
                  {getScoreLabel(analysis?.overallScore || 0)}
                </p>
                <p className="text-[11px] text-[#77798B] mt-0.5">Weighted rubric rating</p>
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#168575]/15 text-[#168575] flex items-center justify-center font-black text-xl font-['Outfit'] shadow-xs">
                {analysis?.atsCompatibility || 0}%
              </div>
              <div>
                <p className="text-xs font-semibold text-[#77798B] uppercase tracking-wider">
                  ATS Compatibility
                </p>
                <p className="text-base font-bold text-[#171A35]">
                  {(analysis?.atsCompatibility || 0) >= 75 ? 'ATS Optimized' : 'Needs Optimization'}
                </p>
                <p className="text-[11px] text-[#77798B] mt-0.5">Machine parser readability</p>
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4F46D8]/15 text-[#4F46D8] flex items-center justify-center font-black text-xl font-['Outfit'] shadow-xs">
                {analysis?.keywords?.length || 0}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#77798B] uppercase tracking-wider">
                  Identified Skills
                </p>
                <p className="text-base font-bold text-[#171A35]">
                  Keywords Extracted
                </p>
                <p className="text-[11px] text-[#77798B] mt-0.5">Ready for SkillProof testing</p>
              </div>
            </div>
          </div>

          {/* Quick Workflow Action Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/job-matcher" className="block">
              <div className="rounded-xl p-3 bg-[#FFFFFF] border border-[#E7E1D4] hover:border-[#4F46D8] flex items-center justify-between text-xs font-bold text-[#171A35] transition-all">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#4F46D8]" />
                  <span>Match Against Job Description</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#77798B]" />
              </div>
            </Link>
            <Link href="/skillproof" className="block">
              <div className="rounded-xl p-3 bg-[#FFFFFF] border border-[#E7E1D4] hover:border-[#168575] flex items-center justify-between text-xs font-bold text-[#171A35] transition-all">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#168575]" />
                  <span>Take SkillProof Assessment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#77798B]" />
              </div>
            </Link>
            <Link href="/interview" className="block">
              <div className="rounded-xl p-3 bg-[#FFFFFF] border border-[#E7E1D4] hover:border-[#B7791F] flex items-center justify-between text-xs font-bold text-[#171A35] transition-all">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#B7791F]" />
                  <span>Practice Role Mock Interview</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#77798B]" />
              </div>
            </Link>
          </div>

          {/* Section Score Breakdown & Extracted Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section Scores */}
            <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
              <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] mb-4">
                Section-by-Section Quality Audit
              </h3>
              {analysis?.sections ? (
                <div className="space-y-4">
                  {Object.entries(analysis.sections).map(([sectionName, sec]: [string, any]) => {
                    const secScore = sec.score || 0;
                    const secColor = getScoreColor(secScore);
                    return (
                      <div key={sectionName} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#171A35] capitalize">
                            {sectionName}
                          </span>
                          <span className="font-extrabold" style={{ color: secColor }}>
                            {secScore} / 100
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#FAF8F1] overflow-hidden border border-[#E7E1D4]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${secScore}%`, backgroundColor: secColor }}
                          />
                        </div>
                        {sec.feedback && sec.feedback.length > 0 && (
                          <p className="text-[11px] text-[#77798B] line-clamp-1 italic">
                            • {sec.feedback[0]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#77798B]">Section analysis details unavailable.</p>
              )}
            </div>

            {/* Extracted Skills & Keywords */}
            <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold font-['Outfit'] text-[#171A35]">
                    Extracted Skills & Competencies
                  </h3>
                  <span className="text-xs text-[#77798B]">
                    {analysis?.keywords?.length || 0} skills detected
                  </span>
                </div>
                <p className="text-xs text-[#77798B] mb-4">
                  These skills were identified by parsing your resume text. Verify them in SkillProof to prove technical competence.
                </p>

                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                  {analysis?.keywords && analysis.keywords.length > 0 ? (
                    analysis.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F1] border border-[#E7E1D4] text-xs font-semibold text-[#171A35]"
                      >
                        <Tag className="w-3 h-3 text-[#4F46D8]" />
                        <span>{kw}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-[#77798B]">No keywords extracted.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7E1D4] flex items-center justify-between">
                <span className="text-xs text-[#77798B]">Want to verify these skills?</span>
                <Link href="/skillproof">
                  <button className="text-xs font-bold text-[#4F46D8] hover:underline flex items-center gap-1">
                    <span>Open SkillProof Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* AI Recommended Improvements (Original vs Suggested) */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-[#171A35]">
                  Targeted Bullet Point Improvements
                </h3>
                <p className="text-xs text-[#77798B]">
                  High-impact rewrites with quantified action verbs for maximum recruiter appeal
                </p>
              </div>
            </div>

            {selectedResume.improvements && selectedResume.improvements.length > 0 ? (
              <div className="space-y-4">
                {selectedResume.improvements.map((imp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-[#4F46D8] uppercase tracking-wide">
                      <span>Section: {imp.section}</span>
                      <span className="text-[10px] text-[#77798B]">Improvement #{idx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E7E1D4]/80 text-[#77798B]">
                        <span className="font-bold text-[#DC2626] block mb-1">Original Draft:</span>
                        <p>{imp.original}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#168575]/40 text-[#171A35]">
                        <span className="font-bold text-[#168575] block mb-1">
                          Suggested High-Impact Version:
                        </span>
                        <p className="font-medium">{imp.suggested}</p>
                      </div>
                    </div>

                    {imp.reason && (
                      <p className="text-[11px] text-[#77798B] pt-1">
                        <strong className="text-[#171A35]">Why this matters:</strong> {imp.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#77798B]">No specific line improvements found.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
