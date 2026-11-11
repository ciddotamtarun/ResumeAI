'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileText,
  Save,
  RotateCcw,
  ShieldCheck,
  Building2,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

export interface JobTemplate {
  title: string;
  category: string;
  company: string;
  requiredSkills: string[];
  optionalSkills: string[];
  description: string;
  aliases?: string[];
}

export const JOB_CATEGORIES: { category: string; roles: JobTemplate[] }[] = [
  {
    category: '💻 Technology',
    roles: [
      {
        title: 'Frontend Developer',
        category: 'Technology',
        company: 'CloudDesign Studio',
        aliases: ['Frontend React Developer', 'React Developer'],
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Next.js'],
        optionalSkills: ['Tailwind CSS', 'Redux', 'Framer Motion', 'Web Accessibility (WCAG)', 'Jest'],
        description: `Join our team to build accessible, high-performance web applications using React and Next.js. Must have strong foundations in TypeScript, responsive CSS, and state management. Familiarity with UI animation libraries and component-driven development is a bonus.`,
      },
      {
        title: 'Backend Developer',
        category: 'Technology',
        company: 'FinScale Solutions',
        aliases: ['Python Backend Developer', 'Node Backend Developer'],
        requiredSkills: ['Python', 'Django', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker'],
        optionalSkills: ['Kubernetes', 'Celery', 'Redis', 'Kafka', 'Microservices'],
        description: `Seeking a skilled Python Backend Developer to design high-throughput APIs using FastAPI and Django. Strong mastery of SQL and PostgreSQL schema optimization required. Knowledge of message queues (Kafka, Celery) and containerization with Docker is highly valued.`,
      },
      {
        title: 'Full Stack Developer',
        category: 'Technology',
        company: 'TechCorp Innovations',
        aliases: ['Full Stack Engineer'],
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Git'],
        optionalSkills: ['Docker', 'AWS', 'GraphQL', 'Tailwind CSS', 'Redis'],
        description: `We are looking for a Full Stack Developer proficient in React, Node.js, and TypeScript. You will architect robust REST APIs, manage PostgreSQL databases, and build sleek user interfaces. Experience with Docker, AWS, and modern CI/CD pipelines is a strong plus.`,
      },
      {
        title: 'Data Scientist',
        category: 'Technology',
        company: 'DataVista Analytics',
        requiredSkills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistical Modeling', 'Pandas'],
        optionalSkills: ['Scikit-Learn', 'TensorFlow', 'Data Visualization', 'Tableau', 'A/B Testing'],
        description: `Seeking a Data Scientist to analyze complex datasets, build predictive models, and deliver business intelligence insights. Strong proficiency in Python, statistical analysis, and machine learning algorithms is required.`,
      },
      {
        title: 'ML / AI Engineer',
        category: 'Technology',
        company: 'Nexus Intelligence',
        aliases: ['Data & AI Engineer', 'AI Engineer'],
        requiredSkills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Data Pipelines', 'Deep Learning'],
        optionalSkills: ['PyTorch', 'TensorFlow', 'Snowflake', 'BigQuery', 'Apache Spark', 'LLMs'],
        description: `Looking for an ML / AI Engineer to build scalable data processing pipelines and deploy machine learning models. Deep proficiency in Python and SQL is essential, alongside hands-on experience with Pandas and modern AI toolkits.`,
      },
      {
        title: 'DevOps Engineer',
        category: 'Technology',
        company: 'InfraScale Cloud Systems',
        requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS', 'Terraform'],
        optionalSkills: ['Ansible', 'Prometheus', 'Grafana', 'Bash Scripting', 'GCP', 'GitHub Actions'],
        description: `We are looking for a DevOps Engineer to manage multi-cloud infrastructure, maintain CI/CD automation pipelines, and optimize containerized microservices deployments with Kubernetes and Terraform.`,
      },
      {
        title: 'Mobile Developer',
        category: 'Technology',
        company: 'AppVenture Mobile',
        requiredSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX', 'REST APIs'],
        optionalSkills: ['iOS SDK', 'Android Studio', 'GraphQL', 'App Store Deployment', 'Firebase'],
        description: `Join our mobile team to develop native and cross-platform mobile applications for iOS and Android. Must have hands-on experience with mobile architectures, offline storage, push notifications, and App Store releases.`,
      },
      {
        title: 'QA / Test Engineer',
        category: 'Technology',
        company: 'QualityFirst Labs',
        requiredSkills: ['Test Automation', 'Selenium', 'Cypress', 'JavaScript', 'Python', 'API Testing'],
        optionalSkills: ['Jest', 'Playwright', 'Postman', 'Performance Testing', 'Jira', 'CI/CD'],
        description: `Seeking a QA / Test Engineer to design comprehensive test suites, automate end-to-end regression workflows, and conduct load and API validation across our web and mobile applications.`,
      },
      {
        title: 'Cybersecurity',
        category: 'Technology',
        company: 'SecureShield Defense',
        requiredSkills: ['Network Security', 'Penetration Testing', 'SIEM', 'Vulnerability Assessment', 'Firewalls', 'Incident Response'],
        optionalSkills: ['SOC Analysis', 'OWASP Top 10', 'Wireshark', 'ISO 27001', 'Cryptography', 'CISSP'],
        description: `We are seeking a Cybersecurity Analyst/Engineer to monitor threat intelligence, conduct vulnerability scans, manage firewalls, and maintain zero-trust organizational security posture.`,
      },
      {
        title: 'Product Manager',
        category: 'Technology',
        company: 'Apex Velocity Labs',
        requiredSkills: ['Product Strategy', 'Agile / Scrum', 'Roadmap Planning', 'User Research', 'PRD Authoring', 'Cross-Functional Leadership'],
        optionalSkills: ['Jira', 'Figma', 'Data Analytics', 'A/B Testing', 'Stakeholder Management', 'Mixpanel'],
        description: `Looking for a Product Manager to define product visions, prioritize sprint backlogs, analyze user analytics, and collaborate across design and engineering teams to launch high-impact features.`,
      },
    ],
  },
  {
    category: '📊 Business & Finance',
    roles: [
      {
        title: 'Business Analyst',
        category: 'Business & Finance',
        company: 'StratEdge Consulting',
        requiredSkills: ['Business Requirements', 'Process Mapping', 'SQL', 'Data Analysis', 'Stakeholder Interviews', 'Excel'],
        optionalSkills: ['Tableau', 'Power BI', 'UML Diagrams', 'BPMN', 'Agile', 'Jira'],
        description: `Seeking a Business Analyst to bridge business stakeholders and engineering teams. Responsibilities include gathering technical requirements, documenting user stories, and modeling business workflows.`,
      },
      {
        title: 'Financial Analyst',
        category: 'Business & Finance',
        company: 'Horizon Wealth Management',
        requiredSkills: ['Financial Modeling', 'Forecasting', 'Excel Advanced', 'Financial Statements', 'Valuation', 'Budgeting'],
        optionalSkills: ['SQL', 'Python', 'Power BI', 'Bloomberg Terminal', 'ERP Systems', 'SAP'],
        description: `We are hiring a Financial Analyst to analyze financial performance, build forecasting models, perform variance analysis, and support strategic investment and annual budgeting decisions.`,
      },
      {
        title: 'Marketing Manager',
        category: 'Business & Finance',
        company: 'GrowthPulse Media',
        requiredSkills: ['Digital Marketing', 'Campaign Strategy', 'SEO / SEM', 'Content Marketing', 'Social Media Strategy', 'Google Analytics'],
        optionalSkills: ['HubSpot', 'Email Marketing', 'Marketing Automation', 'Copywriting', 'PPC Advertising'],
        description: `Looking for a dynamic Marketing Manager to lead multichannel acquisition campaigns, optimize conversion funnels, oversee brand positioning, and drive customer acquisition.`,
      },
      {
        title: 'Sales Executive',
        category: 'Business & Finance',
        company: 'Enterprise Dynamics',
        requiredSkills: ['B2B Sales', 'Lead Generation', 'Client Relationship Management', 'Sales Pipeline', 'Negotiation', 'CRM Tools'],
        optionalSkills: ['Salesforce', 'Cold Outreach', 'Contract Closing', 'Account Management', 'Product Demos'],
        description: `Seeking a results-driven Sales Executive to prospect high-value enterprise accounts, conduct consultative sales pitches, navigate contract negotiations, and meet revenue targets.`,
      },
      {
        title: 'HR Manager',
        category: 'Business & Finance',
        company: 'PeopleForward Talent',
        requiredSkills: ['Talent Acquisition', 'Employee Relations', 'HR Policies', 'Performance Management', 'Onboarding', 'Labor Laws'],
        optionalSkills: ['HRIS Systems', 'Workday', 'Organizational Development', 'Conflict Resolution', 'Benefits Administration'],
        description: `Looking for an HR Manager to oversee full-cycle recruitment, foster inclusive workplace culture, implement HR compliance standards, and drive employee engagement and retention.`,
      },
      {
        title: 'Operations Manager',
        category: 'Business & Finance',
        company: 'GlobalLogix Operations',
        requiredSkills: ['Process Optimization', 'Supply Chain Management', 'Operational Efficiency', 'Team Leadership', 'Resource Allocation', 'KPI Tracking'],
        optionalSkills: ['Lean Six Sigma', 'Vendor Management', 'Logistics', 'Budget Oversight', 'ERP Systems'],
        description: `We need an Operations Manager to streamline organizational workflows, manage day-to-day facilities and logistics, minimize operational bottlenecks, and ensure standard operating procedures.`,
      },
      {
        title: 'Project Manager',
        category: 'Business & Finance',
        company: 'OmniProject Delivery',
        requiredSkills: ['Project Planning', 'Agile / Scrum', 'Budget Management', 'Risk Management', 'Milestone Tracking', 'Stakeholder Communication'],
        optionalSkills: ['PMP Certification', 'Jira', 'Asana', 'Gantt Charts', 'Resource Leveling', 'Scrum Master'],
        description: `Seeking a certified Project Manager to coordinate cross-functional project deliverables, manage risk registers and timelines, track project expenditures, and ensure on-time delivery.`,
      },
      {
        title: 'Accountant',
        category: 'Business & Finance',
        company: 'Premier Ledger & Co.',
        requiredSkills: ['General Ledger', 'Accounts Payable / Receivable', 'Financial Reporting', 'Reconciliation', 'Tax Compliance', 'Excel'],
        optionalSkills: ['QuickBooks', 'SAP', 'Xero', 'Auditing', 'CPA', 'Payroll Processing'],
        description: `Looking for an Accountant to manage balance sheet reconciliations, execute monthly financial close procedures, review accounts payable/receivable, and prepare tax filings.`,
      },
    ],
  },
  {
    category: '🎨 Design & Creative',
    roles: [
      {
        title: 'UI/UX Designer',
        category: 'Design & Creative',
        company: 'PixelCraft Design',
        requiredSkills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Usability Testing'],
        optionalSkills: ['Adobe XD', 'Sketch', 'Micro-interactions', 'Information Architecture', 'CSS Basics', 'Design Thinking'],
        description: `Seeking a UI/UX Designer to craft human-centered digital experiences. You will conduct user interviews, build wireframes and interactive prototypes in Figma, and maintain design systems.`,
      },
      {
        title: 'Graphic Designer',
        category: 'Design & Creative',
        company: 'BrandVibe Studio',
        requiredSkills: ['Adobe Photoshop', 'Adobe Illustrator', 'Branding & Identity', 'Typography', 'Visual Composition', 'Digital Media'],
        optionalSkills: ['InDesign', 'After Effects', 'Print Production', 'Vector Illustration', 'Marketing Collateral'],
        description: `We are looking for a Graphic Designer to produce marketing assets, brand identities, digital illustrations, and social media visuals that communicate cohesive brand narratives.`,
      },
      {
        title: 'Product Designer',
        category: 'Design & Creative',
        company: 'Elevate Products',
        requiredSkills: ['Product Thinking', 'Figma', 'UI/UX Design', 'Design Systems', 'Interaction Design', 'User Journey Mapping'],
        optionalSkills: ['Rapid Prototyping', 'Design Strategy', 'User Testing', 'Frontend Basics', 'Design Tokens'],
        description: `Looking for a Product Designer to partner with product managers and engineers to solve user problems, map customer journeys, and design end-to-end software product workflows.`,
      },
      {
        title: 'Content Writer',
        category: 'Design & Creative',
        company: 'Verve Wordsmiths',
        requiredSkills: ['Content Writing', 'SEO Optimization', 'Blog Posts', 'Research & Fact-Checking', 'Editorial Strategy', 'Editing & Proofreading'],
        optionalSkills: ['WordPress', 'Content Strategy', 'Keyword Research', 'Social Media Writing', 'CMS Platforms'],
        description: `Seeking a Content Writer to write engaging articles, guides, whitepapers, and web content. Must have a strong command of SEO best practices, research, and audience storytelling.`,
      },
      {
        title: 'Copywriter',
        category: 'Design & Creative',
        company: 'AdSpark Creative',
        requiredSkills: ['Ad Copywriting', 'Conversion Copy', 'Headlines & Taglines', 'Landing Page Copy', 'Brand Voice', 'Persuasive Writing'],
        optionalSkills: ['Email Campaigns', 'A/B Test Copy', 'Sales Pages', 'Social Ad Copy', 'Creative Concepts'],
        description: `We are hiring a Copywriter to write high-converting ad copy, landing pages, email marketing sequences, and product campaign taglines that drive customer engagement and conversions.`,
      },
    ],
  },
  {
    category: '📚 Education & Research',
    roles: [
      {
        title: 'Teacher / Educator',
        category: 'Education & Research',
        company: 'BrightMind Academy',
        requiredSkills: ['Curriculum Design', 'Lesson Planning', 'Classroom Management', 'Student Assessment', 'Pedagogical Methods', 'Communication'],
        optionalSkills: ['Educational Technology', 'Blended Learning', 'Differentiated Instruction', 'Parent Communication', 'Learning Management Systems (LMS)'],
        description: `Looking for an Educator to deliver engaging instructional curricula, evaluate student learning progress, facilitate interactive learning sessions, and adapt materials for diverse student needs.`,
      },
      {
        title: 'Research Analyst',
        category: 'Education & Research',
        company: 'Institute for Applied Research',
        requiredSkills: ['Qualitative & Quantitative Research', 'Literature Review', 'Data Collection', 'Statistical Analysis', 'Report Writing', 'Critical Thinking'],
        optionalSkills: ['SPSS', 'Survey Design', 'Peer-Reviewed Publication', 'Data Visualization', 'Interviewing Techniques'],
        description: `Seeking a Research Analyst to synthesize primary and secondary literature, formulate investigative hypotheses, conduct rigorous surveys and data analysis, and publish findings.`,
      },
      {
        title: 'Data Analyst',
        category: 'Education & Research',
        company: 'MetricFlow Insights',
        requiredSkills: ['SQL', 'Excel', 'Data Visualization', 'Tableau', 'Power BI', 'Data Cleaning'],
        optionalSkills: ['Python', 'R', 'ETL Processes', 'Statistical Analysis', 'Dashboard Design', 'Business Intelligence'],
        description: `We are looking for a Data Analyst to extract business data using SQL, clean raw datasets, design interactive Tableau/Power BI executive dashboards, and translate metrics into business actions.`,
      },
    ],
  },
];

export const SAMPLE_JOBS: JobTemplate[] = JOB_CATEGORIES.flatMap((c) => c.roles);

export interface SavedJobMatch {
  id: string;
  date: string;
  resumeId: string;
  resumeName: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedCount: number;
  missingCount: number;
}

export default function JobMatcherPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [optionalSkillsInput, setOptionalSkillsInput] = useState('');

  // Match Results
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingRequired, setMissingRequired] = useState<string[]>([]);
  const [missingOptional, setMissingOptional] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume');
      const list: Resume[] = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
      }
    } catch {
      toast.error('Failed to load resumes');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
  }, [isAuthenticated, fetchResumes]);

  const handleSelectTemplate = (tpl: JobTemplate) => {
    setSelectedPreset(tpl.title);
    setJobTitle(tpl.title);
    setCompany(tpl.company);
    setJobDescription(tpl.description);
    setRequiredSkillsInput(tpl.requiredSkills.join(', '));
    setOptionalSkillsInput(tpl.optionalSkills.join(', '));
    setHasAnalyzed(false);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenTitle = e.target.value;
    setSelectedPreset(chosenTitle);
    if (!chosenTitle) return;
    const found = SAMPLE_JOBS.find(
      (tpl) =>
        tpl.title === chosenTitle ||
        (tpl.aliases && tpl.aliases.some((a) => a.toLowerCase() === chosenTitle.toLowerCase()))
    );
    if (found) {
      handleSelectTemplate(found);
    }
  };

  const selectedResume = resumes.find((r) => r._id === selectedResumeId) || resumes[0];

  const runJobMatch = () => {
    if (!selectedResume) {
      toast.error('Please upload or select a resume first');
      return;
    }

    const resumeKeywords = (selectedResume.analysis?.keywords || []).map((k) => k.toLowerCase());
    const rawTextLower = (selectedResume.rawText || '').toLowerCase();

    const reqList = requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const optList = optionalSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (reqList.length === 0 && optList.length === 0) {
      toast.error('Please provide at least one required or optional skill');
      return;
    }

    const checkHasSkill = (skill: string) => {
      const s = skill.toLowerCase();
      // Match exact keyword or occurrence in rawText
      if (resumeKeywords.some((k) => k.includes(s) || s.includes(k))) return true;
      const regex = new RegExp(`\\b${s}\\b`, 'i');
      return regex.test(rawTextLower);
    };

    const matched: string[] = [];
    const missingReq: string[] = [];
    const missingOpt: string[] = [];

    reqList.forEach((skill) => {
      if (checkHasSkill(skill)) {
        matched.push(skill);
      } else {
        missingReq.push(skill);
      }
    });

    optList.forEach((skill) => {
      if (checkHasSkill(skill)) {
        matched.push(skill);
      } else {
        missingOpt.push(skill);
      }
    });

    // Weighted explainable match score
    const reqWeight = reqList.length > 0 ? (matched.filter((s) => reqList.includes(s)).length / reqList.length) * 70 : 70;
    const optWeight = optList.length > 0 ? (matched.filter((s) => optList.includes(s)).length / optList.length) * 30 : 30;
    const finalScore = Math.min(100, Math.round(reqWeight + optWeight));

    // Dynamic recommendations
    const recs: string[] = [];
    if (missingReq.length > 0) {
      recs.push(
        `Critical: Add explicit experience with ${missingReq.slice(0, 3).join(', ')} to your work experience or projects.`
      );
    }
    if (missingOpt.length > 0) {
      recs.push(
        `Secondary: Highlighting familiarity with ${missingOpt.slice(0, 2).join(' and ')} will boost candidate ranking for ${jobTitle}.`
      );
    }
    if (finalScore >= 80) {
      recs.push(
        'Your profile shows high alignment with this role. Proceed to practice tailored interview questions in Interview Lab.'
      );
    } else {
      recs.push(
        'Take objective SkillProof assessments to verify competencies and validate capabilities on your profile.'
      );
    }

    setMatchedSkills(matched);
    setMissingRequired(missingReq);
    setMissingOptional(missingOpt);
    setMatchScore(finalScore);
    setRecommendations(recs);
    setHasAnalyzed(true);

    toast.success(`Job Match analysis complete! Score: ${finalScore}%`);
  };

  const saveMatchResult = () => {
    if (!hasAnalyzed || !selectedResume) return;

    try {
      const stored = localStorage.getItem('resumeai_job_matches');
      const matches: SavedJobMatch[] = stored ? JSON.parse(stored) : [];

      const newMatch: SavedJobMatch = {
        id: `match_${Date.now()}`,
        date: new Date().toISOString(),
        resumeId: selectedResume._id,
        resumeName: selectedResume.fileName,
        jobTitle,
        company: company || 'Custom Role',
        matchScore,
        matchedCount: matchedSkills.length,
        missingCount: missingRequired.length + missingOptional.length,
      };

      const updated = [newMatch, ...matches.filter((m) => m.jobTitle !== jobTitle)];
      localStorage.setItem('resumeai_job_matches', JSON.stringify(updated));
      toast.success('Job Match result saved to History!');
    } catch {
      toast.error('Failed to save match result');
    }
  };

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-4 w-4 text-[#4F46D8]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">Job Matcher</span>
        </div>
        <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
          Targeted Job Description Matcher
        </h1>
        <p className="text-xs text-[#77798B] mt-0.5">
          Benchmark your resume against target roles to identify matching skills, critical gaps, and ATS readiness
        </p>
      </div>

      {/* ─── Top Controls & Template Presets ──────────────────────────────── */}
      <div className="mb-6 rounded-2xl p-4 sm:p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#171A35]">1. Select Resume:</span>
            {resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  setHasAnalyzed(false);
                }}
                className="text-xs font-semibold bg-[#FAF8F1] border border-[#E7E1D4] rounded-lg px-3 py-1.5 text-[#171A35]"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fileName} ({r.analysis?.overallScore || 0} pts)
                  </option>
                ))}
              </select>
            ) : (
              <Link href="/resume-studio" className="text-xs text-[#4F46D8] font-bold hover:underline">
                Upload a resume first +
              </Link>
            )}
          </div>

          <div className="text-xs text-[#77798B]">
            {selectedResume?.analysis?.keywords?.length || 0} skills detected in active resume
          </div>
        </div>

        {/* Preset job templates */}
        <div className="pt-3 border-t border-[#E7E1D4]">
          <label
            htmlFor="quick-job-presets"
            className="text-[11px] font-bold text-[#77798B] uppercase tracking-wider block mb-1.5"
          >
            Select a Job Role
          </label>
          <div className="relative max-w-md">
            <select
              id="quick-job-presets"
              value={selectedPreset}
              onChange={handlePresetChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs font-semibold text-[#171A35] focus:outline-none focus:border-[#4F46D8] transition-colors cursor-pointer appearance-none pr-10"
              aria-label="Select a Job Role"
            >
              <option value="">Choose a job role...</option>
              {JOB_CATEGORIES.map((cat) => (
                <optgroup key={cat.category} label={cat.category}>
                  {cat.roles.map((tpl) => (
                    <option key={tpl.title} value={tpl.title}>
                      {tpl.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#77798B]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Two-Column: Inputs vs Results ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#4F46D8]" />
              <span>Job Requirements Specification</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJobTitle(val);
                    const matchingPreset = SAMPLE_JOBS.find(
                      (tpl) =>
                        tpl.title.toLowerCase() === val.trim().toLowerCase() ||
                        (tpl.aliases && tpl.aliases.some((a) => a.toLowerCase() === val.trim().toLowerCase()))
                    );
                    setSelectedPreset(matchingPreset ? matchingPreset.title : '');
                    setHasAnalyzed(false);
                  }}
                  placeholder="e.g. Full Stack Developer, Frontend Developer"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] font-semibold focus:outline-none focus:border-[#4F46D8]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setHasAnalyzed(false);
                  }}
                  placeholder="e.g. TechCorp Innovations"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                Required Core Skills (comma-separated)
              </label>
              <input
                type="text"
                value={requiredSkillsInput}
                onChange={(e) => {
                  setRequiredSkillsInput(e.target.value);
                  setHasAnalyzed(false);
                }}
                placeholder="e.g. React, Python, PostgreSQL, Docker"
                className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                Optional / Preferred Skills (comma-separated)
              </label>
              <input
                type="text"
                value={optionalSkillsInput}
                onChange={(e) => {
                  setOptionalSkillsInput(e.target.value);
                  setHasAnalyzed(false);
                }}
                placeholder="e.g. AWS, Redis, GraphQL, Kubernetes"
                className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#77798B] uppercase mb-1">
                Job Description Text (or paste posting)
              </label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setHasAnalyzed(false);
                }}
                placeholder="Paste job description or select a preset above..."
                className="w-full px-3 py-2 rounded-xl border border-[#E7E1D4] bg-[#FAF8F1] text-xs text-[#171A35] focus:outline-none focus:border-[#4F46D8]"
              />
            </div>

            <button
              type="button"
              onClick={runJobMatch}
              className="w-full bg-[#4F46D8] hover:bg-[#4338CA] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calculate Job Match & Skill Gaps</span>
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-6 space-y-4">
          {!hasAnalyzed ? (
            <div className="rounded-2xl p-10 bg-[#FFFFFF] border border-[#E7E1D4] text-center shadow-xs flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-2xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#171A35] font-['Outfit'] mb-1">
                Ready to Compare
              </h3>
              <p className="text-xs text-[#77798B] max-w-sm mb-4 leading-relaxed">
                Click &quot;Calculate Job Match&quot; to cross-reference your resume against the required qualifications.
              </p>
              <button
                onClick={runJobMatch}
                className="bg-[#4F46D8] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Run Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score summary card */}
              <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#77798B]">
                      Overall Match Score
                    </span>
                    <h3 className="text-xl font-bold font-['Outfit'] text-[#171A35]">
                      {jobTitle}
                    </h3>
                  </div>
                  <button
                    onClick={saveMatchResult}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E1D4] text-xs font-bold text-[#4F46D8] hover:bg-[#F3F0FC] transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to History</span>
                  </button>
                </div>

                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-xs"
                    style={{
                      background: `${matchScore >= 75 ? '#168575' : matchScore >= 55 ? '#B7791F' : '#DC2626'}15`,
                      color: matchScore >= 75 ? '#168575' : matchScore >= 55 ? '#B7791F' : '#DC2626',
                    }}
                  >
                    <span className="text-2xl font-black font-['Outfit']">{matchScore}%</span>
                    <span className="text-[10px] font-bold uppercase">
                      {matchScore >= 75 ? 'Strong' : matchScore >= 55 ? 'Fair' : 'Low'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#171A35]">
                      {matchScore >= 75
                        ? 'High Alignment with Job Requirements'
                        : matchScore >= 55
                        ? 'Moderate Alignment — Gaps identified in core areas'
                        : 'Significant Skills Gap for this position'}
                    </p>
                    <p className="text-[11px] text-[#77798B]">
                      Matched {matchedSkills.length} of{' '}
                      {matchedSkills.length + missingRequired.length + missingOptional.length} key
                      technologies
                    </p>
                  </div>
                </div>
              </div>

              {/* Matching Skills */}
              <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#168575] flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Matched Skills ({matchedSkills.length})</span>
                  </span>
                  <span className="text-[11px] text-[#77798B]">Found in your resume</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-[#168575]/10 text-[#168575] text-xs font-semibold"
                      >
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#77798B]">No direct matches found.</span>
                  )}
                </div>
              </div>

              {/* Missing Required Skills */}
              {missingRequired.length > 0 && (
                <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#DC2626]/30 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#DC2626] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing Required Core Skills ({missingRequired.length})</span>
                    </span>
                    <span className="text-[11px] text-[#DC2626] font-semibold">Priority to address</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingRequired.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-[#DC2626]/10 text-[#DC2626] text-xs font-semibold"
                      >
                        ✕ {s}
                      </span>
                    ))}
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <p className="text-[11px] text-[#77798B]">
                      Do you have experience in any of these?
                    </p>
                    <Link href="/skillproof">
                      <button className="text-[11px] text-[#4F46D8] font-bold hover:underline flex items-center gap-1">
                        <span>Prove with SkillProof</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Missing Optional Skills */}
              {missingOptional.length > 0 && (
                <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#B7791F]/30 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#B7791F] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Missing Optional / Bonus Skills ({missingOptional.length})</span>
                    </span>
                    <span className="text-[11px] text-[#77798B]">Nice-to-have</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingOptional.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-[#B7791F]/10 text-[#B7791F] text-xs font-semibold"
                      >
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-[#171A35] uppercase tracking-wider">
                  Targeted Optimization Steps
                </h4>
                <div className="space-y-1.5 text-xs text-[#77798B]">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#4F46D8] font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
