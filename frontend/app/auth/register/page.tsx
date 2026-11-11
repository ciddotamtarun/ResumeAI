'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  User,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import api from '@/lib/api';

const EMAIL_STRICT_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

const emailSchema = z
  .string()
  .min(1, 'Email address is required')
  .refine((val) => !/[*#$!%^&()=~`[\]{}|\\:;"'<>,?/ ]/.test(val.trim()), {
    message: 'Email address contains invalid characters (such as * or spaces)',
  })
  .refine((val) => EMAIL_STRICT_REGEX.test(val.trim().toLowerCase()), {
    message: 'Please enter a valid email format (e.g. name@example.com)',
  })
  .refine((val) => {
    const trimmed = val.trim().toLowerCase();
    const parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    const [user, domain] = parts;
    if (!user || !domain) return false;
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      if (user.length < 6 || user.length > 30) return false;
      if (!/^[a-z0-9.]+$/.test(user)) return false;
      if (user.startsWith('.') || user.endsWith('.')) return false;
      if (user.includes('..')) return false;
    }
    return true;
  }, {
    message: 'Invalid Gmail address (username must be 6-30 alphanumeric characters or dots, no consecutive dots)',
  });

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

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

// ─── Register Page Component ──────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Verification state (User is created ONLY after OTP is verified!)
  const [otpStep, setOtpStep] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Step 1: Validate email & DNS, send OTP, enter pending state
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data.success && response.data.otpRequired) {
        setTargetEmail(data.email);
        setOtpStep(true);
        setOtpValue('');
        setOtpError('');
        setResendCountdown(RESEND_COOLDOWN);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and ACTUALLY create the user account in MongoDB
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await api.post('/auth/verify-email-otp', {
        email: targetEmail,
        otp: otpValue,
      });

      if (response.data.success) {
        setSuccessMsg('Email verified & account created! Redirecting to sign in...');
        setTimeout(() => {
          router.push(`/auth/login?registered=true&email=${encodeURIComponent(targetEmail)}`);
        }, 1200);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Incorrect or expired code. Please try again.');
      setOtpValue('');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP for registration
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/resend-email-otp', { email: targetEmail });
      setResendCountdown(RESEND_COOLDOWN);
      setOtpValue('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setOtpError(axiosErr.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = targetEmail
    ? targetEmail.replace(/^(.{2})(.+)(@.+)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c)
    : '';

  return (
    <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-8">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F46D8]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6366F1]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 glass rounded-2xl p-8 border border-[#E7E1D4] bg-[#FFFFFF] shadow-lg"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#4F46D8] flex items-center justify-center glow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text font-['Outfit']">ResumeAI</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 2: Email OTP Verification Screen (Account NOT created until verified) ── */}
          {otpStep ? (
            <motion.div
              key="otp-verification-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-[#4F46D8]/10 border border-[#4F46D8]/20 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#4F46D8]" />
                </div>
              </div>

              <h1 className="text-3xl font-black text-[#171A35] font-['Outfit'] mb-2 text-center">
                Verify your email
              </h1>
              <p className="text-[#77798B] text-sm mb-1 text-center">
                We sent a 6-digit confirmation code to
              </p>
              <p className="text-[#4F46D8] font-semibold mb-4 text-center text-sm">{targetEmail}</p>

              <div className="bg-[#4F46D8]/5 border border-[#4F46D8]/20 rounded-xl p-3 mb-6 text-center text-xs text-[#4F46D8]">
                🛡️ Your account will only be created after your email is verified.
              </div>

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {otpError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-xl px-4 py-3 mb-5"
                >
                  {otpError}
                </motion.div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#171A35] mb-4 text-center">
                  Enter 6-digit verification code
                </label>
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={otpLoading || !!successMsg}
                />
              </div>

              <motion.button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpValue.length !== 6 || !!successMsg}
                whileHover={{ scale: otpLoading || otpValue.length !== 6 || !!successMsg ? 1 : 1.02 }}
                whileTap={{ scale: otpLoading || otpValue.length !== 6 || !!successMsg ? 1 : 0.98 }}
                className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all glow-sm shadow-md mb-4"
              >
                {otpLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying & creating account...</>
                ) : (
                  <>Verify & Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || resendLoading || otpLoading || !!successMsg}
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

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtpValue(''); setOtpError(''); }}
                  disabled={otpLoading || !!successMsg}
                  className="inline-flex items-center gap-1.5 text-sm text-[#77798B] hover:text-[#171A35] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit registration details
                </button>
              </div>

              <p className="text-center text-[#77798B] text-xs mt-6">
                Code expires in 5 minutes. If not verified, this registration is automatically cancelled.
              </p>
            </motion.div>
          ) : (
            /* ── STEP 1: Registration Form ── */
            <motion.div
              key="registration-form-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-black text-[#171A35] font-['Outfit'] mb-2 text-center">
                Create your account
              </h1>
              <p className="text-[#77798B] mb-8 text-center">
                Start your AI-powered career journey today
              </p>

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
                  <label className="block text-sm font-medium text-[#171A35] mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798B]" />
                    <input
                      {...register('name')}
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] placeholder-[#77798B] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#4F46D8] focus:ring-2 focus:ring-[#4F46D8]/20 transition-all shadow-sm"
                    />
                  </div>
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#171A35] mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798B]" />
                    <input
                      {...register('email')}
                      id="register-email"
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
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
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

                <div>
                  <label className="block text-sm font-medium text-[#171A35] mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798B]" />
                    <input
                      {...register('confirmPassword')}
                      id="register-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      className="w-full bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] placeholder-[#77798B] rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-[#4F46D8] focus:ring-2 focus:ring-[#4F46D8]/20 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77798B] hover:text-[#171A35]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <motion.button
                  id="register-submit"
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full bg-[#4F46D8] hover:bg-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all glow-sm shadow-md"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Checking email & sending code...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-[#77798B] text-sm mt-6">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#4F46D8] hover:underline font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
