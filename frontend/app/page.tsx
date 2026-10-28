'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  FileText,
  Target,
  Mic,
  Edit3,
  Repeat,
  Shield,
  ArrowRight,
  CheckCircle,
  Upload,
  BarChart3,
  MessageSquare,
  Trophy,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const features = [
  {
    icon: FileText,
    title: 'Smart Resume Parsing',
    description: 'PDF & DOCX support with instant text extraction. Upload any format and get structured data in seconds.',
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
  {
    icon: Target,
    title: 'AI Score Analysis',
    description: 'Detailed scoring across 6 dimensions: contact, summary, experience, education, skills & formatting.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: Mic,
    title: 'Mock Interview Simulator',
    description: 'AI-powered realistic interview practice tailored to your resume with instant feedback.',
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: Edit3,
    title: 'Improvement Suggestions',
    description: 'Specific, actionable rewrite suggestions for every section of your resume with before/after comparisons.',
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  {
    icon: Repeat,
    title: 'Role-Targeted AI Analysis',
    description: 'Select your target role first — Frontend Dev, Data Scientist, MBA, and more. Every insight is tailored to what recruiters in that role actually look for.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'JWT authentication with encrypted storage. Your resume data stays private and secure.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
];

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Drag and drop your PDF or DOCX resume. We instantly parse and extract all content.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Get AI Analysis',
    description: 'Our AI analyzes 6 key dimensions and gives you a comprehensive score with actionable insights.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Practice Interview',
    description: 'Simulate a real interview with AI questions tailored to your experience and role.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Land the Job',
    description: 'Apply with confidence using your optimized resume and polished interview skills.',
    color: 'from-pink-500 to-rose-600',
  },
];

const stats = [
  { label: 'Resumes Analyzed', value: '50,000+', icon: FileText },
  { label: 'Success Rate', value: '94%', icon: TrendingUp },
  { label: 'More Interviews', value: '8.2x', icon: Zap },
  { label: 'Happy Users', value: '12K+', icon: Users },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.1 });
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.1 });

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-8"
          >
            <Zap className="w-4 h-4" />
            Powered by GPT-4o & OpenRouter API
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black font-['Outfit'] leading-tight mb-6"
          >
            Land Your Dream Job with{' '}
            <span className="gradient-text">AI-Powered</span>{' '}
            Resume Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Upload your resume, get a detailed AI analysis, practice mock interviews, and receive personalized coaching to maximize your chances of landing the perfect role.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-semibold text-lg glow-effect hover:from-indigo-500 hover:to-violet-500 transition-all"
              >
                Start for Free <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 glass text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
              >
                See How It Works
              </motion.button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-2xl font-black gradient-text font-['Outfit']">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-indigo-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-6">
              <Brain className="w-4 h-4" /> Everything you need
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-['Outfit'] gradient-text mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our AI platform gives you everything needed to transform your resume and ace your interviews.
            </p>
          </AnimatedSection>

          <motion.div
            ref={featuresRef}
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass rounded-2xl p-6 group cursor-default transition-all hover:border-indigo-500/30"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  style={{ boxShadow: `0 0 20px ${feature.glow}` }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-['Outfit']">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-6">
              <CheckCircle className="w-4 h-4" /> Simple process
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-['Outfit'] gradient-text mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Four simple steps to transform your career trajectory.
            </p>
          </AnimatedSection>

          <motion.div
            ref={stepsRef}
            variants={containerVariants}
            initial="hidden"
            animate={stepsInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center glow-sm z-10 relative`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center border-2 border-[#0a0a0f]">
                    {index + 1}
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 w-full">
                  <h3 className="text-lg font-bold text-white mb-2 font-['Outfit']">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-violet-600/80 to-purple-700/80" />
              <div className="absolute inset-0 bg-mesh opacity-50" />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="relative z-10 text-center py-16 px-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="text-5xl mb-6"
                >
                  🚀
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-black font-['Outfit'] text-white mb-4">
                  Ready to Transform Your Career?
                </h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of job seekers who&apos;ve landed their dream roles with ResumeAI. Get started for free — no credit card required.
                </p>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-10 py-4 rounded-xl text-lg hover:bg-indigo-50 transition-colors shadow-2xl"
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text font-['Outfit']">ResumeAI</span>
            </div>
            <p className="text-gray-500 text-sm">© 2026 ResumeAI. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
