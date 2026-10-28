'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X, LogOut, LayoutDashboard, ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/resume/upload', label: 'Upload Resume', icon: FileText },
      ]
    : [
        { href: '/#features', label: 'Features' },
        { href: '/#how-it-works', label: 'How It Works' },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-strong py-3' : 'bg-[#FAF8F1]/90 backdrop-blur-md py-5 border-b border-[#E7E1D4]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#4F46D8] flex items-center justify-center glow-sm transition-transform group-hover:scale-110">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-['Outfit'] gradient-text">ResumeAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
                  pathname === link.href ? 'text-[#4F46D8] bg-[#F3F0FC] font-semibold' : 'text-[#77798B] hover:text-[#171A35] hover:bg-[#F3F0FC]/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-[#F3F0FC] transition-colors border border-[#E7E1D4]"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-[#4F46D8] text-white text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[#171A35] font-medium">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-[#77798B]" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#FFFFFF] border border-[#E7E1D4] rounded-xl py-2 shadow-xl"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#171A35] hover:bg-[#F3F0FC] hover:text-[#4F46D8] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#4F46D8]" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-[#171A35] hover:text-[#4F46D8] hover:bg-[#F3F0FC]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-[#4F46D8] hover:bg-[#4338CA] text-white glow-sm transition-all hover:scale-105">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-[#171A35] hover:text-[#4F46D8]"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-[#E7E1D4] bg-[#FFFFFF] rounded-2xl p-4 shadow-xl border border-[#E7E1D4]"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                      pathname === link.href ? 'text-[#4F46D8] bg-[#F3F0FC] font-semibold' : 'text-[#171A35] hover:bg-[#F3F0FC]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/auth/login" onClick={() => setIsMobileOpen(false)}>
                      <Button variant="ghost" className="w-full text-[#171A35] hover:bg-[#F3F0FC]">Sign In</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMobileOpen(false)}>
                      <Button className="w-full bg-[#4F46D8] hover:bg-[#4338CA] text-white">
                        Get Started Free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
