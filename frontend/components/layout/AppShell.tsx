'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileEdit,
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
  { label: 'Resume Builder', href: '/resume-builder', icon: FileEdit, badge: 'New' },
  { label: 'Resume Studio', href: '/resume-studio', icon: FileText },
  { label: 'Job Matcher', href: '/job-matcher', icon: Briefcase },
  { label: 'SkillProof Lab', href: '/skillproof', icon: ShieldCheck },
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
    if (href === '/resume-builder') {
      return pathname === '/resume-builder' || pathname.startsWith('/resume-builder');
    }
    if (href === '/resume-studio') {
      return pathname === '/resume-studio' || (pathname.startsWith('/resume') && !pathname.startsWith('/resume-builder'));
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
              <span className="rounded-full bg-[#4F46D8]/10 px-2 py-0.5 text-[10px] font-bold text-[#4F46D8]">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAF8F1]">
      {/* ─── Desktop Left Sidebar ────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#E7E1D4] bg-[#FFFFFF] p-5 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46D8] text-white shadow-xs">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Outfit'] text-base font-black tracking-tight text-[#171A35]">
                Resume<span className="text-[#4F46D8]">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-[#77798B] uppercase tracking-wider">
                Career Readiness
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav>{renderNavLinks()}</nav>
        </div>

        {/* User Profile / Workspace & Logout */}
        <div className="pt-4 border-t border-[#E7E1D4] space-y-3">
          {user ? (
            <div className="flex items-center justify-between rounded-xl p-2 hover:bg-[#FAF8F1] transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F0FC] font-['Outfit'] text-xs font-bold text-[#4F46D8] shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-[#171A35]">{user.name || 'User'}</div>
                  <div className="truncate text-[10px] text-[#77798B]">{user.email || 'Free tier'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#77798B] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-[#77798B] px-2">
              <span>Workspace</span>
              <Link href="/auth/login" className="font-semibold text-[#4F46D8] hover:underline">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Mobile Drawer ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#E7E1D4] bg-[#FFFFFF] p-5 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46D8] text-white shadow-xs">
                <Brain className="h-5 w-5" />
              </div>
              <span className="font-['Outfit'] text-base font-black tracking-tight text-[#171A35]">
                Resume<span className="text-[#4F46D8]">AI</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-[#77798B] hover:bg-[#FAF8F1]"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav>{renderNavLinks()}</nav>
        </div>

        <div className="pt-4 border-t border-[#E7E1D4] space-y-2">
          {user ? (
            <div className="flex items-center justify-between p-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[#171A35]">{user.name}</div>
                <div className="truncate text-[10px] text-[#77798B]">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#77798B] hover:text-red-600"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full py-2 text-center text-xs font-semibold text-[#4F46D8]"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* ─── Main Content Shell ──────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E7E1D4] bg-[#FFFFFF]/90 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
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
