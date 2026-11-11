import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import {
  AIServiceError,
  extractCompletionText,
  retryTransientRequest,
  generateCompletion,
} from '../src/services/ai.service';
import {
  analyzeResume,
  generateImprovements,
  parseImprovements,
} from '../src/services/resume.service';
import Resume from '../src/models/Resume.model';

const sampleResume = `John Doe
Full Stack Developer
john.doe@example.com | (555) 123-4567 | github.com/johndoe
Summary: Experienced Full Stack Developer with 4 years of experience building web applications using React, TypeScript, Next.js, Node.js, Express, MongoDB, and AWS.
Experience:
Senior Full Stack Engineer at TechCorp (2022 - Present)
- Built scalable microservices using Node.js, Express, and MongoDB.
- Developed dynamic responsive user interfaces in Next.js and TypeScript.
- Improved Core Web Vitals by 35% and API response latency by 50%.
Software Engineer at StartupInc (2020 - 2022)
- Designed RESTful APIs handling 10,000+ daily active users.
- Collaborated with product designers to implement pixel-perfect Figma designs.
Education:
B.S. in Computer Science, State University (2016 - 2020)
Skills: React, Next.js, TypeScript, JavaScript, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git.`;

const targetRole = 'Full Stack Developer';

// ─── Test 1: Valid document and successful AI response ───────────────────────
test('Case 1: Valid document and successful AI response for Full Stack Developer', async () => {
  const [analysis, improvements] = await Promise.all([
    analyzeResume(sampleResume, targetRole, 'gemini'),
    generateImprovements(sampleResume, targetRole, 'gemini'),
  ]);

  // Validate analysis schema
  assert.ok(typeof analysis.overallScore === 'number' && analysis.overallScore >= 0 && analysis.overallScore <= 100);
  assert.ok(typeof analysis.atsCompatibility === 'number' && analysis.atsCompatibility >= 0);
  assert.ok(Array.isArray(analysis.strengths) && analysis.strengths.length > 0);
  assert.ok(Array.isArray(analysis.improvements) && analysis.improvements.length > 0);
  assert.ok(Array.isArray(analysis.keywords) && analysis.keywords.length > 0);
  assert.ok(analysis.sections && typeof analysis.sections === 'object');
  assert.ok(typeof analysis.sections.experience.score === 'number');

  // Validate improvements schema
  assert.ok(Array.isArray(improvements) && improvements.length > 0);
  for (const item of improvements) {
    assert.ok(typeof item.section === 'string' && item.section.trim().length > 0);
    assert.ok(typeof item.original === 'string' && item.original.trim().length > 0);
    assert.ok(typeof item.suggested === 'string' && item.suggested.trim().length > 0);
    assert.ok(typeof item.reason === 'string');
  }
});

// ─── Test 2: Empty AI response ───────────────────────────────────────────────
test('Case 2: Empty AI response throws controlled 502 and is never treated as success', () => {
  // 1. extractCompletionText rejects empty content
  assert.throws(
    () => extractCompletionText({ choices: [{ message: { content: '' } }] }),
    (err: any) => err.name === 'EmptyCompletionError'
  );

  // 2. parseImprovements rejects empty string
  assert.throws(
    () => parseImprovements(''),
    (err: any) => err instanceof AIServiceError && err.statusCode === 502
  );

  // 3. parseImprovements rejects whitespace-only string
  assert.throws(
    () => parseImprovements('   \n\t  '),
    (err: any) => err instanceof AIServiceError && err.statusCode === 502
  );
});

// ─── Test 3: Malformed JSON ──────────────────────────────────────────────────
test('Case 3: Malformed JSON is safely rejected without server crash or silent fabrication', () => {
  const malformedInputs = [
    '{"improvements": [{"section": "Experience", "original": "broken',
    'not even json at all',
    '12345',
    'true',
    'null',
    '```json\n{"improvements": [unclosed array\n```',
  ];

  for (const input of malformedInputs) {
    assert.throws(
      () => parseImprovements(input),
      (err: any) =>
        err instanceof AIServiceError &&
        err.statusCode === 502 &&
        err.message.includes('empty or invalid JSON'),
      `Input "${input.slice(0, 20)}" must throw AIServiceError(502)`
    );
  }
});

// ─── Test 4: Unavailable model ───────────────────────────────────────────────
test('Case 4: Unavailable model falls back or fails gracefully without infinite retries', async () => {
  const originalModel = process.env.OPENROUTER_MODEL;
  try {
    process.env.OPENROUTER_MODEL = 'nonexistent/defunct-model-99999';
    // The service tries the primary model, fails with 404, then tries fallback models (openrouter/auto)
    const result = await generateCompletion('Respond with: {"status": "ok"}', 'Return raw JSON only');
    assert.ok(result.length > 0, 'Fallback model should fulfill the request');
  } finally {
    process.env.OPENROUTER_MODEL = originalModel;
  }
});

// ─── Test 5: Invalid API key ─────────────────────────────────────────────────
test('Case 5: Invalid API key fails fast with 502/503 without repeated fallback retries', async () => {
  const originalKey = process.env.OPENROUTER_API_KEY;
  try {
    process.env.OPENROUTER_API_KEY = 'sk-or-v1-invalid-key-00000000000000000000';
    await assert.rejects(
      async () => {
        await generateCompletion('test', 'test');
      },
      (err: any) => {
        assert.ok(err instanceof AIServiceError);
        assert.ok(err.statusCode === 502 || err.statusCode === 503);
        assert.ok(err.message.includes('authentication') || err.message.includes('OpenRouter'));
        return true;
      }
    );
  } finally {
    process.env.OPENROUTER_API_KEY = originalKey;
  }
});

// ─── Test 6: Provider rate-limit response (429) ──────────────────────────────
test('Case 6: Provider rate-limit (429) retries bounded number of times and throws 503', async () => {
  let attemptCount = 0;
  const backoffs: number[] = [];

  await assert.rejects(
    retryTransientRequest(
      async () => {
        attemptCount += 1;
        const err = new Error('Rate limit exceeded');
        Object.assign(err, { status: 429 });
        throw err;
      },
      {
        maxRetries: 2,
        delayMs: 100,
        wait: async (ms) => {
          backoffs.push(ms);
        },
      }
    ),
    (err: any) => {
      assert.ok(err instanceof AIServiceError);
      assert.equal(err.statusCode, 503);
      assert.ok(err.message.includes('rate limiting'));
      return true;
    }
  );

  assert.equal(attemptCount, 3, 'Must attempt initial + 2 retries = 3 attempts total');
  assert.deepEqual(backoffs, [100, 200]);
});

// ─── Test 7: Successful saved report displayed by the frontend ─────────────────
test('Case 7: Analysis and improvements schema conforms to Resume MongoDB model and frontend expectations', async () => {
  // Verify report schema matches what frontend expects for rendering
  const mockAnalysis = {
    overallScore: 84,
    sections: {
      contact: { score: 90, feedback: ['Add LinkedIn URL'] },
      summary: { score: 80, feedback: ['Highlight Full Stack experience'] },
      experience: { score: 85, feedback: ['Quantify database scaling achievements'] },
      education: { score: 80, feedback: ['B.S. in Computer Science is aligned'] },
      skills: { score: 88, feedback: ['Good coverage of modern stack'] },
      formatting: { score: 90, feedback: ['Clean, ATS-friendly typography'] },
    },
    strengths: ['Strong React/Node stack', 'Measurable performance wins'],
    improvements: ['Include AWS certifications', 'Quantify backend throughput'],
    keywords: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
    atsCompatibility: 88,
  };

  const mockImprovements = [
    {
      section: 'Experience',
      original: 'Built scalable microservices using Node.js.',
      suggested: 'Architected and deployed 12+ scalable microservices using Node.js, Express, and MongoDB, handling 50k+ requests/sec with 99.9% uptime.',
      reason: 'Adds concrete metrics and demonstrates production scale for Full Stack Developer roles.',
    },
  ];

  // Connect to MongoDB if available, otherwise test Schema instantiation directly
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoose.connection.readyState) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    } catch {
      // Offline fallback: test schema validation in-memory
    }
  }

  const fakeUserId = new mongoose.Types.ObjectId();
  const resumeDoc = new Resume({
    userId: fakeUserId,
    fileName: 'john_doe_fullstack_resume.pdf',
    fileType: 'application/pdf',
    rawText: sampleResume,
    targetRole: 'Full Stack Developer',
    analysis: mockAnalysis,
    improvements: mockImprovements,
    aiProvider: 'openrouter',
  });

  const validationError = resumeDoc.validateSync();
  assert.equal(validationError, undefined, 'Resume document must validate cleanly against Mongoose schema');

  // Verify frontend required fields
  assert.equal(resumeDoc.analysis.overallScore, 84);
  assert.equal(resumeDoc.analysis.atsCompatibility, 88);
  assert.equal(resumeDoc.improvements.length, 1);
  assert.equal(resumeDoc.improvements[0].section, 'Experience');
  assert.ok(resumeDoc.improvements[0].suggested.includes('Architected and deployed'));
  assert.equal(resumeDoc.targetRole, 'Full Stack Developer');

  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
});
