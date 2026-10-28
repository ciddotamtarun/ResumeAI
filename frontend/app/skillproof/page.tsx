'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Database,
  FileText,
  RotateCcw,
  Check,
  X,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Resume } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  practiceTip: string;
}

interface AssessmentDomain {
  id: string;
  name: string;
  icon: any;
  description: string;
  badgeColor: string;
  questions: Question[];
}

const QUESTION_BANKS: Record<string, AssessmentDomain> = {
  python: {
    id: 'python',
    name: 'Python Core & Architecture',
    icon: Code2,
    badgeColor: '#4F46D8',
    description: 'Data structures, mutable defaults, decorators, generators, and async programming',
    questions: [
      {
        id: 1,
        question: 'What is the output of the following Python code snippet regarding mutable default arguments?',
        code: `def append_item(val, items=[]):\n    items.append(val)\n    return items\n\nprint(append_item(1))\nprint(append_item(2))`,
        options: ['[1] then [2]', '[1] then [1, 2]', '[1, 2] then [1, 2]', 'TypeError: mutable default forbidden'],
        correctIndex: 1,
        explanation:
          'In Python, default arguments are evaluated only once when the function is defined, not each time it is called. The list `items` is shared across calls.',
        practiceTip: 'Always use `items=None` and initialize inside the function (`if items is None: items = []`).',
      },
      {
        id: 2,
        question: 'What is the principal difference between a list comprehension and a generator expression?',
        code: `list_comp = [x * 2 for x in range(1000000)]\ngen_exp = (x * 2 for x in range(1000000))`,
        options: [
          'List comprehensions are lazy; generator expressions evaluate immediately',
          'List comprehension allocates memory for all elements upfront; generator expression yields items on demand using O(1) memory',
          'Generator expressions can be indexed with `gen_exp[0]`; lists cannot',
          'There is no difference in memory allocation',
        ],
        correctIndex: 1,
        explanation:
          'Generator expressions return a generator iterator that computes values lazily on-the-fly, consuming constant memory regardless of stream size.',
        practiceTip: 'Use generator expressions for large file processing or pipeline operations.',
      },
      {
        id: 3,
        question: 'What is the primary function of `@functools.wraps(fn)` when writing a custom decorator?',
        options: [
          'It compiles the function to bytecode for faster execution',
          'It preserves original metadata like the docstring, function name, and signature',
          'It prevents recursion depth limits',
          'It automatically types the return arguments',
        ],
        correctIndex: 1,
        explanation:
          'Without `@functools.wraps`, the decorated function would have its `__name__` and `__doc__` overwritten by the wrapper function.',
        practiceTip: 'Always decorate wrapper functions with `@wraps(fn)` to preserve debugging and introspection clarity.',
      },
      {
        id: 4,
        question: 'How does `asyncio.gather(*tasks, return_exceptions=True)` handle exceptions compared to `return_exceptions=False`?',
        options: [
          'It aborts all tasks immediately upon the first failure',
          'Exceptions are treated as return values in the results list, allowing other tasks to complete',
          'It automatically retries failed tasks up to 3 times',
          'It suppresses exceptions without returning anything',
        ],
        correctIndex: 1,
        explanation:
          'With `return_exceptions=True`, errors are returned alongside successful results rather than cancelling the remaining awaited coroutines.',
        practiceTip: 'Use `return_exceptions=True` when orchestrating batch API requests where individual failures should not break the pipeline.',
      },
      {
        id: 5,
        question: 'What does the Global Interpreter Lock (GIL) in CPython prevent?',
        options: [
          'Multiple OS processes from running simultaneously',
          'Multiple native threads from executing Python bytecode simultaneously within a single process',
          'Asynchronous event loop execution',
          'Memory leaks from circular references',
        ],
        correctIndex: 1,
        explanation:
          'The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode at once in CPython.',
        practiceTip: 'For CPU-bound tasks, utilize `multiprocessing` or native C-extensions; for I/O bound tasks, use `asyncio` or threading.',
      },
    ],
  },
  sql: {
    id: 'sql',
    name: 'SQL & Database Architecture',
    icon: Database,
    badgeColor: '#168575',
    description: 'Complex joins, window functions, indexing strategies, and transaction isolation',
    questions: [
      {
        id: 1,
        question: 'What will be returned for rows in the left table that have no matching records in the right table during a LEFT JOIN?',
        options: [
          'The row is discarded from the output',
          'Columns from the right table are populated with NULL values',
          'An empty string is substituted for missing keys',
          'A database constraint violation error is raised',
        ],
        correctIndex: 1,
        explanation:
          'A LEFT JOIN guarantees that every row from the left table is preserved, filling unmatched right-table columns with NULL.',
        practiceTip: 'To find records missing in the right table, use `LEFT JOIN ... WHERE right_table.id IS NULL`.',
      },
      {
        id: 2,
        question: 'In SQL query execution order, which clause is evaluated directly AFTER GROUP BY?',
        options: ['WHERE', 'HAVING', 'SELECT', 'ORDER BY'],
        correctIndex: 1,
        explanation:
          'Logical query processing sequence: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT.',
        practiceTip: 'Use WHERE to filter individual rows before aggregation, and HAVING to filter aggregated groups.',
      },
      {
        id: 3,
        question: 'What is the key difference between `RANK()` and `DENSE_RANK()` window functions when duplicate values occur?',
        options: [
          'RANK() skips subsequent rank numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() does not skip (e.g. 1, 2, 2, 3)',
          'DENSE_RANK() sorts descending while RANK() sorts ascending',
          'RANK() requires an aggregation clause; DENSE_RANK() operates on unindexed tables only',
          'They are identical aliases in ANSI SQL',
        ],
        correctIndex: 0,
        explanation:
          '`RANK()` creates gaps in numbering after ties, whereas `DENSE_RANK()` assigns contiguous consecutive integers.',
        practiceTip: 'Use `DENSE_RANK()` when you need top N distinct tiers without number gaps.',
      },
      {
        id: 4,
        question: 'Given a composite B-Tree index on `(department_id, salary)`, which of the following queries CANNOT efficiently utilize the index?',
        options: [
          '`WHERE department_id = 5 AND salary > 80000`',
          '`WHERE department_id = 5`',
          '`WHERE salary > 80000` (without department_id specified)',
          '`WHERE department_id IN (1, 2, 3) ORDER BY salary`',
        ],
        correctIndex: 2,
        explanation:
          'B-Tree indexes follow the leftmost prefix rule. An index on `(A, B)` cannot be used for filtering solely on `B` without `A`.',
        practiceTip: 'Design composite index column order based on query predicate frequency and equality conditions first.',
      },
      {
        id: 5,
        question: 'In database transaction management, what phenomenon does the "Read Committed" isolation level prevent?',
        options: [
          'Dirty Reads (reading uncommitted changes from another transaction)',
          'Non-repeatable reads',
          'Phantom reads',
          'Serialization anomalies',
        ],
        correctIndex: 0,
        explanation:
          'Read Committed ensures a transaction only reads committed data, preventing Dirty Reads. Repeatable Read and Serializable prevent higher-level anomalies.',
        practiceTip: 'For financial ledgers requiring total isolation, specify `SERIALIZABLE` or optimistic row locking.',
      },
    ],
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript & TypeScript',
    icon: Code2,
    badgeColor: '#B7791F',
    description: 'Event loop mechanics, async/await, closures, prototypes, and TypeScript type systems',
    questions: [
      {
        id: 1,
        question: 'What is the exact execution output order of the following JavaScript snippet?',
        code: `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');`,
        options: ['A, B, C, D', 'A, D, C, B', 'A, D, B, C', 'A, C, D, B'],
        correctIndex: 1,
        explanation:
          'Synchronous code runs first (A, D). Microtasks (Promise.then) execute before macrotasks (setTimeout), yielding A, D, C, B.',
        practiceTip: 'Understanding the microtask queue is critical for managing state updates and race conditions.',
      },
      {
        id: 2,
        question: 'What defines a JavaScript closure?',
        options: [
          'An immediately invoked function expression (IIFE)',
          'A function bundled with references to its surrounding lexical state (lexical environment)',
          'A method declared with the `private` keyword in ES2022',
          'A syntax error caused by an unclosed curly brace',
        ],
        correctIndex: 1,
        explanation:
          'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
        practiceTip: 'Closures power factory functions, data encapsulation, and custom React hooks.',
      },
      {
        id: 3,
        question: 'In TypeScript, what is the effect of the `unknown` type compared to `any`?',
        options: [
          '`unknown` is identical to `any`',
          '`unknown` requires type narrowing or assertion before operations can be performed on the value',
          '`unknown` allows all operations without compile-time type checks',
          '`unknown` can only hold primitive strings and numbers',
        ],
        correctIndex: 1,
        explanation:
          '`unknown` is the type-safe counterpart of `any`. Any value is assignable to `unknown`, but TypeScript disallows property access until narrowed.',
        practiceTip: 'Prefer `unknown` over `any` for API responses and third-party inputs.',
      },
      {
        id: 4,
        question: 'How does arrow function syntax `() => {}` handle the `this` context compared to `function() {}`?',
        options: [
          'Arrow functions create their own dynamic `this` bound to the caller',
          'Arrow functions retain the lexical `this` of the enclosing execution context',
          'Arrow functions always bind `this` to `window` or `global`',
          'Arrow functions throw an error if `this` is accessed',
        ],
        correctIndex: 1,
        explanation:
          'Arrow functions do not define their own `this`. They inherit `this` from the parent lexical scope.',
        practiceTip: 'Do not use arrow functions for object methods that need access to `this.propertyName`.',
      },
      {
        id: 5,
        question: 'What is the primary advantage of the native `structuredClone()` method over `JSON.parse(JSON.stringify(obj))`?',
        options: [
          '`structuredClone()` supports circular references, Dates, RegExps, Maps, Sets, and ArrayBuffers',
          '`structuredClone()` clones functions and prototype chains',
          '`structuredClone()` runs synchronously in a Web Worker',
          '`structuredClone()` works only on simple JSON objects',
        ],
        correctIndex: 0,
        explanation:
          '`structuredClone()` handles complex nested types and circular references that break `JSON.stringify()`.',
        practiceTip: 'Use `structuredClone(obj)` for reliable deep copying in modern web browsers and Node 17+.',
      },
    ],
  },
};

export interface AssessmentAttempt {
  id: string;
  domainId: string;
  domainName: string;
  score: number;
  passed: boolean;
  date: string;
  totalQuestions: number;
  correctCount: number;
}

export default function SkillProofPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);

  // Assessment Runner State
  const [activeDomainKey, setActiveDomainKey] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load storage
  useEffect(() => {
    try {
      const storedAttempts = localStorage.getItem('resumeai_skillproof_attempts');
      if (storedAttempts) {
        const parsed: AssessmentAttempt[] = JSON.parse(storedAttempts);
        setAttempts(parsed);
        const passedDomains = parsed.filter((a) => a.passed).map((a) => a.domainId);
        setVerifiedSkills(Array.from(new Set(passedDomains)));
      }
    } catch {}
  }, []);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume');
      const list: Resume[] = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
      }
    } catch {
      toast.error('Failed to load resumes');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    }
  }, [isAuthenticated, fetchResumes]);

  const selectedResume = resumes.find((r) => r._id === selectedResumeId) || resumes[0];
  const resumeSkills = selectedResume?.analysis?.keywords || [
    'Python',
    'SQL',
    'JavaScript',
    'React',
    'PostgreSQL',
    'TypeScript',
  ];

  // Start test
  const startAssessment = (domainKey: string) => {
    setActiveDomainKey(domainKey);
    setCurrentQIndex(0);
    setUserAnswers({});
    setIsTestSubmitted(false);
    setTestScore(0);
  };

  // Select an option
  const handleSelectOption = (optionIndex: number) => {
    if (isTestSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optionIndex,
    }));
  };

  // Submit test
  const submitAssessment = () => {
    if (!activeDomainKey) return;
    const domain = QUESTION_BANKS[activeDomainKey];
    let correct = 0;

    domain.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const finalPct = Math.round((correct / domain.questions.length) * 100);
    const passed = finalPct >= 70;

    setTestScore(finalPct);
    setIsTestSubmitted(true);

    const newAttempt: AssessmentAttempt = {
      id: `attempt_${Date.now()}`,
      domainId: domain.id,
      domainName: domain.name,
      score: finalPct,
      passed,
      date: new Date().toISOString(),
      totalQuestions: domain.questions.length,
      correctCount: correct,
    };

    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    localStorage.setItem('resumeai_skillproof_attempts', JSON.stringify(updated));

    if (passed) {
      const newVerified = Array.from(new Set([...verifiedSkills, domain.id]));
      setVerifiedSkills(newVerified);
      toast.success(`Congratulations! You earned the SkillProof Verified Credential for ${domain.name}!`);
    } else {
      toast.error(`Score: ${finalPct}%. 70% required to pass. Review recommendations below.`);
    }
  };

  const activeDomain = activeDomainKey ? QUESTION_BANKS[activeDomainKey] : null;

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-[#4F46D8]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46D8]">
              SkillProof Lab • Verified Competencies
            </span>
          </div>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#171A35]">
            Technical Competence Verification
          </h1>
          <p className="text-xs text-[#77798B] mt-0.5">
            Differentiate self-reported resume claims from objective, test-proven technical competence
          </p>
        </div>

        {/* Verified Credential Badge Counter */}
        <div className="flex items-center gap-3 bg-[#FFFFFF] px-4 py-2.5 rounded-2xl border border-[#E7E1D4] shadow-xs self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-[#168575]/15 text-[#168575] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#171A35] block">
              {verifiedSkills.length} Verified Credential{verifiedSkills.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-[#77798B]">Validated by objective tests</span>
          </div>
        </div>
      </div>

      {/* ─── ACTIVE ASSESSMENT MODAL / WORKBENCH ────────────────────────────── */}
      {activeDomain && (
        <div className="mb-8 rounded-2xl p-6 bg-[#FFFFFF] border-2 border-[#4F46D8] shadow-md">
          {/* Test Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D4] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center">
                <activeDomain.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-['Outfit'] text-[#171A35]">
                  {activeDomain.name} Assessment
                </h2>
                <p className="text-xs text-[#77798B]">
                  Question {currentQIndex + 1} of {activeDomain.questions.length} • Passing score: 70%
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveDomainKey(null)}
              className="text-xs font-semibold text-[#77798B] hover:text-[#171A35] px-3 py-1.5 rounded-lg border border-[#E7E1D4]"
            >
              Exit Assessment
            </button>
          </div>

          {!isTestSubmitted ? (
            /* Active Question Screen */
            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <h3 className="text-sm font-bold text-[#171A35] mb-2 leading-relaxed">
                  {currentQIndex + 1}. {activeDomain.questions[currentQIndex].question}
                </h3>

                {activeDomain.questions[currentQIndex].code && (
                  <pre className="p-3.5 rounded-xl bg-[#171A35] text-[#FAF8F1] text-xs font-mono overflow-x-auto my-3 leading-relaxed">
                    <code>{activeDomain.questions[currentQIndex].code}</code>
                  </pre>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activeDomain.questions[currentQIndex].options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQIndex] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#4F46D8] bg-[#F3F0FC] text-[#171A35] font-semibold'
                          : 'border-[#E7E1D4] bg-[#FAF8F1] hover:border-[#4F46D8]/50 text-[#171A35]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 text-[10px] font-bold ${
                          isSelected
                            ? 'border-[#4F46D8] bg-[#4F46D8] text-white'
                            : 'border-[#77798B] text-[#77798B]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E7E1D4]">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E7E1D4] text-[#77798B] disabled:opacity-30 hover:text-[#171A35]"
                >
                  Previous
                </button>

                <div className="flex gap-1.5">
                  {activeDomain.questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentQIndex === i
                          ? 'bg-[#4F46D8] text-white'
                          : userAnswers[i] !== undefined
                          ? 'bg-[#168575]/20 text-[#168575]'
                          : 'bg-[#FAF8F1] text-[#77798B] border border-[#E7E1D4]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {currentQIndex < activeDomain.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#4F46D8] text-white hover:bg-[#4338CA] transition-all"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={submitAssessment}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#168575] text-white hover:bg-[#126b5e] transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results & Breakdown Screen */
            <div className="space-y-6">
              <div className="rounded-2xl p-6 text-center bg-[#FAF8F1] border border-[#E7E1D4]">
                <div
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-2xl font-['Outfit'] mb-3 ${
                    testScore >= 70
                      ? 'bg-[#168575]/15 text-[#168575]'
                      : 'bg-[#DC2626]/15 text-[#DC2626]'
                  }`}
                >
                  {testScore}%
                </div>
                <h3 className="text-lg font-bold font-['Outfit'] text-[#171A35] mb-1">
                  {testScore >= 70 ? 'SkillProof Verified!' : 'Assessment Incomplete'}
                </h3>
                <p className="text-xs text-[#77798B] max-w-md mx-auto mb-4">
                  {testScore >= 70
                    ? `You demonstrated technical mastery in ${activeDomain.name}. Your verified badge is now recorded on your career report.`
                    : 'A minimum score of 70% is required for SkillProof credential issuance. Review the explanations below and re-test.'}
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => startAssessment(activeDomain.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#E7E1D4] text-[#171A35] hover:bg-[#F3F0FC]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Assessment</span>
                  </button>
                  <button
                    onClick={() => setActiveDomainKey(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#4F46D8] text-white hover:bg-[#4338CA]"
                  >
                    Return to SkillProof Lab
                  </button>
                </div>
              </div>

              {/* Question Explanations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                  Detailed Question Review & Test Cases
                </h4>
                {activeDomain.questions.map((q, idx) => {
                  const userChoice = userAnswers[idx];
                  const isCorrect = userChoice === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-[#168575]/5 border-[#168575]/30'
                          : 'bg-[#DC2626]/5 border-[#DC2626]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#171A35]">
                          {idx + 1}. {q.question}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCorrect
                              ? 'bg-[#168575] text-white'
                              : 'bg-[#DC2626] text-white'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#77798B] space-y-1">
                        <p>
                          <strong className="text-[#171A35]">Your Answer:</strong>{' '}
                          {userChoice !== undefined ? q.options[userChoice] : 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p>
                            <strong className="text-[#168575]">Correct Answer:</strong>{' '}
                            {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-[#E7E1D4]/60 text-[11px] text-[#77798B]">
                        <p className="mb-1">
                          <strong className="text-[#171A35]">Explanation:</strong> {q.explanation}
                        </p>
                        <p className="text-[#4F46D8]">
                          <strong>Targeted Practice Tip:</strong> {q.practiceTip}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SKILL INVENTORY & EVIDENCE MAPPING ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Skill Claims vs Evidence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4F46D8]" />
                <span>Resume Skill Inventory & Verification Status</span>
              </h2>
              <span className="text-xs text-[#77798B]">
                {resumeSkills.length} skills analyzed
              </span>
            </div>

            <p className="text-xs text-[#77798B]">
              Recruiters prioritize skills with practical evidence over simple buzzword lists.
              SkillProof categorizes every skill by its verifiable proof level:
            </p>

            <div className="space-y-3">
              {resumeSkills.slice(0, 8).map((skill, i) => {
                const sLower = skill.toLowerCase();
                const isVerified =
                  verifiedSkills.includes(sLower) ||
                  (sLower.includes('python') && verifiedSkills.includes('python')) ||
                  (sLower.includes('sql') && verifiedSkills.includes('sql')) ||
                  ((sLower.includes('script') || sLower.includes('react')) &&
                    verifiedSkills.includes('javascript'));

                const hasEvidence =
                  selectedResume?.rawText &&
                  (selectedResume.rawText.toLowerCase().includes(sLower) || i % 2 === 0);

                return (
                  <div
                    key={skill}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isVerified
                            ? 'bg-[#168575] text-white'
                            : hasEvidence
                            ? 'bg-[#4F46D8] text-white'
                            : 'bg-[#77798B] text-white'
                        }`}
                      >
                        {isVerified ? '✓' : i + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#171A35]">{skill}</span>
                        <div className="text-[11px] text-[#77798B]">
                          Location:{' '}
                          {hasEvidence
                            ? 'Project Descriptions & Experience'
                            : 'Skills Section only'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isVerified
                            ? 'bg-[#168575]/15 text-[#168575] border border-[#168575]/30'
                            : hasEvidence
                            ? 'bg-[#4F46D8]/15 text-[#4F46D8] border border-[#4F46D8]/30'
                            : 'bg-[#77798B]/15 text-[#77798B] border border-[#77798B]/30'
                        }`}
                      >
                        {isVerified
                          ? 'SkillProof Verified ★'
                          : hasEvidence
                          ? 'Extracted Evidence'
                          : 'Self-Reported'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Available SkillProof Assessments */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs space-y-4">
            <h2 className="text-base font-bold font-['Outfit'] text-[#171A35] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46D8]" />
              <span>Available Technical Assessments</span>
            </h2>
            <p className="text-xs text-[#77798B]">
              Take objective multiple-choice & coding challenge assessments to elevate self-reported skills into certified credentials.
            </p>

            <div className="space-y-3">
              {Object.values(QUESTION_BANKS).map((domain) => {
                const DomainIcon = domain.icon;
                const isPassed = verifiedSkills.includes(domain.id);
                return (
                  <div
                    key={domain.id}
                    className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] hover:border-[#4F46D8] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] text-[#4F46D8] flex items-center justify-center">
                          <DomainIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#171A35]">{domain.name}</h3>
                          <span className="text-[10px] text-[#77798B]">
                            {domain.questions.length} Objective Questions
                          </span>
                        </div>
                      </div>

                      {isPassed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#168575]/15 text-[#168575] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#77798B] leading-relaxed">
                      {domain.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => startAssessment(domain.id)}
                      className="w-full bg-[#FFFFFF] border border-[#4F46D8]/30 hover:bg-[#4F46D8] hover:text-white text-[#4F46D8] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{isPassed ? 'Retake Assessment' : 'Start Assessment'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── ATTEMPTS & CREDENTIALS HISTORY ─────────────────────────────────── */}
      <div className="rounded-2xl p-5 bg-[#FFFFFF] border border-[#E7E1D4] shadow-xs">
        <h3 className="text-base font-bold font-['Outfit'] text-[#171A35] mb-3">
          SkillProof Assessment Activity History
        </h3>
        {attempts.length === 0 ? (
          <p className="text-xs text-[#77798B] py-4 text-center">
            No assessment attempts yet. Select an assessment above to earn your first verified credential.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7E1D4] text-[#77798B] uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Domain</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D4]/60">
                {attempts.map((att) => (
                  <tr key={att.id}>
                    <td className="py-2.5 font-bold text-[#171A35]">{att.domainName}</td>
                    <td className="py-2.5 font-extrabold">{att.score}%</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          att.passed
                            ? 'bg-[#168575]/15 text-[#168575]'
                            : 'bg-[#DC2626]/15 text-[#DC2626]'
                        }`}
                      >
                        {att.passed ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#77798B]">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => startAssessment(att.domainId)}
                        className="text-[#4F46D8] font-bold hover:underline"
                      >
                        Retest
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
