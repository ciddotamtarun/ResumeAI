import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIServiceError,
  extractCompletionText,
  retryTransientRequest,
} from '../src/services/ai.service';
import { parseImprovements } from '../src/services/resume.service';

const validImprovements = {
  improvements: [
    {
      section: 'Experience',
      original: 'Worked on customer projects.',
      suggested: 'Delivered three customer projects on schedule.',
      reason: 'Adds a measurable outcome.',
    },
  ],
};

test('parses valid improvement JSON', () => {
  assert.deepEqual(parseImprovements(JSON.stringify(validImprovements)), validImprovements.improvements);
});

test('parses improvement JSON inside a Markdown code fence', () => {
  const response = `Here are the suggestions:\n\`\`\`json\n${JSON.stringify(validImprovements)}\n\`\`\``;
  assert.deepEqual(parseImprovements(response), validImprovements.improvements);
});

test('rejects empty AI output with a controlled error', () => {
  assert.throws(
    () => parseImprovements(''),
    (error: unknown) =>
      error instanceof AIServiceError &&
      error.statusCode === 502 &&
      error.message.includes('empty or invalid JSON')
  );
});

test('rejects invalid JSON without including the response in the error', () => {
  const response = 'private resume text {not-json';
  assert.throws(
    () => parseImprovements(response),
    (error: unknown) =>
      error instanceof AIServiceError &&
      error.statusCode === 502 &&
      !error.message.includes('private resume text')
  );
});

test('rejects suggestions missing required fields', () => {
  const response = JSON.stringify({
    improvements: [{ section: 'Experience', original: 'Current text' }],
  });
  assert.throws(
    () => parseImprovements(response),
    (error: unknown) =>
      error instanceof AIServiceError &&
      error.message.includes('incomplete resume suggestions')
  );
});

test('extracts text from a standard OpenRouter chat completion', () => {
  assert.equal(
    extractCompletionText({
      choices: [{ message: { content: '{"improvements":[]}' } }],
    }),
    '{"improvements":[]}'
  );
});

test('extracts text blocks and rejects missing completion fields', () => {
  assert.equal(
    extractCompletionText({
      choices: [{
        message: {
          content: [{ type: 'text', text: 'first' }, { type: 'text', text: 'second' }],
        },
      }],
    }),
    'first\nsecond'
  );
  assert.throws(() => extractCompletionText({ choices: [] }));
  assert.throws(() => extractCompletionText({ choices: [{ message: { content: null } }] }));
});

test('retries empty completion content and then returns a controlled error', async () => {
  let attempts = 0;
  await assert.rejects(
    retryTransientRequest(async () => {
      attempts += 1;
      return extractCompletionText({
        choices: [{ message: { content: '' } }],
      });
    }, { wait: async () => undefined }),
    (error: unknown) =>
      error instanceof AIServiceError &&
      error.statusCode === 502 &&
      error.message.includes('no usable text')
  );
  assert.equal(attempts, 3);
});

test('retries rate limits a bounded number of times', async () => {
  let attempts = 0;
  const waits: number[] = [];

  await assert.rejects(
    retryTransientRequest(async () => {
      attempts += 1;
      throw Object.assign(new Error('rate limited'), { status: 429 });
    }, {
      wait: async (milliseconds) => { waits.push(milliseconds); },
    }),
    (error: unknown) => error instanceof AIServiceError && error.statusCode === 503
  );

  assert.equal(attempts, 3);
  assert.deepEqual(waits, [500, 1000]);
});

test('retries server errors but does not retry permanent client errors', async () => {
  let serverAttempts = 0;
  await assert.rejects(
    retryTransientRequest(async () => {
      serverAttempts += 1;
      throw Object.assign(new Error('server error'), { status: 503 });
    }, { wait: async () => undefined }),
    (error: unknown) => error instanceof AIServiceError && error.statusCode === 503
  );
  assert.equal(serverAttempts, 3);

  let clientAttempts = 0;
  await assert.rejects(
    retryTransientRequest(async () => {
      clientAttempts += 1;
      throw Object.assign(new Error('bad request'), { status: 400 });
    }, { wait: async () => undefined }),
    (error: unknown) => error instanceof AIServiceError && error.statusCode === 502
  );
  assert.equal(clientAttempts, 1);
});
