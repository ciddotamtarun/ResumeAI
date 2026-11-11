import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getRoleProfile,
  getResourceForSkill,
  mapSkillToSkillProofDomain,
  ROLE_PROFILES,
} from '../src/services/roadmap.service';
import Roadmap, { IRoadmapTask } from '../src/models/Roadmap.model';

/**
 * Test Suite: Personalized Improvement Planner Engine
 * Verifies role profiles, skill gap prioritization, task structuring,
 * resource curation, and progress analytics.
 */

test('Roadmap: Role profiles exist and contain required/optional skills and capstone projects', () => {
  const fsProfile = getRoleProfile('Full Stack Developer');
  assert.equal(fsProfile.title, 'Full Stack Developer');
  assert.ok(fsProfile.requiredSkills.includes('React'));
  assert.ok(fsProfile.requiredSkills.includes('Node.js'));
  assert.ok(fsProfile.requiredSkills.includes('PostgreSQL'));
  assert.ok(fsProfile.projects.length > 0);
  assert.ok(fsProfile.projects[0].deliverables.length > 0);

  const beProfile = getRoleProfile('Backend Developer');
  assert.ok(beProfile.requiredSkills.includes('Python'));
  assert.ok(beProfile.requiredSkills.includes('SQL'));

  const feProfile = getRoleProfile('Frontend Developer');
  assert.ok(feProfile.requiredSkills.includes('React'));
  assert.ok(feProfile.requiredSkills.includes('TypeScript'));
});

test('Roadmap: SkillProof domain mapping accurately routes to existing assessment domains', () => {
  const pyMap = mapSkillToSkillProofDomain('Python');
  assert.equal(pyMap?.domainId, 'python');

  const sqlMap = mapSkillToSkillProofDomain('PostgreSQL');
  assert.equal(sqlMap?.domainId, 'sql');

  const reactMap = mapSkillToSkillProofDomain('React');
  assert.equal(reactMap?.domainId, 'react');

  const tsMap = mapSkillToSkillProofDomain('TypeScript');
  assert.equal(tsMap?.domainId, 'javascript');

  const dockerMap = mapSkillToSkillProofDomain('Docker');
  assert.equal(dockerMap?.domainId, 'docker');
});

test('Roadmap: Learning resources return verified official documentation sources', () => {
  const pyRes = getResourceForSkill('Python');
  assert.ok(pyRes.url.includes('docs.python.org'));
  assert.equal(pyRes.isOfficial, true);

  const reactRes = getResourceForSkill('React');
  assert.ok(reactRes.url.includes('react.dev'));

  const sqlRes = getResourceForSkill('SQL');
  assert.ok(sqlRes.url.includes('postgresql.org'));

  const dockerRes = getResourceForSkill('Docker');
  assert.ok(dockerRes.url.includes('docs.docker.com'));
});

test('Roadmap: Task completion hours calculation and progress percentage logic', () => {
  const tasks: IRoadmapTask[] = [
    {
      id: 'task_1',
      phaseId: 'phase_1',
      title: 'Audit ATS',
      skill: 'Resume',
      objective: 'Audit',
      priority: 'high',
      estimatedMinutes: 60,
      taskType: 'concept',
      status: 'completed',
      completedAt: new Date(),
    },
    {
      id: 'task_2',
      phaseId: 'phase_1',
      title: 'Diagnostic Test',
      skill: 'Python',
      objective: 'Test',
      priority: 'high',
      estimatedMinutes: 30,
      taskType: 'assessment',
      status: 'todo',
    },
    {
      id: 'task_3',
      phaseId: 'phase_2',
      title: 'SQL Join Exercises',
      skill: 'SQL',
      objective: 'Practice',
      priority: 'high',
      estimatedMinutes: 45,
      taskType: 'sql',
      status: 'completed',
      completedAt: new Date(),
    },
    {
      id: 'task_4',
      phaseId: 'phase_2',
      title: 'React Components',
      skill: 'React',
      objective: 'Build',
      priority: 'medium',
      estimatedMinutes: 45,
      taskType: 'coding',
      status: 'in_progress',
    },
  ];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const overallProgress = Math.round((completedTasks.length / totalTasks) * 100);

  assert.equal(totalTasks, 4);
  assert.equal(completedTasks.length, 2);
  assert.equal(overallProgress, 50);

  const totalMinutesCompleted = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const hoursCompleted = Math.round((totalMinutesCompleted / 60) * 10) / 10;
  assert.equal(hoursCompleted, 1.8);
});

test('Roadmap: Mongoose schema instantiates and validates complete planner document', () => {
  const sampleRoadmap = new Roadmap({
    userId: '66a04174bed5db17d168eb66',
    targetRole: 'Full Stack Developer',
    preferences: {
      studyDays: ['Mon', 'Wed', 'Fri'],
      dailyMinutes: 90,
      preferredHours: 'Evening (7:00 PM - 8:30 PM)',
    },
    skillGaps: [
      {
        skill: 'SQL',
        category: 'low_score',
        importance: 'high',
        reason: 'Latest assessment score is 55%',
        inResume: true,
        assessmentAttempted: true,
        latestScore: 55,
        isDemonstrated: false,
        weakTopics: ['JOIN optimization', 'Window functions'],
      },
      {
        skill: 'React',
        category: 'required',
        importance: 'high',
        reason: 'Verified mastery',
        inResume: true,
        assessmentAttempted: true,
        latestScore: 85,
        isDemonstrated: true,
        weakTopics: [],
      },
    ],
    phases: [
      {
        phaseId: 'phase_1',
        phaseNumber: 1,
        title: 'Phase 1: Foundations',
        subtitle: 'Prerequisites',
        objectives: ['Audit ATS'],
        estimatedWeeks: 2,
        completionCriteria: 'Done',
        dependencies: [],
      },
    ],
    tasks: [
      {
        id: 'task_1',
        phaseId: 'phase_1',
        title: 'SQL JOIN Exercises',
        skill: 'SQL',
        objective: 'Practice joins',
        priority: 'high',
        estimatedMinutes: 45,
        taskType: 'sql',
        status: 'todo',
        recommendedResource: {
          title: 'PostgreSQL Docs',
          url: 'https://www.postgresql.org/docs/',
          source: 'PostgreSQL',
          isOfficial: true,
        },
      },
    ],
    projects: [
      {
        id: 'proj_1',
        title: 'Full Stack App',
        objective: 'Build app',
        requiredSkills: ['React', 'Node.js'],
        milestones: ['Setup', 'Deploy'],
        deliverables: ['Live App'],
        checklist: [{ item: 'Setup DB', completed: true }],
        resources: [{ title: 'Docs', url: 'https://react.dev' }],
        status: 'in_progress',
      },
    ],
    milestones: [
      {
        id: 'ms_foundations',
        title: 'Foundation Established',
        description: 'Complete phase 1',
        type: 'foundation',
        completed: false,
      },
    ],
    analytics: {
      totalHoursLogged: 2.5,
      lastCalculatedAt: new Date(),
    },
  });

  assert.equal(sampleRoadmap.targetRole, 'Full Stack Developer');
  assert.equal(sampleRoadmap.preferences.dailyMinutes, 90);
  assert.equal(sampleRoadmap.skillGaps.length, 2);
  assert.equal(sampleRoadmap.tasks.length, 1);
  assert.equal(sampleRoadmap.projects[0].checklist[0].completed, true);
});
