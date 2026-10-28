import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'ResumeAI — Simulate, Analyze, Succeed',
  description: 'Upload your resume, get AI-powered analysis, practice mock interviews, and land your dream job with personalized coaching.',
  keywords: ['resume', 'AI', 'mock interview', 'job preparation', 'career'],
  openGraph: {
    title: 'ResumeAI — Simulate, Analyze, Succeed',
    description: 'AI-powered resume analysis and interview simulation platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
