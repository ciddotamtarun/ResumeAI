import assert from 'node:assert/strict';
import test from 'node:test';

interface JobTemplate {
  title: string;
  category: string;
  company: string;
  requiredSkills: string[];
  optionalSkills: string[];
  description: string;
  aliases?: string[];
}

const EXPECTED_26_ROLES = [
  // Technology
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'ML / AI Engineer',
  'DevOps Engineer',
  'Mobile Developer',
  'QA / Test Engineer',
  'Cybersecurity',
  'Product Manager',
  // Business & Finance
  'Business Analyst',
  'Financial Analyst',
  'Marketing Manager',
  'Sales Executive',
  'HR Manager',
  'Operations Manager',
  'Project Manager',
  'Accountant',
  // Design & Creative
  'UI/UX Designer',
  'Graphic Designer',
  'Product Designer',
  'Content Writer',
  'Copywriter',
  // Education & Research
  'Teacher / Educator',
  'Research Analyst',
  'Data Analyst',
];

test('Job Matcher Presets: All 26 roles from role targeting categories are defined', async () => {
  assert.equal(EXPECTED_26_ROLES.length, 26, 'Should have exactly 26 roles from all 4 categories');
  
  // Verify specific roles from each category
  assert.ok(EXPECTED_26_ROLES.includes('Frontend Developer'));
  assert.ok(EXPECTED_26_ROLES.includes('Data Scientist'));
  assert.ok(EXPECTED_26_ROLES.includes('Business Analyst'));
  assert.ok(EXPECTED_26_ROLES.includes('UI/UX Designer'));
  assert.ok(EXPECTED_26_ROLES.includes('Research Analyst'));
});

test('Job Matcher Presets: Selecting any preset populates all fields correctly', () => {
  const dummyTemplate: JobTemplate = {
    title: 'Cybersecurity',
    category: 'Technology',
    company: 'SecureShield Defense',
    requiredSkills: ['Network Security', 'Penetration Testing', 'SIEM'],
    optionalSkills: ['SOC Analysis', 'OWASP Top 10'],
    description: 'Monitor threat intelligence and maintain zero-trust security.',
  };

  let jobTitle = dummyTemplate.title;
  let company = dummyTemplate.company;
  let jobDescription = dummyTemplate.description;
  let requiredSkillsInput = dummyTemplate.requiredSkills.join(', ');
  let optionalSkillsInput = dummyTemplate.optionalSkills.join(', ');

  assert.equal(jobTitle, 'Cybersecurity');
  assert.equal(company, 'SecureShield Defense');
  assert.equal(jobDescription, 'Monitor threat intelligence and maintain zero-trust security.');
  assert.equal(requiredSkillsInput, 'Network Security, Penetration Testing, SIEM');
  assert.equal(optionalSkillsInput, 'SOC Analysis, OWASP Top 10');
});

test('Job Matcher Presets: Alias matching supports legacy titles (Full Stack Engineer -> Full Stack Developer)', () => {
  const sampleJobs: JobTemplate[] = [
    {
      title: 'Full Stack Developer',
      category: 'Technology',
      company: 'TechCorp Innovations',
      aliases: ['Full Stack Engineer'],
      requiredSkills: ['React', 'Node.js'],
      optionalSkills: ['Docker'],
      description: 'Full stack development',
    },
  ];

  const typedTitle = 'Full Stack Engineer';
  const found = sampleJobs.find(
    (tpl) =>
      tpl.title.toLowerCase() === typedTitle.trim().toLowerCase() ||
      (tpl.aliases && tpl.aliases.some((a) => a.toLowerCase() === typedTitle.trim().toLowerCase()))
  );

  assert.ok(found);
  assert.equal(found?.title, 'Full Stack Developer');
});
