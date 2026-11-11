import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FEMALE_INTERVIEWER,
  MALE_INTERVIEWER,
  buildSystemPrompt,
  InterviewConfig,
} from '../src/services/interview.service';
import Interview from '../src/models/Interview.model';
import mongoose from 'mongoose';

test('Interviewer Personas: Sarah Jenkins and David Chen profiles are configured correctly', () => {
  assert.equal(FEMALE_INTERVIEWER.id, 'female');
  assert.equal(FEMALE_INTERVIEWER.name, 'Sarah Jenkins');
  assert.equal(FEMALE_INTERVIEWER.gender, 'female');
  assert.equal(FEMALE_INTERVIEWER.avatar, '/avatars/female.svg');
  assert.ok(FEMALE_INTERVIEWER.title.includes('Recruiter'));

  assert.equal(MALE_INTERVIEWER.id, 'male');
  assert.equal(MALE_INTERVIEWER.name, 'David Chen');
  assert.equal(MALE_INTERVIEWER.gender, 'male');
  assert.equal(MALE_INTERVIEWER.avatar, '/avatars/male.svg');
  assert.ok(MALE_INTERVIEWER.title.includes('Engineering'));
});

test('buildSystemPrompt: embeds candidate resume, target role, category, and interviewer persona', () => {
  const sampleResume = `
Candidate: Alice Smith
Experience: 3 years building scalable distributed microservices in Go and React.
Projects: Real-time inventory service handling 10k req/s using Redis and Kafka.
Skills: Go, TypeScript, React, Docker, Kubernetes, PostgreSQL.
`;

  const config: InterviewConfig = {
    targetRole: 'Staff Distributed Systems Engineer',
    category: 'technical',
    difficulty: 'difficult',
    questionCount: 10,
    interviewer: MALE_INTERVIEWER,
  };

  const prompt = buildSystemPrompt(sampleResume, config);

  // Grounding checks
  assert.ok(prompt.includes('David Chen'), 'Must mention David Chen');
  assert.ok(prompt.includes('Staff Distributed Systems Engineer'), 'Must mention target role');
  assert.ok(prompt.includes('Technical Interview'), 'Must specify Technical focus');
  assert.ok(prompt.includes('DIFFICULTY: Difficult'), 'Must specify Difficult level');
  assert.ok(prompt.includes('10k req/s using Redis and Kafka'), 'Must include candidate resume text');
  assert.ok(prompt.includes('ONE question at a time'), 'Must enforce single question conversational pacing');
});

test('buildSystemPrompt: handles behavioral category with STAR method guidance', () => {
  const sampleResume = 'Candidate: Bob Jones\nExperience: Product management and sprint planning.';
  const config: InterviewConfig = {
    targetRole: 'Product Manager',
    category: 'behavioral',
    difficulty: 'medium',
    questionCount: 5,
    interviewer: FEMALE_INTERVIEWER,
  };

  const prompt = buildSystemPrompt(sampleResume, config);
  assert.ok(prompt.includes('Sarah Jenkins'));
  assert.ok(prompt.includes('STAR format'));
  assert.ok(prompt.includes('Product Manager'));
});

test('Interview Mongoose Model: accepts new schema attributes (interviewer, category, difficulty, questionCount, finalResults)', () => {
  const fakeUserId = new mongoose.Types.ObjectId();
  const fakeResumeId = new mongoose.Types.ObjectId();

  const interviewDoc = new Interview({
    userId: fakeUserId,
    resumeId: fakeResumeId,
    targetRole: 'Frontend Lead',
    interviewer: FEMALE_INTERVIEWER,
    category: 'mixed',
    difficulty: 'difficult',
    questionCount: 10,
    status: 'completed',
    messages: [
      { role: 'interviewer', content: 'Tell me about how you optimize Web Vitals.', timestamp: new Date() },
      { role: 'candidate', content: 'I audit LCP, FID, and CLS using Lighthouse and code split components.', timestamp: new Date() },
    ],
    finalResults: {
      overallScore: 88,
      performanceLevel: 'Strong',
      completionStatus: 'completed',
      questionsAnswered: 1,
      summary: 'Demonstrated solid understanding of web performance metrics.',
      categoryScores: {
        technicalKnowledge: { score: 90, assessed: true, feedback: 'Strong grasp of Web Vitals' },
        problemSolving: { score: 85, assessed: true },
        communicationClarity: { score: 88, assessed: true },
        behavioralCompetence: { score: 0, assessed: false },
        roleResumeAlignment: { score: 92, assessed: true },
      },
      questionAnalysis: [
        {
          question: 'Tell me about how you optimize Web Vitals.',
          candidateAnswer: 'I audit LCP, FID, and CLS using Lighthouse and code split components.',
          score: 88,
          whatWentWell: 'Identified core metrics and remediation techniques.',
          missingConcepts: 'Did not mention INP or image aspect ratios for CLS.',
          suggestedImprovement: 'Provide a concrete metric reduction example.',
          modelAnswerExample: 'I target LCP by preloading critical fonts, inlining critical CSS, and optimizing hydration trees.',
        },
      ],
      strengths: ['Clear terminology', 'Actionable remediation knowledge'],
      areasForImprovement: ['Mention Interaction to Next Paint (INP)'],
      unsupportedClaimsOrGaps: [],
      personalizedPlan: {
        topicsToStudy: ['Hydration mismatches', 'PerformanceObserver API'],
        skillsToStrengthen: ['Chrome DevTools Performance profiling'],
        recommendedPracticeQuestions: ['How do you debug main thread blocking scripts?'],
        actionableNextSteps: ['Profile a Next.js production app and record traces.'],
      },
      finalSummary: {
        readinessAssessment: 'Ready for senior frontend roles with strong client-side performance depth.',
        priorityImprovements: ['Practice INP measurement and server rendering trade-offs.'],
        recommendedNextSession: 'Deep dive into full-stack architecture.',
      },
    },
    aiProvider: 'gemini',
  });

  const validationError = interviewDoc.validateSync();
  assert.equal(validationError, undefined, 'Mongoose model validation must pass without errors');
  assert.equal(interviewDoc.category, 'mixed');
  assert.equal(interviewDoc.difficulty, 'difficult');
  assert.equal(interviewDoc.questionCount, 10);
  assert.equal(interviewDoc.interviewer?.id, 'female');
  assert.equal(interviewDoc.finalResults?.overallScore, 88);
  assert.equal(interviewDoc.finalResults?.questionAnalysis?.length, 1);
});

test('Interview Mongoose Model: supports evaluating and failed statuses', () => {
  const fakeUserId = new mongoose.Types.ObjectId();
  const fakeResumeId = new mongoose.Types.ObjectId();

  const evaluatingDoc = new Interview({
    userId: fakeUserId,
    resumeId: fakeResumeId,
    status: 'evaluating',
    messages: [{ role: 'interviewer', content: 'Hello', timestamp: new Date() }],
  });
  assert.equal(evaluatingDoc.validateSync(), undefined, 'evaluating status should pass validation');
  assert.equal(evaluatingDoc.status, 'evaluating');

  const failedDoc = new Interview({
    userId: fakeUserId,
    resumeId: fakeResumeId,
    status: 'failed',
    messages: [{ role: 'interviewer', content: 'Hello', timestamp: new Date() }],
  });
  assert.equal(failedDoc.validateSync(), undefined, 'failed status should pass validation');
  assert.equal(failedDoc.status, 'failed');
});

test('cleanInterviewerMessage: strips thinking tags, markdown fences, and JSON wrappers', () => {
  const { cleanInterviewerMessage } = require('../src/services/interview.service');

  // Strip <think>
  const withThink = '<think>I should ask about React</think>Can you describe how you managed state?';
  assert.equal(cleanInterviewerMessage(withThink), 'Can you describe how you managed state?');

  // Strip JSON wrapper
  const jsonWrapper = '{"question": "How do you optimize bundle size in Next.js?"}';
  assert.equal(cleanInterviewerMessage(jsonWrapper), 'How do you optimize bundle size in Next.js?');

  // Strip markdown code fence
  const fenced = '```json\n{"message": "Walk me through your database schema design."}\n```';
  assert.equal(cleanInterviewerMessage(fenced), 'Walk me through your database schema design.');

  // Strip outer quotes
  const quoted = '"What is your approach to microservices caching?"';
  assert.equal(cleanInterviewerMessage(quoted), 'What is your approach to microservices caching?');
});

test('extractAndParseJSON: repairs trailing commas, markdown fences, and truncated JSON', () => {
  const { extractAndParseJSON } = require('../src/services/interview.service');

  // Trailing commas
  const trailingComma = '{"overallScore": 90, "summary": "Great interview", "strengths": ["Clear", "Direct",],}';
  const parsedTrailing = extractAndParseJSON(trailingComma);
  assert.equal(parsedTrailing.overallScore, 90);
  assert.equal(parsedTrailing.strengths.length, 2);

  // Markdown fence with leading commentary
  const withCommentary = 'Here is the interview evaluation report:\n```json\n{"overallScore": 82, "summary": "Solid foundation."}\n```\nHope this helps!';
  const parsedFenced = extractAndParseJSON(withCommentary);
  assert.equal(parsedFenced.overallScore, 82);

  // Truncated JSON missing closing brackets
  const truncated = '{"overallScore": 85, "summary": "Strong problem solver", "categoryScores": {"technicalKnowledge": {"score": 90, "assessed": true}';
  const parsedTruncated = extractAndParseJSON(truncated);
  assert.equal(parsedTruncated.overallScore, 85);
  assert.equal(parsedTruncated.categoryScores.technicalKnowledge.score, 90);
});

test('parseInterviewResults: normalizes schema and reconstructs questionAnalysis from transcript when omitted', () => {
  const { parseInterviewResults } = require('../src/services/interview.service');

  const transcript = [
    { role: 'interviewer', content: 'How do you handle race conditions in distributed systems?' },
    { role: 'candidate', content: 'I use distributed locks via Redis Redlock and optimistic concurrency with version checks.' },
  ];

  const minimalJson = JSON.stringify({
    overallScore: 88,
    summary: 'Candidate demonstrated deep concurrency knowledge.',
  });

  const result = parseInterviewResults(minimalJson, 1, transcript);
  assert.equal(result.overallScore, 88);
  assert.equal(result.summary, 'Candidate demonstrated deep concurrency knowledge.');
  assert.ok(result.categoryScores?.technicalKnowledge);
  assert.equal(result.questionAnalysis?.length, 1);
  assert.ok(result.questionAnalysis[0].question.includes('race conditions'));
  assert.ok(result.questionAnalysis[0].candidateAnswer.includes('distributed locks'));
});

test('parseInterviewResults: throws AIServiceError with 502 on malformed or empty input', () => {
  const { parseInterviewResults } = require('../src/services/interview.service');

  assert.throws(
    () => parseInterviewResults('', 0),
    (err: any) => err.statusCode === 502 && err.message.includes('empty')
  );

  assert.throws(
    () => parseInterviewResults('not json at all and no braces', 0),
    (err: any) => err.statusCode === 502 && err.message.includes('AI returned malformed JSON')
  );
});
