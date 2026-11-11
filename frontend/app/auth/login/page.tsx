'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const features = [
  'AI-powered resume analysis across 6 dimensions',
  'Realistic mock interview simulations',
  'Personalized improvement suggestions',
  'ATS compatibility scoring',
];

const RESEND_COOLDOWN = 60; // seconds

// ─── OTP Input Component ──────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  // Auto-focus the first box or the next empty box when mounted
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const focusTarget = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[focusTarget]?.focus();
  }, []);

  const handleChange = (index: number, rawInput: string) => {
    const cleaned = rawInput.replace(/\D/g, '');

    if (!cleaned) {
      // User cleared the box
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (cleaned.length > 1) {
      // User pasted or browser autofilled multiple digits
      const newDigits = [...digits];
      for (let j = 0; j < cleaned.length && index + j < 6; j++) {
        newDigits[index + j] = cleaned[j];
      }
      const newVal = newDigits.join('');
      onChange(newVal);
      const nextIdx = Math.min(index + cleaned.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    // Single digit entered
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    const newVal = newDigits.join('');
    onChange(newVal);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`OTP digit ${i + 1}`}
          className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border transition-all
            focus:outline-none focus:ring-2 focus:ring-[#4F46D8]/20 focus:border-[#4F46D8]
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${digits[i]
              ? 'border-[#4F46D8] text-[#171A35] bg-[#4F46D8]/5 shadow-sm'
              : 'bg-[#FFFFFF] border-[#E7E1D4] text-[#171A35] hover:border-[#4F46D8]/50 shadow-sm'
            }`}
        />
      ))}
    </div>
  );
}

// ─── Login Content Component (Inside Suspense) ────────────────────────────────

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Login form ────────────────────────────────────────────────────────────
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle URL query params (e.g. redirected from register or OAuth)
  useEffect(() => {
    const registered = searchParams.get('registered');
    const emailParam = searchParams.get('email');
    const errorParam = searchParams.get('error');

    if (registered === 'true') {
      setInfoMessage('Account created! Please sign in with your email & password to receive your OTP.');
    }
    if (emailParam) {
      setValue('email', emailParam);
    }
    if (errorParam === 'google') {
      setError('Google sign-in failed. The server could not reach the database. Please verify your internet connection, ensure your IP is whitelisted in MongoDB Atlas, or switch to mobile hotspot.');
    } else if (errorParam === 'callback') {
      setError('Google sign-in completed, but your account profile could not be loaded from the database.');
    } else if (errorParam === 'no_token') {
      setError('Google sign-in did not return an authentication token. Please try again.');
    } else if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
    }
  }, [searchParams, setValue]);

  // ── Resend countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const response = await api.post('/auth/login', data);

      if (response.data.success && response.data.otpRequired) {
        // Credentials verified — flip to OTP verification screen
        setOtpEmail(response.data.email || data.email);
        setOtpStep(true);
        setOtpValue('');
        setOtpError('');
        setResendCountdown(RESEND_COOLDOWN);
      } else {
        setError(response.data.message || 'OTP verification is required.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP verification ──────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await api.post('/auth/verify-otp', {
        email: otpEmail,
        otp: otpValue,
      });

      if (response.data.success) {
        // Sign-in ONLY completed after successful OTP verification
        login(response.data.token, response.data.user);
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Incorrect or expired code. Please try again.');
      setOtpValue('');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/resend-otp', { email: otpEmail });
      setResendCountdown(RESEND_COOLDOWN);
      setOtpValue('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Masked email helper ───────────────────────────────────────────────────
  const maskedEmail = otpEmail
    ? otpEmail.replace(/^(.{2})(.+)(@.+)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c)
    : '';

  return (
    <div className="min-h-screen bg-[#FAF8F1] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F46D8] via-[#6366F1] to-[#7C3AED]" />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white font-['Outfit']">ResumeAI</span>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-4xl font-black text-white font-['Outfit'] mb-4 leading-tight">
                Transform Your<br />
                <span>Career Journey</span>
              </h2>
              <p className="text-indigo-100 text-lg mb-8">
                Join thousands of professionals who&apos;ve accelerated their job search with AI.
              </p>

              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-indigo-200 flex-shrink-0" />
                    <span className="text-white text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <p className="text-white/90 text-sm italic mb-3">
                &quot;ResumeAI helped me land a senior engineering role at a FAANG company. My score went from 62 to 91 after following the suggestions!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">JK</div>
                <div>
                  <div className="text-white text-sm font-semibold">James K.</div>
                  <div className="text-indigo-200 text-xs">Software Engineer @ Meta</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">

          {/* ── OTP Verification Step ──────────────────────────────────────── */}
          {otpStep ? (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-[#4F46D8] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text font-['Outfit']">ResumeAI</span>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#4F46D8]/10 border border-[#4F46D8]/20 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#4F46D8]" />
                </div>
              </div>

              <h1 className="text-3xl font-black text-[#171A35] font-['Outfit'] mb-2 text-center">
                Check your email
              </h1>
              <p className="text-[#77798B] mb-2 text-center text-sm">
                We sent a 6-digit verification code to
              </p>
              <p className="text-[#4F46D8] font-semibold mb-8 text-center text-sm">{maskedEmail}</p>

              {/* Error */}
              <AnimatePresence>
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-xl px-4 py-3 mb-5"
                  >
                    {otpError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#171A35] mb-4 text-center">
                  Enter verification code
                </label>
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={otpLoading}
                />
              </div>

              {/* Verify Button */}
              <motion.button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpValue.length !== 6}
                whileHover={{ scale: otpLoading || otpValue.length !== 6 ? 1 : 1.02 }}
                whileTap={{ scale: otpLoading || otpValue.length !== 6 ? 1 : 0.98 }}
                className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all glow-sm shadow-md mb-4"
              >
                {otpLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>

              {/* Resend */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || resendLoading || otpLoading}
                  className="inline-flex items-center gap-2 text-sm text-[#77798B] hover:text-[#4F46D8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendCountdown > 0
                    ? `Resend code in ${resendCountdown}s`
                    : resendLoading
                    ? 'Sending...'
                    : 'Resend code'}
                </button>
              </div>

              {/* Back to login */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtpValue(''); setOtpError(''); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-sm text-[#77798B] hover:text-[#171A35] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </button>
              </div>

              <p className="text-center text-[#77798B] text-xs mt-6">
                The code expires in 5 minutes. Do not share it with anyone.
              </p>
            </motion.div>
          ) : (

            /* ── Credentials Step ─────────────────────────────────────────── */
            <motion.div
              key="credentials-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-[#4F46D8] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text font-['Outfit']">ResumeAI</span>
              </div>

              <h1 className="text-3xl font-black text-[#171A35] font-['Outfit'] mb-2">Welcome back</h1>
              <p className="text-[#77798B] mb-6">Sign in to continue your career journey</p>

              {infoMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-start gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{infoMessage}</span>
                </motion.div>
              )}

              {/* Google OAuth */}
              <a
                href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')}/auth/google`}
                className="flex items-center justify-center gap-3 w-full bg-[#FFFFFF] border border-[#E7E1D4] hover:bg-[#F3F0FC] text-[#171A35] rounded-xl py-3 px-4 mb-6 transition-all shadow-sm group"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </a>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[#E7E1D4]" />
                <span className="text-[#77798B] text-sm">or</span>
                <div className="flex-1 h-px bg-[#E7E1D4]" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#171A35] mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798B]" />
                    <input
                      {...register('email')}
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] placeholder-[#77798B] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#4F46D8] focus:ring-2 focus:ring-[#4F46D8]/20 transition-all shadow-sm"
                    />
                  </div>
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#171A35] mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798B]" />
                    <input
                      {...register('password')}
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] placeholder-[#77798B] rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-[#4F46D8] focus:ring-2 focus:ring-[#4F46D8]/20 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77798B] hover:text-[#171A35]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <motion.button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all glow-sm shadow-md"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-[#77798B] text-sm mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-[#4F46D8] hover:underline font-medium transition-colors">
                  Sign up free
                </Link>
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Page with Suspense Boundary for useSearchParams ─────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46D8]/30 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
