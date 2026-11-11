'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  CheckCircle,
  ChevronRight,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import { ROLE_CATEGORIES, ALL_ROLES } from '@/lib/roles';

function RoleSelectionContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // If the user arrived with a role query parameter (e.g. clicking "Change Role"), pre-select it.
  // When starting fresh without ?role=, start empty so the user picks a role intentionally.
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const isPredefined = ALL_ROLES.some((r) => r.toLowerCase() === roleParam.toLowerCase());
      if (isPredefined) {
        const matched = ALL_ROLES.find((r) => r.toLowerCase() === roleParam.toLowerCase()) || roleParam;
        setSelectedRole(matched);
        setShowCustomInput(false);
      } else {
        setSelectedRole('');
        setCustomRole(roleParam);
        setShowCustomInput(true);
      }
    } else {
      setSelectedRole('');
      setCustomRole('');
      setShowCustomInput(false);
    }
  }, [searchParams]);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const activeRole = showCustomInput ? customRole.trim() : selectedRole;

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowCustomInput(false);
    setCustomRole('');
  };

  const handleCustomToggle = () => {
    setShowCustomInput(true);
    setSelectedRole('');
  };

  const handleContinue = () => {
    if (!activeRole) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('resumeai_target_role', activeRole);
    }
    router.push(`/resume/upload?role=${encodeURIComponent(activeRole)}`);
  };

  if (isLoading || !isAuthenticated) {
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
      <div className="max-w-5xl mx-auto py-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#FFFFFF] px-4 py-1.5 rounded-full text-xs font-bold text-[#4F46D8] border border-[#E7E1D4] shadow-xs mb-3">
            <Target className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Step 1 — Target Job Role</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#171A35] mb-2 tracking-tight">
            What Role Are You Targeting?
          </h1>

          <p className="text-sm text-[#77798B] max-w-2xl mx-auto">
            Select the position you&apos;re aiming for. ResumeAI will analyze your resume against industry standards, ATS algorithms, and job requirements for this specific role.
          </p>
        </motion.div>

        {/* Categories and Role Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {ROLE_CATEGORIES.map((cat, ci) => (
            <div key={ci} className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
              <h2 className="text-xs font-bold text-[#77798B] uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                <span>{cat.category}</span>
                <span className="text-[10px] font-medium text-[#77798B]/70">({cat.roles.length} roles)</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {cat.roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.label && !showCustomInput;

                  return (
                    <motion.button
                      key={role.label}
                      id={`role-${role.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.label)}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#4F46D8] bg-[#F3F0FC] shadow-sm ring-1 ring-[#4F46D8]'
                          : 'border-[#E7E1D4] bg-[#FAF8F1]/60 hover:bg-[#F3F0FC]/40 hover:border-[#4F46D8]/40'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>

                      <span className={`text-xs leading-snug font-medium line-clamp-2 ${isSelected ? 'text-[#4F46D8] font-bold' : 'text-[#171A35]'}`}>
                        {role.label}
                      </span>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4F46D8] rounded-full flex items-center justify-center shadow-xs">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Other / Custom Role Option */}
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
            <button
              type="button"
              onClick={handleCustomToggle}
              className={`flex items-center gap-3 w-full text-left transition-all ${showCustomInput ? 'mb-3' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center flex-shrink-0 text-white shadow-xs ${
                  showCustomInput ? 'ring-2 ring-[#4F46D8]' : ''
                }`}
              >
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#171A35]">Other / Custom Role</p>
                <p className="text-xs text-[#77798B]">Enter any job role not listed in the categories above</p>
              </div>
              {showCustomInput && (
                <span className="text-[11px] font-bold text-[#4F46D8] uppercase tracking-wide bg-[#F3F0FC] px-2.5 py-1 rounded-lg">
                  Active
                </span>
              )}
            </button>

            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2"
                >
                  <label htmlFor="custom-role-input" className="block text-xs font-bold text-[#171A35] uppercase tracking-wide mb-1.5">
                    Enter Custom Target Role
                  </label>
                  <input
                    id="custom-role-input"
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Embedded Firmware Engineer, Quantitative Analyst, Supply Chain Director..."
                    className="w-full bg-[#FAF8F1] border border-[#E7E1D4] rounded-xl px-4 py-3 text-[#171A35] text-sm placeholder-[#77798B] focus:outline-none focus:border-[#4F46D8] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4F46D8]/20 transition-all shadow-xs"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Selected Role Summary Bar & Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 sticky bottom-4 z-20"
        >
          <div className="rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E7E1D4] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#77798B]">Selected Target Role</p>
                <p className="text-base font-bold text-[#171A35] truncate">
                  {activeRole || <span className="text-[#77798B] font-normal italic">Select a role above</span>}
                </p>
              </div>
            </div>

            <motion.button
              id="continue-to-upload"
              type="button"
              onClick={handleContinue}
              disabled={!activeRole}
              whileHover={{ scale: activeRole ? 1.02 : 1 }}
              whileTap={{ scale: activeRole ? 0.98 : 1 }}
              className="w-full sm:w-auto min-w-[200px] bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md glow-sm text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Continue to Upload</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

      </div>
    </AppShell>
  );
}

export default function RolePage() {
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
      <RoleSelectionContent />
    </Suspense>
  );
}
