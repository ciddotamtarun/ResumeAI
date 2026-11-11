import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import {
  QUESTION_REGISTRY,
  scoreAssessmentSubmission,
} from '../src/services/assessment.service';
import Assessment from '../src/models/Assessment.model';

test('Assessment Service: QUESTION_REGISTRY covers core technical domains with valid question structures', () => {
  const expectedDomains = ['python', 'javascript', 'react', 'sql', 'nodejs', 'java', 'devops', 'data_analysis'];
  for (const domainKey of expectedDomains) {
    const domain = QUESTION_REGISTRY[domainKey];
    assert.ok(domain, `Domain ${domainKey} must exist in QUESTION_REGISTRY`);
    assert.ok(domain.name, `Domain ${domainKey} must have a name`);
    assert.ok(domain.category, `Domain ${domainKey} must have a category`);
    assert.ok(domain.questions.length >= 5, `Domain ${domainKey} must have at least 5 questions`);

    for (const q of domain.questions) {
      assert.ok(q.id, `Question in ${domainKey} must have an ID`);
      assert.ok(q.topic, `Question ${q.id} must have a topic`);
      assert.ok(q.question, `Question ${q.id} must have question text`);
      assert.ok(q.options.length >= 3, `Question ${q.id} must have at least 3 options`);
      assert.ok(
        q.correctIndex >= 0 && q.correctIndex < q.options.length,
        `Question ${q.id} correctIndex must be within options range`
      );
      assert.ok(q.explanation, `Question ${q.id} must provide an explanation`);
      assert.ok(q.practiceTip, `Question ${q.id} must provide a practice tip`);
    }
  }
});

test('scoreAssessmentSubmission: 100% correct answers produces score=100 and passed=true', () => {
  const pythonDomain = QUESTION_REGISTRY['python'];
  const allCorrectAnswers: Record<string, number> = {};
  for (const q of pythonDomain.questions) {
    allCorrectAnswers[q.id] = q.correctIndex;
  }

  const result = scoreAssessmentSubmission('python', allCorrectAnswers);
  assert.equal(result.score, 100);
  assert.equal(result.passed, true);
  assert.equal(result.correctCount, pythonDomain.questions.length);
  assert.equal(result.totalQuestions, pythonDomain.questions.length);
  assert.equal(result.weakTopics.length, 0);

  // All topic breakdowns should have 100% score
  for (const t of result.topicBreakdown) {
    assert.equal(t.score, 100);
  }
});

test('scoreAssessmentSubmission: incorrect answers marks passed=false and records weakTopics', () => {
  const sqlDomain = QUESTION_REGISTRY['sql'];
  const wrongAnswers: Record<string, number> = {};
  for (const q of sqlDomain.questions) {
    wrongAnswers[q.id] = (q.correctIndex + 1) % q.options.length;
  }

  const result = scoreAssessmentSubmission('sql', wrongAnswers);
  assert.equal(result.score, 0);
  assert.equal(result.passed, false);
  assert.equal(result.correctCount, 0);
  assert.equal(result.totalQuestions, sqlDomain.questions.length);
  assert.ok(result.weakTopics.length > 0, 'Should detect weak topics');
});

test('scoreAssessmentSubmission: falls back to default domain gracefully for unknown assessmentId', () => {
  const result = scoreAssessmentSubmission('non_existent_domain_xyz', {});
  assert.equal(result.score, 0);
  assert.equal(result.passed, false);
  assert.ok(result.totalQuestions > 0, 'Falls back to default question set');
});

test('Assessment Model: validates required fields and sets default values', () => {
  const attempt = new Assessment({
    userId: new mongoose.Types.ObjectId(),
    assessmentId: 'react',
    domainName: 'React & Frontend Architecture',
    targetRole: 'Frontend Developer',
    roundMode: 'fundamentals',
    skillName: 'React',
    score: 85,
    passed: true,
    totalQuestions: 7,
    correctCount: 6,
    timeSpentSeconds: 240,
    answers: { react_1: 0, react_2: 1 },
    topicBreakdown: [{ topic: 'Virtual DOM & Fiber', score: 1, total: 1 }],
    weakTopics: [],
  });

  const err = attempt.validateSync();
  assert.equal(err, undefined, 'Assessment attempt should pass schema validation');
  assert.equal(attempt.assessmentId, 'react');
  assert.equal(attempt.score, 85);
  assert.equal(attempt.passed, true);
});
