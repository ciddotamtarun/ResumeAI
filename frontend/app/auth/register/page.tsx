'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (response.data.success) {
        login(response.data.token, response.data.user);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

        <h1 className="text-3xl font-black text-[#171A35] font-['Outfit'] mb-2 text-center">Create your account</h1>
        <p className="text-[#77798B] mb-8 text-center">Start your AI-powered career journey today</p>

        {/* Google OAuth */}
        <a
          href="http://localhost:5000/api/auth/google"
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
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
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
    </div>
  );
}
