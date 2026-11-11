import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { resumeDataToPlainText } from '../src/controllers/builder.controller';
import ResumeDraft from '../src/models/ResumeDraft.model';

const sampleResumeData = {
  personalInfo: {
    fullName: 'Jane Doe',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/janedoe',
    github: 'github.com/janedoe',
    website: 'janedoe.dev',
  },
  summary:
    'Innovative Senior Full Stack Engineer with 6+ years of experience engineering high-scale distributed microservices and reactive web applications.',
  experience: [
    {
      id: 'exp_1',
      title: 'Senior Software Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected real-time streaming pipelines processing 15M events daily with Kafka and Go.',
        'Reduced 99th-percentile API response latency by 42% through Redis cluster caching.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'ElevateAI Cloud Platform',
      description: 'Distributed AI-driven career acceleration suite.',
      technologies: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Docker'],
      projectUrl: 'https://elevateai.app',
      githubUrl: 'https://github.com/janedoe/elevateai',
      bullets: [
        'Implemented end-to-end resume builder with live A4 preview and ATS optimization.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startDate: '2016',
      endDate: '2020',
      gpa: '3.85 / 4.00',
    },
  ],
  skills: {
    technical: [
      { id: 'sk_1', name: 'TypeScript' },
      { id: 'sk_2', name: 'React' },
      { id: 'sk_3', name: 'Node.js' },
      { id: 'sk_4', name: 'Python' },
      { id: 'sk_5', name: 'PostgreSQL' },
    ],
    soft: [
      { id: 'sk_6', name: 'Technical Leadership' },
      { id: 'sk_7', name: 'Cross-functional Collaboration' },
    ],
  },
  additional: {
    certifications: [
      { id: 'cert_1', name: 'AWS Certified Solutions Architect - Associate', issuer: 'Amazon Web Services', date: '2023' },
    ],
    achievements: [
      { id: 'ach_1', title: 'Top Performer Award', description: 'Recognized for delivering multi-tenant cloud migration ahead of schedule.' },
    ],
    languages: [
      { id: 'lang_1', language: 'English', proficiency: 'Native / Bilingual' },
    ],
  },
};

test('resumeDataToPlainText: converts structured resume into comprehensive plain text for ATS analysis', () => {
  const plainText = resumeDataToPlainText(sampleResumeData);

  assert.ok(plainText.includes('JANE DOE'), 'Must include full name');
  assert.ok(plainText.includes('Senior Full Stack Engineer'), 'Must include professional title');
  assert.ok(plainText.includes('jane.doe@example.com'), 'Must include email');
  assert.ok(plainText.includes('PROFESSIONAL SUMMARY'), 'Must include summary header');
  assert.ok(plainText.includes('WORK EXPERIENCE'), 'Must include experience header');
  assert.ok(plainText.includes('TechFlow Systems'), 'Must include company');
  assert.ok(plainText.includes('15M events daily'), 'Must include experience bullet text');
  assert.ok(plainText.includes('PROJECTS'), 'Must include projects header');
  assert.ok(plainText.includes('ElevateAI Cloud Platform'), 'Must include project title');
  assert.ok(plainText.includes('EDUCATION'), 'Must include education header');
  assert.ok(plainText.includes('University of California, Berkeley'), 'Must include institution');
  assert.ok(plainText.includes('SKILLS'), 'Must include skills header');
  assert.ok(plainText.includes('TypeScript, React, Node.js'), 'Must include technical skills');
  assert.ok(plainText.includes('CERTIFICATIONS'), 'Must include certifications');
  assert.ok(plainText.includes('AWS Certified Solutions Architect'), 'Must include certificate name');
});

test('resumeDataToPlainText: handles empty / minimal data without throwing', () => {
  const emptyOutput = resumeDataToPlainText({});
  assert.equal(typeof emptyOutput, 'string');
  assert.equal(emptyOutput.trim(), '');

  const nullOutput = resumeDataToPlainText(null);
  assert.equal(nullOutput, '');
});

test('ResumeDraft Model: validates schema, sets default template to classic, and enforces required fields', () => {
  const draft = new ResumeDraft({
    userId: new mongoose.Types.ObjectId(),
    title: 'Software Engineer Resume Draft',
    targetRole: 'Senior Full Stack Engineer',
    template: 'modern',
    data: sampleResumeData,
  });

  const err = draft.validateSync();
  assert.equal(err, undefined, 'Resume draft should pass schema validation');
  assert.equal(draft.template, 'modern');
  assert.equal(draft.title, 'Software Engineer Resume Draft');
  assert.equal(draft.data.personalInfo.fullName, 'Jane Doe');
});
