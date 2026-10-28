'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Palette,
  Database,
  Download,
  Trash2,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [preferredRole, setPreferredRole] = useState('Full Stack Developer');
  const [preferredProvider, setPreferredProvider] = useState<'gemini' | 'openai'>('gemini');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const savedRole = localStorage.getItem('resumeai_preferred_role');
    if (savedRole) setPreferredRole(savedRole);
    const savedProvider = localStorage.getItem('resumeai_preferred_provider');
    if (savedProvider === 'openai' || savedProvider === 'gemini') {
      setPreferredProvider(savedProvider);
    }
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('resumeai_preferred_role', preferredRole);
    localStorage.setItem('resumeai_preferred_provider', preferredProvider);
    toast.success('Preferences saved successfully!');
  };

  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        },
        skillProofAttempts: JSON.parse(
          localStorage.getItem('resumeai_skillproof_attempts') || '[]'
        ),
        jobMatches: JSON.parse(
          localStorage.getItem('resumeai_job_matches') || '[]'
        ),
        roadmapTasks: JSON.parse(
          localStorage.getItem('resumeai_roadmap_tasks') || '[]'
        ),
      };

      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `resumeai_backup_${Date.now()}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Data exported successfully!');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('resumeai_skillproof_attempts');
    localStorage.removeItem('resumeai_job_matches');
    localStorage.removeItem('resumeai_roadmap_tasks');
    setShowClearConfirm(false);
    toast.success('Application cache and assessment history reset.');
  };

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-[#4F46D8]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
            Settings • Preferences & Configuration
          </span>
        </div>
        <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
          Account & Application Settings
        </h1>
        <p className="text-xs text-[#77798B] mt-0.5">
          Manage your profile details, default AI engine, theme palette, and stored data
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Profile Card */}
        <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
          <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
            <User className="w-4 h-4 text-[#4F46D8]" />
            <span>Profile Information</span>
          </h2>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'Candidate'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@example.com'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                  Target Career Role
                </label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] text-xs text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                  Default AI Intelligence Engine
                </label>
                <select
                  value={preferredProvider}
                  onChange={(e) => setPreferredProvider(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] text-xs text-[#171A35] font-semibold focus:outline-none focus:border-[#4F46D8]"
                >
                  <option value="gemini">Google Gemini (Recommended)</option>
                  <option value="openai">OpenAI GPT-4o</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#4F46D8] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Save Preferences
            </button>
          </form>
        </div>

        {/* Color Palette Verification Card */}
        <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#4F46D8]" />
              <span>Theme & Visual Branding Verification</span>
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#168575]/15 text-[#168575]">
              Active & Locked
            </span>
          </div>

          <p className="text-xs text-[#77798B]">
            ElevateAI Warm Cream Color Theme (#FAF8F1) is enforced consistently across all application shells, cards, and modal dialogs:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FAF8F1] border border-[#E7E1D4] shadow-xs" />
              <div>
                <span className="text-[11px] font-bold text-[#171A35] block">Main Canvas</span>
                <span className="text-[10px] text-[#77798B] font-mono">#FAF8F1</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs" />
              <div>
                <span className="text-[11px] font-bold text-[#171A35] block">Cards & Sidebar</span>
                <span className="text-[10px] text-[#77798B] font-mono">#FFFFFF</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#4F46D8] shadow-xs" />
              <div>
                <span className="text-[11px] font-bold text-[#171A35] block">Primary Accent</span>
                <span className="text-[10px] text-[#77798B] font-mono">#4F46D8</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#E7E1D4] bg-[#FFFFFF] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#168575] shadow-xs" />
              <div>
                <span className="text-[11px] font-bold text-[#171A35] block">Success Indicator</span>
                <span className="text-[10px] text-[#77798B] font-mono">#168575</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Card */}
        <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
          <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4F46D8]" />
            <span>Data Integrity & Export</span>
          </h2>
          <p className="text-xs text-[#77798B]">
            Download your full career readiness backup or reset client-side cache safely:
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35] hover:bg-[#F3F0FC] hover:text-[#4F46D8] transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Stored Data (JSON)</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF8F1] border border-[#E7E1D4] text-[#DC2626] hover:bg-[#DC2626]/10 transition-all shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Cache</span>
            </button>
          </div>

          {/* Confirmation Box */}
          {showClearConfirm && (
            <div className="p-4 rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/5 text-xs space-y-2 mt-3">
              <div className="flex items-center gap-2 text-[#DC2626] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Cache Reset</span>
              </div>
              <p className="text-[11px] text-[#77798B]">
                This will reset your local SkillProof attempt history and saved job matches. Your uploaded resumes and mock interviews stored on the server will not be deleted.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-bold hover:bg-[#b91c1c]"
                >
                  Yes, Clear Cache
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E7E1D4] text-xs font-semibold text-[#171A35]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session / Logout Card */}
        <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#171A35] font-['Outfit']">Account Session</h3>
            <p className="text-xs text-[#77798B] mt-0.5">
              Securely sign out of your current session on this browser
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F3F0FC] text-[#4F46D8] hover:bg-[#4F46D8] hover:text-white transition-all shadow-xs self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
