'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  ShieldCheck,
  Mic,
  Compass,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  LogOut,
  Brain,
  Menu,
  X,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Resume Studio', href: '/resume-studio', icon: FileText },
  { label: 'Job Matcher', href: '/job-matcher', icon: Briefcase },
  { label: 'SkillProof Lab', href: '/skillproof', icon: ShieldCheck, badge: 'New' },
  { label: 'Interview Lab', href: '/interview', icon: Mic },
  { label: 'Career Roadmap', href: '/roadmap', icon: Compass },
  { label: 'Progress Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Reports', href: '/reports', icon: FileSpreadsheet },
  { label: 'History', href: '/history', icon: History },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (href === '/resume-studio') {
      return pathname === '/resume-studio' || pathname.startsWith('/resume');
    }
    if (href === '/interview') {
      return pathname === '/interview' || pathname.startsWith('/interview');
    }
    return pathname.startsWith(href);
  };

  const renderNavLinks = () => (
    <div className="space-y-1">
      <div className="px-3 pb-2 pt-1 text-[11px] font-bold tracking-wider text-[#77798B] uppercase">
        Main menu
      </div>
      {navItems.map((item) => {
        const active = isItemActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              active
                ? 'bg-[#F3F0FC] text-[#4F46D8]'
                : 'text-[#77798B] hover:bg-[#F3F0FC]/60 hover:text-[#171A35]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 transition-colors ${
                  active ? 'text-[#4F46D8]' : 'text-[#77798B] group-hover:text-[#171A35]'
                }`}
              />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="rounded-full bg-[#4F46D8] px-2 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F1] text-[#171A35] flex">
      {/* ─── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#E7E1D4] bg-[#FFFFFF] fixed inset-y-0 left-0 z-30">
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
          {/* Brand Logo Header */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46D8] text-white shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="font-['Outfit'] text-lg font-black tracking-tight text-[#171A35]">
                Resume<span className="text-[#4F46D8]">AI</span>
              </span>
              <span className="ml-1.5 rounded bg-[#F3F0FC] px-1.5 py-0.5 text-[10px] font-semibold text-[#4F46D8]">
                Elevate
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex-1">{renderNavLinks()}</nav>
        </div>

        {/* Sidebar Footer: User Info & Logout Button */}
        <div className="border-t border-[#E7E1D4] p-4 bg-[#FFFFFF]">
          {user && (
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F0FC] font-semibold text-[#4F46D8] text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#171A35]">{user.name || 'Candidate'}</p>
                <p className="truncate text-[11px] text-[#77798B]">{user.email || 'user@example.com'}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F3F0FC] px-3.5 py-2 text-xs font-semibold text-[#4F46D8] transition-all hover:bg-[#4F46D8] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Drawer Overlay ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#171A35]/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#FFFFFF] border-r border-[#E7E1D4] flex flex-col justify-between p-4 z-50">
            <div>
              <div className="flex items-center justify-between mb-6 px-2">
                <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46D8] text-white shadow-sm">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="font-['Outfit'] text-lg font-black text-[#171A35]">
                    Resume<span className="text-[#4F46D8]">AI</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-[#77798B] hover:bg-[#F3F0FC] hover:text-[#171A35]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav>{renderNavLinks()}</nav>
            </div>

            <div className="border-t border-[#E7E1D4] pt-4">
              {user && (
                <div className="mb-3 flex items-center gap-3 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F0FC] font-semibold text-[#4F46D8] text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#171A35]">{user.name}</p>
                    <p className="truncate text-[11px] text-[#77798B]">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F3F0FC] px-3.5 py-2 text-xs font-semibold text-[#4F46D8] transition-all hover:bg-[#4F46D8] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main Content Shell ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header Bar */}
        <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#E7E1D4] bg-[#FFFFFF] px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-[#171A35] hover:bg-[#F3F0FC]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-['Outfit'] font-black text-sm text-[#171A35]">
              Resume<span className="text-[#4F46D8]">AI</span>
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#77798B]">{user.name?.split(' ')[0]}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F0FC] text-xs font-bold text-[#4F46D8]">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
