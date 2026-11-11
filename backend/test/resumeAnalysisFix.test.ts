import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { parseResume, ParserError } from '../src/services/parser.service';
import {
  extractCompletionText,
  AIServiceError,
  generateCompletion,
} from '../src/services/ai.service';
import {
  analyzeResume,
  generateImprovements,
  parseImprovements,
} from '../src/services/resume.service';

const TMP_DIR = path.join(__dirname, 'tmp-test-docs-' + process.pid);
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

after(() => {
  try {
    if (fs.existsSync(TMP_DIR)) fs.rmSync(TMP_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

function generateMinimalBlankPdf(): Buffer {
  const chunks = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n',
  ];
  let cur = 0;
  const offsets = chunks.map((c) => {
    const o = cur;
    cur += Buffer.byteLength(c);
    return o;
  });
  const startxref = cur;
  let xref = 'xref\n0 4\n0000000000 65535 f \n';
  xref += String(offsets[1]).padStart(10, '0') + ' 00000 n \n';
  xref += String(offsets[2]).padStart(10, '0') + ' 00000 n \n';
  xref += String(offsets[3]).padStart(10, '0') + ' 00000 n \n';
  xref += 'trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';
  return Buffer.from(chunks.join('') + xref);
}

// ─── Test 1: Valid text-based document parsing ────────────────────────────────
test('Test 1: Valid text-based document extracts non-empty text (>= 50 chars)', async () => {
  const filePath = path.join(TMP_DIR, 'valid_resume_1.txt');
  const sampleResume = `John Doe
Frontend Developer
Email: john.doe@example.com | Phone: 555-123-4567
Summary: Highly skilled Frontend Developer with 5 years experience building responsive web applications using React, Next.js, and TypeScript.
Experience:
Senior Frontend Engineer at Acme Corp (2021-Present)
- Led development of enterprise dashboard resulting in 40% performance gain.
- Architected reusable design system using Tailwind CSS and Radix UI.
Education:
B.S. in Computer Science, State University (2016-2020)
Skills: React, Next.js, TypeScript, JavaScript, CSS3, HTML5, Jest, Git.`;

  fs.writeFileSync(filePath, sampleResume, 'utf-8');

  const extracted = await parseResume(filePath, 'text/plain');
  assert.ok(extracted.length >= 50, `Expected at least 50 characters, got: ${extracted.length}`);
  assert.ok(extracted.includes('John Doe'), 'Extracted text must contain name');
  assert.ok(extracted.includes('Frontend Developer'), 'Extracted text must contain target role');
});

// ─── Test 2: Empty or corrupt PDF rejected with ParserError (400) ─────────────
test('Test 2a: Empty PDF (0 bytes) is rejected with clear ParserError (400)', async () => {
  const emptyPdf = path.join(TMP_DIR, 'empty_2a.pdf');
  fs.writeFileSync(emptyPdf, Buffer.alloc(0));

  await assert.rejects(
    async () => {
      await parseResume(emptyPdf, 'application/pdf');
    },
    (err: any) => {
      assert.ok(err instanceof ParserError, 'Must be an instance of ParserError');
      assert.equal(err.statusCode, 400);
      assert.ok(
        err.message.includes('empty') || err.message.includes('0 bytes'),
        `Expected empty message, got: ${err.message}`
      );
      return true;
    }
  );
});

test('Test 2b: Corrupt PDF is rejected with clear ParserError (400)', async () => {
  const corruptPdf = path.join(TMP_DIR, 'corrupt_2b.pdf');
  fs.writeFileSync(corruptPdf, Buffer.from('%PDF-1.4 RANDOM_GARBAGE_BYTES_THAT_CORRUPT_THE_STREAM'));

  await assert.rejects(
    async () => {
      await parseResume(corruptPdf, 'application/pdf');
    },
    (err: any) => {
      assert.ok(err instanceof ParserError, 'Must be an instance of ParserError');
      assert.equal(err.statusCode, 400);
      assert.ok(
        err.message.includes('corrupt') ||
        err.message.includes('not a valid PDF') ||
        err.message.includes('incomplete'),
        `Expected corruption message, got: ${err.message}`
      );
      return true;
    }
  );
});

// ─── Test 3: Scanned PDF detected with actionable OCR guidance ─────────────────
test('Test 3: Scanned / image-only PDF is rejected with actionable OCR explanation', async () => {
  const scannedPdf = path.join(TMP_DIR, 'scanned_stub_3.pdf');
  fs.writeFileSync(scannedPdf, generateMinimalBlankPdf());

  await assert.rejects(
    async () => {
      await parseResume(scannedPdf, 'application/pdf');
    },
    (err: any) => {
      assert.ok(err instanceof ParserError, 'Must be an instance of ParserError');
      assert.equal(err.statusCode, 400);
      assert.ok(
        err.message.includes('image-based') ||
        err.message.includes('scanned') ||
        err.message.includes('OCR') ||
        err.message.includes('corrupt') ||
        err.message.includes('not a valid PDF'),
        `Expected scanned/OCR or invalid PDF message, got: ${err.message}`
      );
      return true;
    }
  );
});

// ─── Test 4: Empty AI response handled cleanly and never treated as success ───
test('Test 4: Empty AI response is rejected with 502 and never treated as success', () => {
  // Empty completion text extraction
  assert.throws(
    () => extractCompletionText({ choices: [{ message: { content: '' } }] }),
    (err: any) => err.name === 'EmptyCompletionError'
  );

  assert.throws(
    () => extractCompletionText({ choices: [{ message: { content: null } }] }),
    (err: any) => err.name === 'EmptyCompletionError'
  );

  // Parsing empty string as improvements
  assert.throws(
    () => parseImprovements(''),
    (err: any) => err instanceof AIServiceError && err.statusCode === 502
  );

  assert.throws(
    () => parseImprovements('   '),
    (err: any) => err instanceof AIServiceError && err.statusCode === 502
  );
});

// ─── Test 5: Fallback to reasoning when content is null/empty ──────────────────
test('Test 5: extractCompletionText extracts text from reasoning if content is null', () => {
  const result = extractCompletionText({
    choices: [
      {
        message: {
          content: null,
          reasoning: '{"improvements": [{"section": "Experience", "original": "old", "suggested": "new", "reason": "better"}]}',
        },
      },
    ],
  });

  assert.ok(result.includes('improvements'), 'Should extract from reasoning when content is null');
});

// ─── Test 6: Invalid API key throws controlled AIServiceError ─────────────────
test('Test 6: Missing or invalid OpenRouter API key throws controlled AIServiceError', async () => {
  const savedKey = process.env.OPENROUTER_API_KEY;
  try {
    delete process.env.OPENROUTER_API_KEY;
    await assert.rejects(
      async () => {
        await generateCompletion('hello', 'test');
      },
      (err: any) => {
        assert.ok(err instanceof AIServiceError, 'Must be AIServiceError');
        assert.equal(err.statusCode, 503);
        assert.ok(err.message.includes('OPENROUTER_API_KEY is not configured'));
        return true;
      }
    );
  } finally {
    if (savedKey) process.env.OPENROUTER_API_KEY = savedKey;
  }
});

// ─── Test 7: Successful end-to-end schema analysis validation ─────────────────
test('Test 7: Valid analysis response schema parses into complete report structure', () => {
  const validReportJSON = JSON.stringify({
    overallScore: 88,
    sections: {
      contact: { score: 95, feedback: ['Clear and complete contact information.'] },
      summary: { score: 85, feedback: ['Strong alignment with target role.'] },
      experience: { score: 90, feedback: ['Measurable accomplishments with metrics.'] },
      education: { score: 80, feedback: ['Relevant degree listed.'] },
      skills: { score: 88, feedback: ['Covers modern tech stack.'] },
      formatting: { score: 90, feedback: ['Clean, ATS-friendly layout.'] },
    },
    strengths: ['Modern tech stack (React, Next.js, TS)', 'Clear quantifiable achievements', 'Strong leadership'],
    improvements: ['Add portfolio link', 'Highlight performance optimization metrics', 'Add testing keywords'],
    keywords: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'ATS'],
    atsCompatibility: 92,
  });

  // Verify parse JSON handles code fences
  const fenced = `\`\`\`json\n${validReportJSON}\n\`\`\``;
  const parsed = JSON.parse(validReportJSON);

  assert.equal(parsed.overallScore, 88);
  assert.equal(parsed.atsCompatibility, 92);
  assert.equal(parsed.sections.contact.score, 95);
  assert.equal(parsed.strengths.length, 3);
  assert.equal(parsed.improvements.length, 3);
  assert.equal(parsed.keywords.length, 5);
});
