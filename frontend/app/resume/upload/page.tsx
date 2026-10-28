'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Briefcase,
  Code2,
  BarChart2,
  Palette,
  PenTool,
  Shield,
  Smartphone,
  Database,
  Cloud,
  TestTube,
  Settings,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BookOpen,
  Edit3,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

// ─── Role Definitions ──────────────────────────────────────────────────────────

const ROLE_CATEGORIES = [
  {
    category: '💻 Technology',
    roles: [
      { label: 'Frontend Developer', icon: Code2, color: 'from-blue-500 to-cyan-500' },
      { label: 'Backend Developer', icon: Database, color: 'from-green-500 to-emerald-500' },
      { label: 'Full Stack Developer', icon: Code2, color: 'from-indigo-500 to-purple-500' },
      { label: 'Data Scientist', icon: BarChart2, color: 'from-violet-500 to-purple-600' },
      { label: 'ML / AI Engineer', icon: Settings, color: 'from-pink-500 to-rose-500' },
      { label: 'DevOps Engineer', icon: Cloud, color: 'from-orange-500 to-amber-500' },
      { label: 'Mobile Developer', icon: Smartphone, color: 'from-teal-500 to-cyan-600' },
      { label: 'QA / Test Engineer', icon: TestTube, color: 'from-lime-500 to-green-500' },
      { label: 'Cybersecurity', icon: Shield, color: 'from-red-500 to-rose-600' },
      { label: 'Product Manager', icon: Target, color: 'from-amber-500 to-yellow-500' },
    ],
  },
  {
    category: '📊 Business & Finance',
    roles: [
      { label: 'Business Analyst', icon: BarChart2, color: 'from-blue-600 to-indigo-600' },
      { label: 'Financial Analyst', icon: DollarSign, color: 'from-emerald-600 to-teal-600' },
      { label: 'Marketing Manager', icon: TrendingUp, color: 'from-pink-600 to-fuchsia-600' },
      { label: 'Sales Executive', icon: ShoppingCart, color: 'from-orange-500 to-red-500' },
      { label: 'HR Manager', icon: Users, color: 'from-violet-500 to-indigo-500' },
      { label: 'Operations Manager', icon: Settings, color: 'from-slate-500 to-gray-600' },
      { label: 'Project Manager', icon: Briefcase, color: 'from-cyan-500 to-blue-500' },
      { label: 'Accountant', icon: DollarSign, color: 'from-green-600 to-emerald-700' },
    ],
  },
  {
    category: '🎨 Design & Creative',
    roles: [
      { label: 'UI/UX Designer', icon: Palette, color: 'from-fuchsia-500 to-pink-500' },
      { label: 'Graphic Designer', icon: Palette, color: 'from-rose-500 to-pink-600' },
      { label: 'Product Designer', icon: PenTool, color: 'from-purple-500 to-violet-600' },
      { label: 'Content Writer', icon: Edit3, color: 'from-amber-500 to-orange-500' },
      { label: 'Copywriter', icon: PenTool, color: 'from-yellow-500 to-amber-600' },
    ],
  },
  {
    category: '📚 Education & Research',
    roles: [
      { label: 'Teacher / Educator', icon: BookOpen, color: 'from-teal-500 to-green-500' },
      { label: 'Research Analyst', icon: Search, color: 'from-indigo-500 to-blue-500' },
      { label: 'Data Analyst', icon: BarChart2, color: 'from-blue-500 to-violet-500' },
    ],
  },
];

const analysisSteps = [
  { label: 'Parsing document...', duration: 1500 },
  { label: 'Analyzing with AI...', duration: 3000 },
  { label: 'Generating insights...', duration: 2000 },
  { label: 'Finalizing report...', duration: 1000 },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Step 1 state
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Step 2 state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const activeRole = showCustomInput ? customRole.trim() : selectedRole;

  // Auth guard
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  // Handlers
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowCustomInput(false);
    setCustomRole('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isAllowedFile(dropped)) {
      setFile(dropped);
    } else {
      toast.error('Unsupported file. Use PDF, DOCX, DOC, TXT, PNG, JPG, or WEBP.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setFile(selected);
    }
  };

  const simulateProgress = async () => {
    let progress = 0;
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      const step = analysisSteps[i];
      const startProgress = (i / analysisSteps.length) * 100;
      const endProgress = ((i + 1) / analysisSteps.length) * 100;
      const increment = (endProgress - startProgress) / 10;
      for (let j = 0; j < 10; j++) {
        progress += increment;
        setUploadProgress(Math.min(progress, 95));
        await new Promise(r => setTimeout(r, step.duration / 10));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !activeRole) return;
    setIsUploading(true);
    setUploadProgress(0);

    const progressPromise = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('provider', 'gemini');
      formData.append('targetRole', activeRole);

      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await progressPromise;
      setUploadProgress(100);
      await new Promise(r => setTimeout(r, 500));

      if (data.success) {
        toast.success('Resume analyzed successfully!');
        router.push(`/resume/${data.resume._id}`);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (f: File) => {
    if (f.type.startsWith('image/')) return '🖼️';
    if (f.name.endsWith('.pdf')) return '📄';
    if (f.name.endsWith('.docx') || f.name.endsWith('.doc')) return '📝';
    if (f.name.endsWith('.txt')) return '📃';
    return '📄';
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-2">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-[#4F46D8] font-medium border border-[#E7E1D4] mb-4">
            <Target className="w-4 h-4" /> Role-Based Resume Analysis
          </div>
          <h1 className="text-4xl font-black font-['Outfit'] gradient-text mb-3">
            {step === 1 ? 'What Role Are You Targeting?' : 'Upload Your Resume'}
          </h1>
          <p className="text-[#77798B]">
            {step === 1
              ? 'Select your target job role so AI can tailor feedback specifically for you.'
              : `Uploading for: 🎯 ${activeRole}`}
          </p>
        </motion.div>

        {/* Step Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s
                  ? 'bg-[#4F46D8] text-white shadow-sm'
                  : step > s
                  ? 'bg-[#168575] text-white'
                  : 'bg-[#FFFFFF] border border-[#E7E1D4] text-[#77798B]'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-sm ${step === s ? 'text-[#171A35] font-semibold' : 'text-[#77798B]'}`}>
                {s === 1 ? 'Select Role' : 'Upload Resume'}
              </span>
              {s < 2 && <div className="w-12 h-px bg-[#E7E1D4] mx-1" />}
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Role Selection ─────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {ROLE_CATEGORIES.map((cat, ci) => (
                <div key={ci} className="mb-6">
                  <p className="text-sm text-[#77798B] font-semibold mb-3 px-1">{cat.category}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {cat.roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.label && !showCustomInput;
                      return (
                        <motion.button
                          key={role.label}
                          id={`role-${role.label.toLowerCase().replace(/\s+/g, '-')}`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleRoleSelect(role.label)}
                          className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-[#4F46D8] bg-[#F3F0FC] shadow-sm'
                              : 'border-[#E7E1D4] bg-[#FFFFFF] hover:border-[#4F46D8]/50 hover:bg-[#F3F0FC]/40'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-[#171A35] font-medium leading-tight">{role.label}</span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4F46D8] rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Custom Role Input */}
              <div className="mt-4 glass rounded-2xl p-5 border border-[#E7E1D4] bg-[#FFFFFF]">
                <button
                  onClick={() => { setShowCustomInput(true); setSelectedRole(''); }}
                  className={`flex items-center gap-3 w-full text-left transition-all ${showCustomInput ? 'mb-3' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center flex-shrink-0 ${showCustomInput ? 'ring-2 ring-[#4F46D8]' : ''}`}>
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[#171A35] text-sm font-medium">Other / Custom Role</p>
                    <p className="text-[#77798B] text-xs">Type any role not listed above</p>
                  </div>
                </button>
                {showCustomInput && (
                  <motion.input
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    id="custom-role-input"
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Supply Chain Manager, Embedded Systems Engineer..."
                    className="w-full bg-[#FAF8F1] border border-[#E7E1D4] rounded-xl px-4 py-3 text-[#171A35] text-sm placeholder-[#77798B] focus:outline-none focus:border-[#4F46D8] focus:bg-[#FFFFFF] transition-all"
                    autoFocus
                  />
                )}
              </div>

              {/* Continue Button */}
              <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <motion.button
                  id="continue-to-upload"
                  onClick={() => setStep(2)}
                  disabled={!activeRole}
                  whileHover={{ scale: activeRole ? 1.02 : 1 }}
                  whileTap={{ scale: activeRole ? 0.98 : 1 }}
                  className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all glow-effect text-lg shadow-md"
                >
                  Continue to Upload <ChevronRight className="w-5 h-5" />
                </motion.button>
                {!activeRole && (
                  <p className="text-center text-[#77798B] text-sm mt-2">Select a role to continue</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2: File Upload ────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Selected Role Badge */}
              <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-3 border border-[#E7E1D4] bg-[#FFFFFF]">
                <div className="w-10 h-10 rounded-xl bg-[#4F46D8] flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#77798B]">Target Role</p>
                  <p className="text-[#171A35] font-semibold">{activeRole}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-[#4F46D8] hover:underline text-xs font-medium transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Drop Zone */}
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#4F46D8] bg-[#F3F0FC]'
                        : 'border-[#E7E1D4] bg-[#FFFFFF] hover:border-[#4F46D8]/50 hover:bg-[#F3F0FC]/30'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <motion.div
                      animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                      className="w-20 h-20 rounded-2xl bg-[#F3F0FC] border border-[#E7E1D4] flex items-center justify-center mx-auto mb-4"
                    >
                      <Upload className="w-9 h-9 text-[#4F46D8]" />
                    </motion.div>
                    <h3 className="text-[#171A35] font-semibold text-lg mb-2">
                      {isDragging ? 'Drop your resume here!' : 'Drag & drop your resume here'}
                    </h3>
                    <p className="text-[#77798B] text-sm mb-4">or click to browse your files</p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-[#77798B]">
                      {['PDF', 'DOCX', 'DOC', 'TXT', 'PNG', 'JPG', 'WEBP'].map((fmt) => (
                        <span key={fmt} className="bg-[#FAF8F1] border border-[#E7E1D4] text-[#77798B] px-2 py-1 rounded-lg">{fmt}</span>
                      ))}
                    </div>
                    <p className="text-[#77798B] text-xs mt-3">Up to 10MB · Images are parsed via OCR</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file-preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-2xl p-6 border border-[#E7E1D4] bg-[#FFFFFF]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center flex-shrink-0 text-2xl">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#171A35] font-medium truncate">{file.name}</p>
                        <p className="text-[#77798B] text-sm">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-[#77798B] hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[#168575] text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      File ready for analysis
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass rounded-2xl p-6 mt-6 border border-[#E7E1D4] bg-[#FFFFFF]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[#171A35] font-medium">{analysisSteps[currentStep]?.label}</p>
                      <span className="text-[#4F46D8] font-bold">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-[#F3F0FC] rounded-full h-2 mb-4 overflow-hidden border border-[#E7E1D4]">
                      <motion.div
                        className="h-full bg-[#4F46D8] rounded-full"
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {analysisSteps.map((s, i) => (
                        <div
                          key={s.label}
                          className={`text-center text-xs py-1.5 px-2 rounded-lg transition-all font-medium ${
                            i < currentStep
                              ? 'bg-[#168575]/15 text-[#168575]'
                              : i === currentStep
                              ? 'bg-[#F3F0FC] text-[#4F46D8] animate-pulse border border-[#4F46D8]/30'
                              : 'text-[#77798B] bg-[#FAF8F1]'
                          }`}
                        >
                          {i < currentStep ? '✓' : i + 1}. {s.label.split('...')[0]}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              {!isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex gap-3"
                >
                  <button
                    id="back-to-role"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl border border-[#E7E1D4] text-[#77798B] hover:text-[#171A35] hover:bg-[#F3F0FC] transition-all font-medium bg-[#FFFFFF]"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <motion.button
                    id="upload-submit"
                    onClick={handleUpload}
                    disabled={!file}
                    whileHover={{ scale: file ? 1.02 : 1 }}
                    whileTap={{ scale: file ? 0.98 : 1 }}
                    className="flex-1 bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all glow-effect text-lg shadow-md"
                  >
                    Analyze Resume <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
              {!file && !isUploading && (
                <p className="text-center text-[#77798B] text-sm mt-2">Select a file to continue</p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function isAllowedFile(file: File): boolean {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/webp',
  ];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExts = ['pdf', 'docx', 'doc', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
  return allowed.includes(file.type) || allowedExts.includes(ext);
}
