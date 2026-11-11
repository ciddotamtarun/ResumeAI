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
