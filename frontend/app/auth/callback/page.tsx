'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      hasProcessedRef.current = true;
      router.replace(`/auth/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!token) {
      hasProcessedRef.current = true;
      router.replace('/auth/login?error=no_token');
      return;
    }

    hasProcessedRef.current = true;
    localStorage.setItem('token', token);

    api
      .get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (data?.success && data?.user) {
          login(token, data.user);
          router.replace('/dashboard');
        } else {
          router.replace('/auth/login?error=callback');
        }
      })
      .catch((err) => {
        console.error('[AuthCallback] Failed to retrieve user session:', err);
        router.replace('/auth/login?error=callback');
      });
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#171A35] text-lg font-semibold">Completing sign in...</p>
        <p className="text-[#77798B] text-sm mt-2">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#4F46D8]/20 border-t-[#4F46D8] rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
