import mongoose from 'mongoose';
import Roadmap, {
  IRoadmap,
  IRoadmapTask,
  IRoadmapPhase,
  IRoadmapSkillGap,
  IRoadmapProject,
  IRoadmapMilestone,
  IRoadmapPreferences,
  TaskStatus,
} from '../models/Roadmap.model';
import Assessment, { IAssessmentAttempt } from '../models/Assessment.model';
import Resume, { IResume } from '../models/Resume.model';

// ─── Curated Knowledge Base for Role Requirements & Learning Resources ──────

export interface RoleSkillProfile {
  title: string;
  category: string;
  requiredSkills: string[];
  optionalSkills: string[];
  certifications: Array<{
    name: string;
    issuingOrg: string;
    link: string;
    disclaimer: string;
  }>;
  projects: Array<{
    title: string;
    objective: string;
    requiredSkills: string[];
    milestones: string[];
    deliverables: string[];
    checklist: string[];
    resources: Array<{ title: string; url: string }>;
  }>;
}

export const ROLE_PROFILES: Record<string, RoleSkillProfile> = {
  'Full Stack Developer': {
    title: 'Full Stack Developer',
    category: 'Technology',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Git'],
    optionalSkills: ['Docker', 'AWS', 'GraphQL', 'Tailwind CSS', 'Redis', 'Next.js'],
    certifications: [
      {
        name: 'Meta Front-End & Back-End Developer Professional Certificates',
        issuingOrg: 'Meta / Coursera',
        link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        disclaimer: 'Independent external industry certification. Not issued directly by ElevateAI.',
      },
      {
        name: 'AWS Certified Developer – Associate',
        issuingOrg: 'Amazon Web Services',
        link: 'https://aws.amazon.com/certification/certified-developer-associate/',
        disclaimer: 'Industry-standard cloud credential requiring proctored examination by Pearson VUE.',
      },
    ],
    projects: [
      {
        title: 'Full-Stack Workflow Management Platform',
        objective: 'Architect, develop, and deploy an end-to-end task and workflow manager with relational persistence, JWT auth, and real-time updates.',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
        milestones: [
          'Design relational ERD schema with indexing on foreign keys',
          'Implement authenticated REST API with input validation and bcrypt',
          'Build responsive React + Tailwind frontend with optimistic UI updates',
          'Deploy containerized service with Docker and automated tests',
        ],
        deliverables: [
          'Live deployed web application',
          'GitHub repository with comprehensive README, architectural diagram, and API schema',
          'Test suite achieving >= 80% coverage on core business logic',
        ],
        checklist: [
          'PostgreSQL schema migration scripts configured',
          'JWT authentication with refresh tokens implemented',
          'CRUD endpoints for projects and tasks completed',
          'React frontend state management with optimistic mutations',
          'Automated CI/CD workflow running unit and integration tests',
        ],
        resources: [
          { title: 'React Official Documentation', url: 'https://react.dev/' },
          { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
          { title: 'PostgreSQL Tutorial & Architecture', url: 'https://www.postgresql.org/docs/' },
        ],
      },
    ],
  },

  'Backend Developer': {
    title: 'Backend Developer',
    category: 'Technology',
    requiredSkills: ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker', 'REST APIs'],
    optionalSkills: ['Django', 'Redis', 'Kafka', 'Kubernetes', 'Celery', 'Microservices'],
    certifications: [
      {
        name: 'Python Institute PCAP (Certified Associate in Python Programming)',
        issuingOrg: 'OpenEDG Python Institute',
        link: 'https://pythoninstitute.org/pcap',
        disclaimer: 'Official external credential verifying fundamental to intermediate Python design.',
      },
      {
        name: 'PostgreSQL 16 Associate DBA / Developer Certification',
        issuingOrg: 'EnterpriseDB / PostgreSQL Community',
        link: 'https://www.enterprisedb.com/training/postgresql-certification',
        disclaimer: 'Proctored database certification for relational indexing, vacuuming, and replication.',
      },
    ],
    projects: [
      {
        title: 'High-Throughput Distributed Rate Limiting & Analytics API',
        objective: 'Construct a resilient, containerized backend API capable of handling 5,000 requests/sec with Redis caching and SQL analytics.',
        requiredSkills: ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker', 'Redis'],
        milestones: [
          'Model database transactions with strict isolation and connection pooling',
          'Implement token-bucket rate limiting middleware using Redis',
          'Build asynchronous batch ingestion worker for request telemetry',
          'Benchmark query latency and containerize with multi-stage Dockerfile',
        ],
        deliverables: [
          'FastAPI application with OpenAPI / Swagger documentation',
          'Docker Compose manifest orchestrating API, Postgres, and Redis',
          'Locust / k6 benchmark report verifying < 20ms p95 latency',
        ],
        checklist: [
          'Asynchronous database sessions using asyncpg or SQLAlchemy 2.0',
          'Redis sliding-window rate limiter implemented',
          'Database indexes optimized using EXPLAIN ANALYZE',
          'Docker Compose local cluster verified',
        ],
        resources: [
          { title: 'FastAPI Tutorial & Guides', url: 'https://fastapi.tiangolo.com/' },
          { title: 'Redis Rate Limiter Patterns', url: 'https://redis.io/glossary/rate-limiting/' },
          { title: 'PostgreSQL Performance Optimization', url: 'https://use-the-index-luke.com/' },
        ],
      },
    ],
  },

  'Frontend Developer': {
    title: 'Frontend Developer',
    category: 'Technology',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Next.js'],
    optionalSkills: ['Tailwind CSS', 'Redux', 'Web Accessibility (WCAG)', 'Jest', 'Framer Motion'],
    certifications: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuingOrg: 'Meta / Coursera',
        link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        disclaimer: 'Comprehensive curriculum covering UI architectures, React patterns, and accessibility.',
      },
    ],
    projects: [
      {
        title: 'Component Library & Accessible Design System',
        objective: 'Build an open-source accessible React component system adhering to WCAG 2.1 AA specifications with unit testing and documentation.',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
        milestones: [
          'Build atomic design tokens (typography, colors, elevation, states)',
          'Implement accessible Dialog, Dropdown, and Data Table primitives with ARIA',
          'Publish interactive Storybook documentation with live controls',
          'Achieve 100% keyboard accessibility and screen-reader compliance',
        ],
        deliverables: [
          'Storybook catalog deployed to Vercel or GitHub Pages',
          'NPM-ready package structure with TypeScript declaration files',
          'Playwright automated accessibility regression audit',
        ],
        checklist: [
          'Focus trapping on modal dialogs verified',
          'ARIA expanded/selected states wired up correctly',
          'Keyboard navigation (Arrow, Tab, Escape) fully supported',
          'Jest / React Testing Library tests passing with 90%+ branch coverage',
        ],
        resources: [
          { title: 'MDN Web Docs — Accessibility', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility' },
          { title: 'WAI-ARIA Authoring Practices Guide', url: 'https://www.w3.org/WAI/ARIA/apg/' },
        ],
      },
    ],
  },

  'Data Scientist': {
    title: 'Data Scientist',
    category: 'Technology',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Statistical Modeling'],
    optionalSkills: ['Scikit-Learn', 'TensorFlow', 'Data Visualization', 'Tableau', 'BigQuery'],
    certifications: [
      {
        name: 'Google Advanced Data Analytics Professional Certificate',
        issuingOrg: 'Google',
        link: 'https://www.coursera.org/professional-certificates/google-advanced-data-analytics',
        disclaimer: 'Industry-recognized program focusing on predictive statistical models and Python.',
      },
    ],
    projects: [
      {
        title: 'Predictive Churn & Customer Lifetime Value Model',
        objective: 'Train and validate an interpretable machine learning model predicting user retention with feature engineering and business valuation.',
        requiredSkills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Scikit-Learn'],
        milestones: [
          'Extract and clean raw transactional data using complex SQL aggregations',
          'Conduct exploratory data analysis and feature correlation diagnosis',
          'Train XGBoost and Random Forest classifiers with cross-validation',
          'Interpret feature importances with SHAP values and present business ROI',
        ],
        deliverables: [
          'Reproducible Jupyter Notebook with documented hypotheses',
          'Interactive Streamlit or Gradio dashboard for scenario simulation',
          'Executive summary slide deck detailing findings and recommendations',
        ],
        checklist: [
          'Missing data and outlier handling documented',
          'Class imbalance resolved using stratified sampling / SMOTE',
          'ROC-AUC score evaluated against baseline heuristic models',
          'SHAP summary plots generated for model transparency',
        ],
        resources: [
          { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html' },
          { title: 'Pandas Official Documentation', url: 'https://pandas.pydata.org/docs/' },
        ],
      },
    ],
  },
};

// Fallback role configuration for any other role
export function getRoleProfile(targetRole: string): RoleSkillProfile {
  if (ROLE_PROFILES[targetRole]) {
    return ROLE_PROFILES[targetRole];
  }

  // Check case-insensitive match
  const lower = targetRole.toLowerCase();
  for (const key of Object.keys(ROLE_PROFILES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return ROLE_PROFILES[key];
    }
  }

  // Generic tech role fallback
  return {
    title: targetRole,
    category: 'Technology',
    requiredSkills: ['Core Problem Solving', 'Git', 'SQL', 'Architecture Fundamentals', 'Unit Testing'],
    optionalSkills: ['Cloud Platforms', 'Containerization', 'Performance Optimization'],
    certifications: [
      {
        name: `${targetRole} Professional Verification`,
        issuingOrg: 'ElevateAI SkillProof Lab',
        link: '/skillproof',
        disclaimer: 'Internal objective competence verification based on validated diagnostic assessments.',
      },
    ],
    projects: [
      {
        title: `${targetRole} Capstone Portfolio Project`,
        objective: `Design, implement, and document a production-ready application demonstrating core ${targetRole} proficiencies.`,
        requiredSkills: ['Core Problem Solving', 'Git', 'Architecture Fundamentals'],
        milestones: [
          'Requirements specification and system design',
          'Core feature implementation and state management',
          'Comprehensive automated testing and benchmarking',
          'Deployment and architecture documentation',
        ],
        deliverables: [
          'Working deployed repository',
          'Technical writeup explaining architectural tradeoffs',
        ],
        checklist: [
          'Clean Git commit history with semantic messages',
          'Unit tests passing',
          'Architecture README with system diagram',
        ],
        resources: [
          { title: 'GitHub Guides & Best Practices', url: 'https://docs.github.com/en/get-started' },
          { title: 'MDN Web Docs for Developers', url: 'https://developer.mozilla.org/' },
        ],
      },
    ],
  };
}

// Curated resource mapping for common tech skills
export const CURATED_SKILL_RESOURCES: Record<string, { title: string; url: string; source: string }> = {
  python: {
    title: 'Python Official Documentation & Tutorial',
    url: 'https://docs.python.org/3/tutorial/',
    source: 'Python Software Foundation',
  },
  javascript: {
    title: 'MDN JavaScript Guide & Modern ES6+',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    source: 'Mozilla Developer Network',
  },
  typescript: {
    title: 'TypeScript Official Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    source: 'Microsoft TypeScript Docs',
  },
  react: {
    title: 'React 19 Official Documentation & Hooks',
    url: 'https://react.dev/learn',
    source: 'React Official Docs',
  },
  'next.js': {
    title: 'Next.js App Router Documentation',
    url: 'https://nextjs.org/docs',
    source: 'Vercel Documentation',
  },
  sql: {
    title: 'PostgreSQL Official Documentation — Tutorial & Queries',
    url: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
    source: 'PostgreSQL Global Development Group',
  },
  postgresql: {
    title: 'PostgreSQL Indexing & Query Planning Guide',
    url: 'https://www.postgresql.org/docs/current/performance-tips.html',
    source: 'PostgreSQL Global Development Group',
  },
  docker: {
    title: 'Docker Getting Started Guide',
    url: 'https://docs.docker.com/get-started/',
    source: 'Docker Inc.',
  },
  git: {
    title: 'Pro Git Book (Official Reference)',
    url: 'https://git-scm.com/book/en/v2',
    source: 'Git SCM Community',
  },
  fastapi: {
    title: 'FastAPI Tutorial — User Guide',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    source: 'FastAPI Official Documentation',
  },
  'node.js': {
    title: 'Node.js Official API Reference & Architecture',
    url: 'https://nodejs.org/docs/latest/api/',
    source: 'OpenJS Foundation',
  },
  pandas: {
    title: 'Pandas User Guide & 10 Minutes to Pandas',
    url: 'https://pandas.pydata.org/docs/user_guide/index.html',
    source: 'Pandas Development Team',
  },
  'machine learning': {
    title: 'Scikit-Learn Machine Learning in Python',
    url: 'https://scikit-learn.org/stable/tutorial/index.html',
    source: 'Scikit-Learn Community',
  },
};

export function getResourceForSkill(skillName: string): { title: string; url: string; source: string; isOfficial: boolean } {
  const key = skillName.toLowerCase().trim();
  for (const [k, v] of Object.entries(CURATED_SKILL_RESOURCES)) {
    if (key.includes(k) || k.includes(key)) {
      return { ...v, isOfficial: true };
    }
  }

  // Fallback to trusted MDN or DevDocs
  return {
    title: `${skillName} Official Reference & Documentation`,
    url: `https://devdocs.io/#q=${encodeURIComponent(skillName)}`,
    source: 'DevDocs / Official Reference',
    isOfficial: true,
  };
}

// ─── SkillProof Domain Mapping Helper ────────────────────────────────────────

export function mapSkillToSkillProofDomain(skillName: string): { domainId: string; domainName: string } | null {
  const s = skillName.toLowerCase();
  if (s.includes('python')) return { domainId: 'python', domainName: 'Python Core & Architecture' };
  if (s.includes('sql') || s.includes('postgres') || s.includes('database')) {
    return { domainId: 'sql', domainName: 'SQL & Relational Databases' };
  }
  if (s.includes('react') || s.includes('next')) return { domainId: 'react', domainName: 'React & Modern UI' };
  if (s.includes('javascript') || s.includes('typescript') || s.includes('js') || s.includes('ts')) {
    return { domainId: 'javascript', domainName: 'JavaScript & TypeScript' };
  }
  if (s.includes('docker') || s.includes('container') || s.includes('devops') || s.includes('k8s')) {
    return { domainId: 'docker', domainName: 'Docker & Containerization' };
  }
  if (s.includes('algorithm') || s.includes('dsa') || s.includes('data structure')) {
    return { domainId: 'algorithms', domainName: 'Algorithms & Problem Solving' };
  }
  if (s.includes('git')) return { domainId: 'git', domainName: 'Git & Version Control' };
  return null;
}

// ─── Core Service Methods ───────────────────────────────────────────────────

export class RoadmapService {
  /**
   * Generates or regenerates a personalized roadmap using real user data:
   * - Latest analyzed resume text and parsed skills
   * - Target role requirements (required vs optional)
   * - Actual SkillProof assessment scores and attempts
   * - Past mock interview performance
   * - User's study preferences (days, daily hours)
   * - Preserves completed tasks and custom items across regenerations!
   */
  public static async generatePersonalizedRoadmap(
    userId: string,
    targetRoleInput?: string,
    preferencesInput?: Partial<IRoadmapPreferences>,
    preserveExistingTasks: boolean = true
  ): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch user's latest resume
    const latestResume = await Resume.findOne({ userId: userObjectId }).sort({ createdAt: -1 });

    // 2. Fetch all user's SkillProof assessment attempts
    const attempts = await Assessment.find({ userId: userObjectId }).sort({ createdAt: -1 });

    // 3. Resolve target role
    const targetRole =
      (targetRoleInput || '').trim() ||
      latestResume?.targetRole ||
      'Full Stack Developer';

    const roleProfile = getRoleProfile(targetRole);

    // 4. Resolve study preferences
    const preferences: IRoadmapPreferences = {
      studyDays: preferencesInput?.studyDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dailyMinutes: preferencesInput?.dailyMinutes || 60,
      preferredHours: preferencesInput?.preferredHours || 'Evening (7:00 PM - 8:30 PM)',
      targetCompletionDate: preferencesInput?.targetCompletionDate
        ? new Date(preferencesInput.targetCompletionDate)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Default 60 days
    };

    // 5. Existing roadmap check (to preserve completed items)
    const existingRoadmap = await Roadmap.findOne({ userId: userObjectId });
    const completedTaskIds = new Set<string>();
    const customTasks: IRoadmapTask[] = [];

    if (existingRoadmap && preserveExistingTasks) {
      existingRoadmap.tasks.forEach((t: IRoadmapTask) => {
        if (t.status === 'completed') {
          completedTaskIds.add(t.id);
        }
        if (t.isCustom) {
          customTasks.push(t);
        }
      });
    }

    // 6. Resume skill inventory
    const resumeSkills = new Set<string>(
      ((latestResume as any)?.analysis?.keywords || []).map((s: string) => s.toLowerCase().trim())
    );
    const resumeTextLower = (latestResume?.rawText || '').toLowerCase();

    // 7. Assessment score mapping per domain/skill
    interface SkillAssessmentSummary {
      attemptsCount: number;
      latestScore: number;
      passed: boolean;
      weakTopics: string[];
      firstScore: number;
      improved: boolean;
    }

    const assessmentMap = new Map<string, SkillAssessmentSummary>();
    // Group attempts by domain/skill
    for (const att of attempts) {
      const key = (att.skillName || att.domainName || att.assessmentId).toLowerCase();
      const existing = assessmentMap.get(key);
      if (!existing) {
        assessmentMap.set(key, {
          attemptsCount: 1,
          latestScore: att.score,
          passed: att.passed,
          weakTopics: att.weakTopics || [],
          firstScore: att.score,
          improved: false,
        });
      } else {
        existing.attemptsCount += 1;
        existing.firstScore = att.score; // Since sorted desc, older attempts update firstScore
        existing.improved = existing.latestScore > existing.firstScore;
        if (att.weakTopics && att.weakTopics.length > 0) {
          existing.weakTopics = Array.from(new Set([...existing.weakTopics, ...att.weakTopics]));
        }
      }
    }

    // 8. Synthesize Skill Gaps
    const skillGaps: IRoadmapSkillGap[] = [];
    const allRoleSkills = [
      ...roleProfile.requiredSkills.map((s) => ({ name: s, isRequired: true })),
      ...roleProfile.optionalSkills.map((s) => ({ name: s, isRequired: false })),
    ];

    for (const item of allRoleSkills) {
      const skillLower = item.name.toLowerCase();
      const inResume =
        resumeSkills.has(skillLower) ||
        resumeTextLower.includes(skillLower);

      // Match assessment
      let assessmentSummary: SkillAssessmentSummary | undefined;
      for (const [k, v] of assessmentMap.entries()) {
        if (k.includes(skillLower) || skillLower.includes(k)) {
          assessmentSummary = v;
          break;
        }
      }

      let category: IRoadmapSkillGap['category'] = 'required';
      let importance: IRoadmapSkillGap['importance'] = item.isRequired ? 'high' : 'medium';
      let reason = '';
      const isDemonstrated = !!assessmentSummary?.passed && assessmentSummary.latestScore >= 70;

      if (assessmentSummary) {
        if (assessmentSummary.improved) {
          category = 'improved';
          importance = 'medium';
          reason = `Great progress! Your score in ${item.name} improved from ${assessmentSummary.firstScore}% to ${assessmentSummary.latestScore}%. Continue practicing advanced topics.`;
        } else if (!assessmentSummary.passed || assessmentSummary.latestScore < 70) {
          category = 'low_score';
          importance = 'high';
          const weakStr =
            assessmentSummary.weakTopics.length > 0
              ? ` Focus areas: ${assessmentSummary.weakTopics.slice(0, 3).join(', ')}.`
              : '';
          reason = `Latest SkillProof assessment score is ${assessmentSummary.latestScore}% (below 70% threshold).${weakStr}`;
        } else {
          category = 'required';
          reason = `Verified mastery (${assessmentSummary.latestScore}%). Keep this skill fresh with real-world project tasks.`;
        }
      } else if (!inResume) {
        category = 'missing_evidence';
        importance = item.isRequired ? 'high' : 'medium';
        reason = `Important for ${targetRole}, but not found on your current resume. Learn concepts or add evidence if already practiced.`;
      } else {
        category = item.isRequired ? 'required' : 'optional';
        reason = item.isRequired
          ? `Present on your resume. Complete an objective SkillProof assessment to verify readiness.`
          : `Optional technology that provides a competitive edge for senior ${targetRole} positions.`;
      }

      skillGaps.push({
        skill: item.name,
        category,
        importance,
        reason,
        inResume,
        assessmentAttempted: !!assessmentSummary,
        latestScore: assessmentSummary ? assessmentSummary.latestScore : null,
        isDemonstrated,
        weakTopics: assessmentSummary?.weakTopics || [],
      });
    }

    // Sort skill gaps by priority: low_score & missing_evidence required skills first
    skillGaps.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        low_score: 1,
        missing_evidence: 2,
        required: 3,
        improved: 4,
        optional: 5,
      };
      return (priorityOrder[a.category] || 99) - (priorityOrder[b.category] || 99);
    });

    // 9. Structured Phases
    const phases: IRoadmapPhase[] = [
      {
        phaseId: 'phase_1',
        phaseNumber: 1,
        title: 'Phase 1: Foundations & Diagnostic Assessment',
        subtitle: 'Audit core prerequisites, establish ATS baseline, and run diagnostic technical assessments.',
        objectives: [
          'Audit existing resume ATS compatibility (score >= 80)',
          'Establish diagnostic baseline in core role languages',
          'Identify conceptual blind spots before writing production code',
        ],
        estimatedWeeks: 2,
        completionCriteria: 'Complete resume audit, run Job Matcher, and take initial diagnostic assessments.',
        dependencies: [],
      },
      {
        phaseId: 'phase_2',
        phaseNumber: 2,
        title: 'Phase 2: Core Technical Mastery & Verification',
        subtitle: 'Target your verified skill gaps with practical coding, SQL exercises, and retake weak assessments.',
        objectives: [
          'Deep-dive into highest priority skill gaps identified in SkillProof Lab',
          'Solve practical coding and database architecture exercises',
          'Achieve >= 70% demonstrated pass score on core domain assessments',
        ],
        estimatedWeeks: 3,
        completionCriteria: 'Pass core role technical round assessments and complete all scheduled practice tasks.',
        dependencies: ['phase_1'],
      },
      {
        phaseId: 'phase_3',
        phaseNumber: 3,
        title: 'Phase 3: High-Impact Portfolio Development',
        subtitle: 'Build and document a production-grade portfolio project that proves practical engineering competence.',
        objectives: [
          'Implement full capstone project meeting industry architecture standards',
          'Document system tradeoffs, ERD diagrams, and deployment pipelines',
          'Add quantified impact bullets to your updated resume draft',
        ],
        estimatedWeeks: 3,
        completionCriteria: 'Complete all capstone project checklist deliverables and document the repository.',
        dependencies: ['phase_2'],
      },
      {
        phaseId: 'phase_4',
        phaseNumber: 4,
        title: 'Phase 4: Technical Interview Readiness & Final Verification',
        subtitle: 'Conduct realistic AI mock interviews, master STAR behavioral narratives, and export career report.',
        objectives: [
          'Complete end-to-end technical round mock interview simulation',
          'Master STAR method for complex behavioral and leadership scenarios',
          'Review comprehensive final readiness evaluation and export progress report',
        ],
        estimatedWeeks: 2,
        completionCriteria: 'Achieve passing review in AI Mock Interview and generate final Readiness Report.',
        dependencies: ['phase_3'],
      },
    ];

    // 10. Synthesize Actionable Tasks
    const tasks: IRoadmapTask[] = [];

    // Phase 1 Tasks
    tasks.push({
      id: 'task_phase1_ats',
      phaseId: 'phase_1',
      title: 'Audit Resume ATS Score & Keywords for ' + targetRole,
      skill: 'Resume Optimization',
      objective: 'Ensure clean machine readability, high keyword density, and clear formatting for ATS scanners.',
      priority: 'high',
      estimatedMinutes: 45,
      taskType: 'concept',
      status: completedTaskIds.has('task_phase1_ats') ? 'completed' : 'todo',
      completedAt: completedTaskIds.has('task_phase1_ats') ? new Date() : null,
      recommendedResource: {
        title: 'Resume Studio — ATS Analyzer Guide',
        url: '/resume-studio',
        source: 'ElevateAI Platform',
        isOfficial: true,
      },
      completionCriteria: 'ATS health score >= 80% with no missing contact or formatting errors.',
      relatedAction: { href: '/resume-studio', label: 'Open Resume Studio' },
    });

    tasks.push({
      id: 'task_phase1_jobmatch',
      phaseId: 'phase_1',
      title: 'Run Job Matcher against ' + targetRole + ' Qualifications',
      skill: 'Role Matching',
      objective: 'Identify exact skill match percentage and keyword gaps against real job specifications.',
      priority: 'high',
      estimatedMinutes: 30,
      taskType: 'concept',
      status: completedTaskIds.has('task_phase1_jobmatch') ? 'completed' : 'todo',
      completedAt: completedTaskIds.has('task_phase1_jobmatch') ? new Date() : null,
      recommendedResource: {
        title: 'ElevateAI Job Matcher Tool',
        url: '/job-matcher',
        source: 'ElevateAI Platform',
        isOfficial: true,
      },
      completionCriteria: 'Compare your resume against the target role preset and save matching requirements.',
      relatedAction: { href: '/job-matcher', label: 'Run Job Matcher' },
    });

    // Add diagnostic assessment tasks for top 2 required skills
    const topRequired = roleProfile.requiredSkills.slice(0, 2);
    for (let i = 0; i < topRequired.length; i++) {
      const skillName = topRequired[i];
      const spDomain = mapSkillToSkillProofDomain(skillName);
      const taskId = `task_phase1_diag_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const isDone = completedTaskIds.has(taskId);

      tasks.push({
        id: taskId,
        phaseId: 'phase_1',
        title: `Take ${skillName} Baseline Diagnostic Assessment`,
        skill: skillName,
        objective: `Establish initial diagnostic score in ${skillName} fundamentals and identify knowledge gaps.`,
        priority: 'high',
        estimatedMinutes: 30,
        taskType: 'assessment',
        status: isDone ? 'completed' : 'todo',
        completedAt: isDone ? new Date() : null,
        recommendedResource: getResourceForSkill(skillName),
        completionCriteria: `Complete ${skillName} technical assessment in SkillProof Lab.`,
        relatedAction: {
          href: spDomain ? `/skillproof?domain=${spDomain.domainId}` : '/skillproof',
          label: 'Start Diagnostic',
          mode: 'fundamentals',
        },
      });
    }

    // Phase 2 Tasks: Generated dynamically from skill gaps!
    // Priority: skills with low_score or missing_evidence
    const focusGaps = skillGaps.filter(
      (g) => g.category === 'low_score' || g.category === 'missing_evidence' || (g.category === 'required' && !g.isDemonstrated)
    );

    const skillsToPlan = focusGaps.length > 0 ? focusGaps.slice(0, 4) : skillGaps.slice(0, 3);

    for (const gap of skillsToPlan) {
      const skillSlug = gap.skill.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const spDomain = mapSkillToSkillProofDomain(gap.skill);
      const res = getResourceForSkill(gap.skill);

      // Task A: Concept Review / Debugging
      const conceptId = `task_phase2_learn_${skillSlug}`;
      const isConceptDone = completedTaskIds.has(conceptId);

      const weakDetails =
        gap.weakTopics.length > 0
          ? ` Focus specifically on: ${gap.weakTopics.join(', ')}.`
          : '';

      tasks.push({
        id: conceptId,
        phaseId: 'phase_2',
        title: `Study ${gap.skill} Architecture & Core Principles`,
        skill: gap.skill,
        objective: `Master ${gap.skill} principles and patterns.${weakDetails}`,
        priority: gap.importance,
        estimatedMinutes: 60,
        taskType: gap.skill.toLowerCase().includes('sql') ? 'sql' : 'concept',
        status: isConceptDone ? 'completed' : 'todo',
        completedAt: isConceptDone ? new Date() : null,
        recommendedResource: res,
        completionCriteria: `Review official documentation chapters covering ${gap.skill} core concepts and design patterns.`,
        relatedAction: spDomain ? { href: `/skillproof?domain=${spDomain.domainId}`, label: 'Practice Topic' } : undefined,
      });

      // Task B: Verification Assessment
      const assessId = `task_phase2_verify_${skillSlug}`;
      const isAssessDone = completedTaskIds.has(assessId) || gap.isDemonstrated;

      tasks.push({
        id: assessId,
        phaseId: 'phase_2',
        title: `Verify ${gap.skill} Competence in SkillProof Lab`,
        skill: gap.skill,
        objective: `Achieve >= 70% passing score on ${gap.skill} assessment to convert this gap into a Demonstrated Skill.`,
        priority: 'high',
        estimatedMinutes: 30,
        taskType: 'assessment',
        status: isAssessDone ? 'completed' : 'todo',
        completedAt: isAssessDone ? new Date() : null,
        recommendedResource: res,
        completionCriteria: `Score 70% or higher on the official ${gap.skill} SkillProof assessment.`,
        relatedAction: {
          href: spDomain ? `/skillproof?domain=${spDomain.domainId}` : '/skillproof',
          label: gap.latestScore !== null ? 'Retake Assessment' : 'Take Assessment',
        },
      });
    }

    // Phase 3 Tasks: Project Implementation
    const defaultProj = roleProfile.projects[0];
    const projId1 = 'task_phase3_arch';
    tasks.push({
      id: projId1,
      phaseId: 'phase_3',
      title: `Architect ${defaultProj?.title || targetRole + ' Capstone Project'}`,
      skill: 'System Design',
      objective: 'Define ERD relational schema, API contracts, and component architecture for portfolio project.',
      priority: 'high',
      estimatedMinutes: 90,
      taskType: 'project',
      status: completedTaskIds.has(projId1) ? 'completed' : 'todo',
      completedAt: completedTaskIds.has(projId1) ? new Date() : null,
      recommendedResource: {
        title: 'System Architecture Design Guidelines',
        url: 'https://github.com/donnemartin/system-design-primer',
        source: 'Open Source Systems Primer',
        isOfficial: true,
      },
      completionCriteria: 'Produce architecture diagram, database schema, and endpoint documentation in README.',
      relatedAction: { href: '#projects', label: 'View Project Brief' },
    });

    const projId2 = 'task_phase3_build';
    tasks.push({
      id: projId2,
      phaseId: 'phase_3',
      title: `Implement Core Business Logic for ${targetRole} Project`,
      skill: roleProfile.requiredSkills[0] || 'Core Engineering',
      objective: 'Write clean, modular code with automated tests and secure authentication.',
      priority: 'high',
      estimatedMinutes: 120,
      taskType: 'coding',
      status: completedTaskIds.has(projId2) ? 'completed' : 'todo',
      completedAt: completedTaskIds.has(projId2) ? new Date() : null,
      recommendedResource: getResourceForSkill(roleProfile.requiredSkills[0] || 'javascript'),
      completionCriteria: 'All primary user stories functional with automated tests passing.',
      relatedAction: { href: '#projects', label: 'Project Checklist' },
    });

    // Phase 4 Tasks: Mock Interview & Final Readiness
    const intId1 = 'task_phase4_tech_interview';
    tasks.push({
      id: intId1,
      phaseId: 'phase_4',
      title: `Complete ${targetRole} Technical Round Simulation`,
      skill: 'Technical Communication',
      objective: 'Practice live problem breakdown, system design articulation, and trade-off justification with AI Interviewer.',
      priority: 'high',
      estimatedMinutes: 45,
      taskType: 'interview',
      status: completedTaskIds.has(intId1) ? 'completed' : 'todo',
      completedAt: completedTaskIds.has(intId1) ? new Date() : null,
      recommendedResource: {
        title: 'AI Mock Interview Simulator',
        url: '/interview',
        source: 'ElevateAI Platform',
        isOfficial: true,
      },
      completionCriteria: 'Complete multi-turn conversational technical interview and receive comprehensive evaluation review.',
      relatedAction: { href: '/interview', label: 'Launch Mock Interview' },
    });

    const intId2 = 'task_phase4_star_behavioral';
    tasks.push({
      id: intId2,
      phaseId: 'phase_4',
      title: 'Practice STAR Behavioral Narratives',
      skill: 'Behavioral Interviews',
      objective: 'Draft crisp Situation-Task-Action-Result answers for teamwork, conflict, and ownership scenarios.',
      priority: 'medium',
      estimatedMinutes: 45,
      taskType: 'interview',
      status: completedTaskIds.has(intId2) ? 'completed' : 'todo',
      completedAt: completedTaskIds.has(intId2) ? new Date() : null,
      recommendedResource: {
        title: 'STAR Method Interview Framework',
        url: '/interview',
        source: 'ElevateAI Platform',
        isOfficial: true,
      },
      completionCriteria: 'Practice behavioral interview category in Interview Lab.',
      relatedAction: { href: '/interview', label: 'Practice Behavioral' },
    });

    const reportId = 'task_phase4_final_report';
    tasks.push({
      id: reportId,
      phaseId: 'phase_4',
      title: 'Generate & Export Official Career Readiness Report',
      skill: 'Career Readiness',
      objective: 'Compile resume health score, verified SkillProof credentials, and interview feedback into an executive summary.',
      priority: 'medium',
      estimatedMinutes: 20,
      taskType: 'concept',
      status: completedTaskIds.has(reportId) ? 'completed' : 'todo',
      completedAt: completedTaskIds.has(reportId) ? new Date() : null,
      recommendedResource: {
        title: 'Career Readiness & Progress Reports',
        url: '/reports',
        source: 'ElevateAI Platform',
        isOfficial: true,
      },
      completionCriteria: 'Download verified Career Readiness Report.',
      relatedAction: { href: '/reports', label: 'View Reports' },
    });

    // Re-attach custom user tasks
    customTasks.forEach((ct) => {
      if (!tasks.some((t) => t.id === ct.id)) {
        tasks.push(ct);
      }
    });

    // 11. Schedule Tasks Across Weekly Calendar
    // Distribute uncompleted tasks to available study days this week
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIdx = now.getDay();
    const uncompletedTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped');

    let taskPointer = 0;
    // Map tasks to the next 7 days that match user's studyDays
    for (let offset = 0; offset < 14 && taskPointer < uncompletedTasks.length; offset++) {
      const targetDate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
      const dayName = dayNames[targetDate.getDay()];
      if (preferences.studyDays.includes(dayName)) {
        // Assign 1-2 tasks per study day
        if (taskPointer < uncompletedTasks.length && !uncompletedTasks[taskPointer].scheduledDate) {
          uncompletedTasks[taskPointer].scheduledDate = targetDate;
          taskPointer++;
        }
      }
    }

    // 12. Synthesize Projects
    const projects: IRoadmapProject[] = roleProfile.projects.map((p, idx) => ({
      id: `proj_${idx + 1}`,
      title: p.title,
      objective: p.objective,
      requiredSkills: p.requiredSkills,
      milestones: p.milestones,
      deliverables: p.deliverables,
      checklist: p.checklist.map((item) => ({ item, completed: false })),
      resources: p.resources,
      status: 'not_started',
    }));

    // 13. Synthesize Milestones
    const milestones: IRoadmapMilestone[] = [
      {
        id: 'ms_foundations',
        title: 'ATS & Diagnostic Foundation Established',
        description: 'Complete initial resume optimization and baseline diagnostic assessment.',
        type: 'foundation',
        completed: tasks.filter((t) => t.phaseId === 'phase_1' && t.status === 'completed').length >= 2,
        completedAt: null,
      },
      {
        id: 'ms_skillproof',
        title: 'Core Technical Competencies Demonstrated',
        description: 'Achieve >= 70% passing score in core role SkillProof technical round assessments.',
        type: 'assessment',
        completed: skillGaps.filter((g) => g.isDemonstrated).length >= 2,
        completedAt: null,
      },
      {
        id: 'ms_project',
        title: 'Production Capstone Project Shipped',
        description: 'Implement, test, and document your role-specific portfolio project on GitHub.',
        type: 'project',
        completed: tasks.filter((t) => t.phaseId === 'phase_3' && t.status === 'completed').length >= 2,
        completedAt: null,
      },
      {
        id: 'ms_interview',
        title: 'Technical Round Interview Clearance',
        description: 'Clear the AI Mock Interview simulation with passing score across technical and behavioral rubrics.',
        type: 'readiness',
        completed: tasks.filter((t) => t.phaseId === 'phase_4' && t.status === 'completed').length >= 2,
        completedAt: null,
      },
    ];

    // Add role certification guide milestone
    if (roleProfile.certifications.length > 0) {
      const topCert = roleProfile.certifications[0];
      milestones.push({
        id: 'ms_cert_guide',
        title: `Industry Certification Guide: ${topCert.name}`,
        description: `External certification preparation path issued by ${topCert.issuingOrg}.`,
        type: 'certification_guide',
        completed: false,
        completedAt: null,
        certificationInfo: topCert,
      });
    }

    // 14. Persist or Update Roadmap in MongoDB
    let savedRoadmap: IRoadmap;
    if (existingRoadmap) {
      existingRoadmap.targetRole = targetRole;
      existingRoadmap.resumeId = latestResume ? latestResume._id : undefined;
      existingRoadmap.preferences = preferences;
      existingRoadmap.skillGaps = skillGaps;
      existingRoadmap.phases = phases;
      existingRoadmap.tasks = tasks;
      existingRoadmap.projects = projects;
      existingRoadmap.milestones = milestones;
      existingRoadmap.analytics.lastCalculatedAt = new Date();
      savedRoadmap = await existingRoadmap.save();
    } else {
      savedRoadmap = await Roadmap.create({
        userId: userObjectId,
        targetRole,
        resumeId: latestResume ? latestResume._id : undefined,
        preferences,
        skillGaps,
        phases,
        tasks,
        projects,
        milestones,
        analytics: {
          totalHoursLogged: 0,
          lastCalculatedAt: new Date(),
        },
      });
    }

    return savedRoadmap;
  }

  /**
   * Fetches active roadmap or initializes one if none exists
   */
  public static async getActiveRoadmap(userId: string): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) {
      roadmap = await this.generatePersonalizedRoadmap(userId);
    }
    return roadmap;
  }

  /**
   * Updates task status, recalculating completion hours and milestone progress
   */
  public static async updateTaskStatus(
    userId: string,
    taskId: string,
    status: TaskStatus,
    notes?: string
  ): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) {
      throw new Error('Roadmap not found for user');
    }

    const task = roadmap.tasks.find((t: IRoadmapTask) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found in roadmap`);
    }

    const previousStatus = task.status;
    task.status = status;
    if (notes !== undefined) {
      task.notes = notes;
    }

    if (status === 'completed' && previousStatus !== 'completed') {
      task.completedAt = new Date();
      roadmap.analytics.totalHoursLogged += (task.estimatedMinutes || 45) / 60;
    } else if (status !== 'completed' && previousStatus === 'completed') {
      task.completedAt = null;
      roadmap.analytics.totalHoursLogged = Math.max(
        0,
        roadmap.analytics.totalHoursLogged - (task.estimatedMinutes || 45) / 60
      );
    }

    // Update milestone completions dynamically
    const phase1Done = roadmap.tasks.filter((t: IRoadmapTask) => t.phaseId === 'phase_1' && t.status === 'completed').length >= 2;
    const phase2Done = roadmap.tasks.filter((t: IRoadmapTask) => t.phaseId === 'phase_2' && t.status === 'completed').length >= 2;
    const phase3Done = roadmap.tasks.filter((t: IRoadmapTask) => t.phaseId === 'phase_3' && t.status === 'completed').length >= 2;
    const phase4Done = roadmap.tasks.filter((t: IRoadmapTask) => t.phaseId === 'phase_4' && t.status === 'completed').length >= 2;

    roadmap.milestones.forEach((m: IRoadmapMilestone) => {
      if (m.type === 'foundation') m.completed = phase1Done;
      if (m.type === 'assessment') m.completed = phase2Done;
      if (m.type === 'project') m.completed = phase3Done;
      if (m.type === 'readiness') m.completed = phase4Done;
    });

    roadmap.analytics.lastCalculatedAt = new Date();
    await roadmap.save();
    return roadmap;
  }

  /**
   * Adds a custom user-defined task to the roadmap
   */
  public static async addCustomTask(
    userId: string,
    taskData: {
      title: string;
      skill: string;
      objective?: string;
      phaseId?: string;
      priority?: 'high' | 'medium' | 'low';
      estimatedMinutes?: number;
      taskType?: IRoadmapTask['taskType'];
      scheduledDate?: Date;
      recommendedResource?: { title: string; url: string; source: string };
    }
  ): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    const newTask: IRoadmapTask = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phaseId: taskData.phaseId || 'phase_2',
      title: taskData.title.trim(),
      skill: (taskData.skill || 'General').trim(),
      objective: taskData.objective || 'Personal study goal',
      priority: taskData.priority || 'medium',
      estimatedMinutes: taskData.estimatedMinutes || 45,
      taskType: taskData.taskType || 'custom',
      status: 'todo',
      scheduledDate: taskData.scheduledDate || new Date(),
      completedAt: null,
      recommendedResource: taskData.recommendedResource || undefined,
      completionCriteria: 'User marked as completed',
      isCustom: true,
      notes: '',
    };

    roadmap.tasks.push(newTask);
    await roadmap.save();
    return roadmap;
  }

  /**
   * Updates task details (title, scheduledDate, notes, estimatedMinutes)
   */
  public static async updateTask(
    userId: string,
    taskId: string,
    updates: Partial<IRoadmapTask>
  ): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) throw new Error('Roadmap not found');

    const task = roadmap.tasks.find((t: IRoadmapTask) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (updates.title) task.title = updates.title;
    if (updates.objective) task.objective = updates.objective;
    if (updates.priority) task.priority = updates.priority;
    if (updates.estimatedMinutes) task.estimatedMinutes = updates.estimatedMinutes;
    if (updates.scheduledDate !== undefined) task.scheduledDate = updates.scheduledDate;
    if (updates.notes !== undefined) task.notes = updates.notes;
    if (updates.status) task.status = updates.status;

    await roadmap.save();
    return roadmap;
  }

  /**
   * Deletes custom task or marks standard task as skipped
   */
  public static async deleteTask(userId: string, taskId: string): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) throw new Error('Roadmap not found');

    const taskIdx = roadmap.tasks.findIndex((t: IRoadmapTask) => t.id === taskId);
    if (taskIdx === -1) throw new Error('Task not found');

    const task = roadmap.tasks[taskIdx];
    if (task.isCustom) {
      roadmap.tasks.splice(taskIdx, 1);
    } else {
      task.status = 'skipped';
    }

    await roadmap.save();
    return roadmap;
  }

  /**
   * Updates study schedule preferences (days, daily hours, target completion)
   */
  public static async updatePreferences(
    userId: string,
    preferences: Partial<IRoadmapPreferences>
  ): Promise<IRoadmap> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) throw new Error('Roadmap not found');

    if (preferences.studyDays) roadmap.preferences.studyDays = preferences.studyDays;
    if (preferences.dailyMinutes) roadmap.preferences.dailyMinutes = preferences.dailyMinutes;
    if (preferences.preferredHours) roadmap.preferences.preferredHours = preferences.preferredHours;
    if (preferences.targetCompletionDate !== undefined) {
      roadmap.preferences.targetCompletionDate = preferences.targetCompletionDate
        ? new Date(preferences.targetCompletionDate)
        : null;
    }

    await roadmap.save();
    return roadmap;
  }

  /**
   * Generates a structured exportable progress payload
   */
  public static async exportProgress(userId: string): Promise<any> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roadmap = await Roadmap.findOne({ userId: userObjectId });
    if (!roadmap) throw new Error('Roadmap not found');

    const totalTasks = roadmap.tasks.length;
    const completedTasks = roadmap.tasks.filter((t: IRoadmapTask) => t.status === 'completed');
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    const demonstratedSkills = roadmap.skillGaps.filter((g: IRoadmapSkillGap) => g.isDemonstrated);
    const pendingSkillGaps = roadmap.skillGaps.filter((g: IRoadmapSkillGap) => !g.isDemonstrated);

    return {
      exportedAt: new Date().toISOString(),
      targetRole: roadmap.targetRole,
      overallProgressPercent: overallProgress,
      totalHoursLogged: Math.round(roadmap.analytics.totalHoursLogged * 10) / 10,
      phasesSummary: roadmap.phases.map((p: IRoadmapPhase) => {
        const phaseTasks = roadmap.tasks.filter((t: IRoadmapTask) => t.phaseId === p.phaseId);
        const done = phaseTasks.filter((t: IRoadmapTask) => t.status === 'completed').length;
        return {
          phase: p.title,
          totalTasks: phaseTasks.length,
          completedTasks: done,
          percentage: phaseTasks.length > 0 ? Math.round((done / phaseTasks.length) * 100) : 0,
        };
      }),
      demonstratedSkills: demonstratedSkills.map((s: IRoadmapSkillGap) => ({
        skill: s.skill,
        score: s.latestScore,
      })),
      pendingSkillGaps: pendingSkillGaps.map((s: IRoadmapSkillGap) => ({
        skill: s.skill,
        category: s.category,
        importance: s.importance,
        reason: s.reason,
      })),
      completedTasks: completedTasks.map((t: IRoadmapTask) => ({
        title: t.title,
        skill: t.skill,
        completedAt: t.completedAt,
      })),
      upcomingTasks: roadmap.tasks
        .filter((t: IRoadmapTask) => t.status === 'todo' || t.status === 'in_progress')
        .slice(0, 5)
        .map((t: IRoadmapTask) => ({
          title: t.title,
          skill: t.skill,
          priority: t.priority,
          scheduledDate: t.scheduledDate,
        })),
      milestones: roadmap.milestones.map((m: IRoadmapMilestone) => ({
        title: m.title,
        status: m.completed ? 'Completed' : 'Pending',
      })),
    };
  }
}

export default RoadmapService;
