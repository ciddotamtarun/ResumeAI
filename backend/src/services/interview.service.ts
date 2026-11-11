import { generateChatCompletion, AIProvider, AIServiceError } from './ai.service';
import { IInterviewer, IFinalResults } from '../models/Interview.model';

export const FEMALE_INTERVIEWER: IInterviewer = {
  id: 'female',
  name: 'Sarah Jenkins',
  title: 'Senior Technical Recruiter & Hiring Lead',
  gender: 'female',
  avatar: '/avatars/female.svg',
  voiceName: 'Female',
  description: 'Insightful, supportive, and focused on practical problem solving and team impact.',
};

export const MALE_INTERVIEWER: IInterviewer = {
  id: 'male',
  name: 'David Chen',
  title: 'Director of Engineering & Technical Interviewer',
  gender: 'male',
  avatar: '/avatars/male.svg',
  voiceName: 'Male',
  description: 'Rigorous, pragmatic, and focused on system architecture, code trade-offs, and execution.',
};

export interface InterviewConfig {
  targetRole: string;
  category: 'mixed' | 'technical' | 'hr' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'difficult';
  questionCount: number;
  interviewer?: IInterviewer;
}

export const buildSystemPrompt = (resumeText: string, config: InterviewConfig): string => {
  const interviewer = config.interviewer || FEMALE_INTERVIEWER;
  const targetRole = config.targetRole || 'Software Professional';
  const category = config.category || 'mixed';
  const difficulty = config.difficulty || 'medium';

  const categoryGuidanceMap: Record<string, string> = {
    technical: `FOCUS: Technical Interview.
- Thoroughly test programming languages, frameworks, system architecture, database optimization, API design, debugging, and edge cases.
- Dig into candidate's actual projects, libraries, and tools listed on their resume.
- Ask how they architected key features, addressed performance bottlenecks, or resolved production bugs.`,
    hr: `FOCUS: HR & Culture Fit Interview.
- Focus on candidate's career motivation, work values, communication style, cultural alignment, strengths, weaknesses, and future aspirations.
- Ask about transitions between jobs/schools listed on resume, how they handle feedback, and what kind of environment they thrive in.`,
    behavioral: `FOCUS: Behavioral & Situational Interview (STAR format: Situation, Task, Action, Result).
- Focus on real-life experiences: leadership, resolving conflicts, overcoming project failures, taking ownership under tight deadlines, and managing ambiguity.
- Prompt candidate to describe specific situations from their past companies or academic projects.`,
    mixed: `FOCUS: Mixed Interview (Comprehensive).
- Provide a balanced mix across: 1) Core technical skills & architecture, 2) Past project impact and problem solving, 3) Team collaboration, ownership, and communication.`,
  };

  const difficultyGuidanceMap: Record<string, string> = {
    easy: `DIFFICULTY: Easy.
- Ask foundational, clear, and encouraging questions.
- Focus on standard project overviews, conceptual definitions, and standard workflows.`,
    medium: `DIFFICULTY: Medium.
- Ask realistic, industry-standard interview questions.
- Probe the "why" behind decisions on resume, trade-offs between alternative technologies, and real production considerations.`,
    difficult: `DIFFICULTY: Difficult.
- Set a high senior-level bar.
- Challenge assumptions, probe failure scenarios, edge cases, scalability limitations, tough cross-functional disagreements, and deep technical or leadership trade-offs.`,
  };

  return `You are ${interviewer.name}, ${interviewer.title}.
You are conducting a realistic mock interview for a candidate applying for the role of **${targetRole}**.

INTERVIEW DETAILS:
- Candidate Target Role: ${targetRole}
- Interview Category: ${category.toUpperCase()}
- Difficulty Level: ${difficulty.toUpperCase()}
- Target Number of Questions: ${config.questionCount}

CANDIDATE RESUME CONTEXT:
---
${resumeText.substring(0, 6000)}
---

${categoryGuidanceMap[category] || categoryGuidanceMap.mixed}

${difficultyGuidanceMap[difficulty] || difficultyGuidanceMap.medium}

CRITICAL INTERVIEW RULES — ALWAYS OBEY:
1. Always stay in character as ${interviewer.name}. Maintain a professional, realistic, and engaging demeanor.
2. Ask exactly ONE question at a time. Never ask compound or multiple questions at once.
3. Every question MUST be grounded in the candidate's actual resume (referencing specific projects, companies, skills, tools, or metrics) or the core competencies of the ${targetRole} position.
4. NEVER invent candidate achievements or claim the resume contains experiences that are not listed.
5. In follow-up turns, give a brief 1-sentence natural reaction or acknowledgment to the candidate's previous response, then seamlessly transition to the next question.
6. Adapt subsequent questions based on the depth or gaps of the candidate's previous answers.
7. Do NOT give numeric scores, grades, or critique during the live interview conversation. Save all evaluation for the end.`;
};

export function cleanInterviewerMessage(raw: string): string {
  if (!raw) return '';
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // If the model wrapped in markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // If the model wrapped in JSON: {"question": "...", "response": "..."}
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.question === 'string') return parsed.question.trim();
      if (typeof parsed.response === 'string') return parsed.response.trim();
      if (typeof parsed.message === 'string') return parsed.message.trim();
      if (typeof parsed.content === 'string') return parsed.content.trim();
    } catch {
      // Continue with text
    }
  }

  // Strip leading/trailing quotes if accidentally wrapped
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }

  return text;
}

export async function generateInterviewerResponse(
  messages: Array<{ role: string; content: string }>,
  resumeText: string,
  isStart: boolean,
  config: InterviewConfig,
  provider: AIProvider = 'gemini'
): Promise<string> {
  const systemPrompt = buildSystemPrompt(resumeText, config);
  const interviewer = config.interviewer || FEMALE_INTERVIEWER;
  const targetRole = config.targetRole || 'the target role';

  let raw = '';
  if (isStart) {
    const greetingPrompt = `You are beginning the interview. Introduce yourself warmly as ${interviewer.name}, ${interviewer.title}. State that you are pleased to meet the candidate for their ${config.category} interview for the ${targetRole} position. Then immediately ask your FIRST interview question, referencing a specific skill, role, or project from their resume. Keep your introduction brief (under 3 sentences) before the question.`;
    raw = await generateChatCompletion([{ role: 'user', content: greetingPrompt }], systemPrompt, provider, 1500, 0.7);
  } else {
    // Format message history
    const formattedMessages = messages.map((m) => ({
      role: m.role === 'interviewer' ? 'assistant' : 'user',
      content: m.content,
    }));
    raw = await generateChatCompletion(formattedMessages, systemPrompt, provider, 1500, 0.7);
  }

  return cleanInterviewerMessage(raw);
}

/**
 * Balance unclosed quotes and brackets when JSON is truncated by max_tokens.
 */
function balanceAndCloseJSON(str: string): string | null {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}' || char === ']') {
      if (stack.length > 0) {
        stack.pop();
      }
    }
  }

  let result = str.trim();
  if (inString) {
    result += '"';
  }

  // Clean trailing dangling comma before closing
  result = result.replace(/,\s*$/, '');

  // Close remaining open brackets in reverse order
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') result += '}';
    if (open === '[') result += ']';
  }

  return result;
}

/**
 * Robust multi-stage JSON parser with repair capabilities for LLM responses.
 */
export function extractAndParseJSON(raw: string): any {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Response was empty or null');
  }

  // 1. Strip reasoning blocks like <think>...</think>
  let clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!clean) clean = raw.trim();

  // 2. Extract markdown code fences
  const fences = [...clean.matchAll(/```(?:json)?[ \t]*\r?\n?([\s\S]*?)```/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean);

  const candidates: string[] = [];
  if (fences.length > 0) {
    candidates.push(...fences);
  }
  candidates.push(clean);

  // 3. Try parsing clean candidates directly
  for (const cand of candidates) {
    try {
      const obj = JSON.parse(cand);
      if (obj && typeof obj === 'object') return obj;
    } catch {
      // Continue to next recovery strategy
    }
  }

  // 4. Try slicing outermost { ... }
  for (const cand of candidates) {
    const firstBrace = cand.indexOf('{');
    const lastBrace = cand.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = cand.slice(firstBrace, lastBrace + 1);
      try {
        const obj = JSON.parse(sliced);
        if (obj && typeof obj === 'object') return obj;
      } catch {
        // Remove trailing commas e.g. {"a": 1, }
        const cleaned = sliced.replace(/,\s*([}\]])/g, '$1');
        try {
          const obj = JSON.parse(cleaned);
          if (obj && typeof obj === 'object') return obj;
        } catch {
          // Continue
        }
      }
    }
  }

  // 5. Try truncation repair on candidate starting from first '{'
  for (const cand of candidates) {
    const firstBrace = cand.indexOf('{');
    if (firstBrace === -1) continue;
    const snippet = cand.slice(firstBrace);
    const repaired = balanceAndCloseJSON(snippet);
    if (repaired) {
      try {
        const obj = JSON.parse(repaired);
        if (obj && typeof obj === 'object') return obj;
      } catch {
        const noTrailing = repaired.replace(/,\s*([}\]])/g, '$1');
        try {
          const obj = JSON.parse(noTrailing);
          if (obj && typeof obj === 'object') return obj;
        } catch {
          // Continue
        }
      }
    }
  }

  throw new Error('No valid JSON object could be extracted from AI response');
}

export async function generateInterviewResults(
  messages: Array<{ role: string; content: string }>,
  resumeText: string,
  config: InterviewConfig,
  provider: AIProvider = 'gemini'
): Promise<IFinalResults> {
  const candidateAnswers = messages.filter((m) => m.role === 'candidate');

  if (candidateAnswers.length === 0) {
    throw new AIServiceError('No candidate answers were recorded in this interview session.', 400);
  }

  const interviewerQuestions = messages.filter((m) => m.role === 'interviewer');
  const conversation = messages
    .map((m) => `${m.role === 'interviewer' ? (config.interviewer?.name || 'Interviewer') : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const evaluationPrompt = `You are an expert executive hiring panel and senior interview coach.
Analyze the following mock interview conversation objectively against the candidate's target role, resume, category, and difficulty.

INTERVIEW CONTEXT:
- Target Role: ${config.targetRole}
- Interview Category: ${config.category}
- Difficulty Level: ${config.difficulty}
- Total Questions Asked: ${interviewerQuestions.length}
- Total Answers Given: ${candidateAnswers.length}

CANDIDATE RESUME:
${resumeText.substring(0, 4000)}

INTERVIEW TRANSCRIPT:
${conversation}

CRITICAL EVALUATION INSTRUCTIONS:
- Score objectively based strictly on the candidate's answers and demonstrated knowledge.
- Do NOT score based on accent, appearance, or background.
- Provide concrete evidence for each assessment.
- For categories not assessed in this interview type (for example, if a purely HR interview had no technical questions), set "assessed": false.
- For every question asked, provide specific constructive feedback, missing concepts, and an exemplary model answer clearly labeled as an example.

Return ONLY a valid JSON object matching this exact structure (no markdown, raw JSON only):
{
  "overallScore": <integer 0-100>,
  "performanceLevel": "<e.g. Exceptional / Ready for Target Role / Developing / Needs Significant Preparation>",
  "completionStatus": "completed",
  "questionsAnswered": ${candidateAnswers.length},
  "summary": "<2-3 paragraph comprehensive executive summary of candidate performance>",
  "categoryScores": {
    "technicalKnowledge": { "score": <0-100>, "assessed": <boolean>, "feedback": "<concise feedback>" },
    "problemSolving": { "score": <0-100>, "assessed": <boolean>, "feedback": "<concise feedback>" },
    "communicationClarity": { "score": <0-100>, "assessed": <boolean>, "feedback": "<concise feedback>" },
    "behavioralCompetence": { "score": <0-100>, "assessed": <boolean>, "feedback": "<concise feedback>" },
    "roleResumeAlignment": { "score": <0-100>, "assessed": <boolean>, "feedback": "<concise feedback>" }
  },
  "questionAnalysis": [
    {
      "question": "<interviewer question text>",
      "candidateAnswer": "<candidate answer text>",
      "score": <0-100>,
      "whatWentWell": "<specific strengths in this response>",
      "missingConcepts": "<concepts, metrics, or technologies that should have been mentioned>",
      "suggestedImprovement": "<actionable advice on how to structure a stronger answer>",
      "modelAnswerExample": "<a stellar example response demonstrating best practices>"
    }
  ],
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "areasForImprovement": [
    "<critical improvement area 1>",
    "<critical improvement area 2>",
    "<critical improvement area 3>"
  ],
  "unsupportedClaimsOrGaps": [
    "<gap or missed opportunity to highlight relevant resume projects>"
  ],
  "personalizedPlan": {
    "topicsToStudy": ["<topic 1>", "<topic 2>", "<topic 3>"],
    "skillsToStrengthen": ["<skill 1>", "<skill 2>", "<skill 3>"],
    "recommendedPracticeQuestions": ["<practice question 1>", "<practice question 2>"],
    "actionableNextSteps": ["<step 1>", "<step 2>", "<step 3>"]
  },
  "finalSummary": {
    "readinessAssessment": "<clear statement on readiness for target role>",
    "priorityImprovements": ["<top priority 1>", "<top priority 2>", "<top priority 3>"],
    "recommendedNextSession": "<suggestion for next mock interview focus>"
  }
}`;

  console.log(`[Interview] Requesting final evaluation (questions: ${interviewerQuestions.length}, answers: ${candidateAnswers.length})...`);

  // MaxTokens: 4000 to prevent JSON truncation
  const response = await generateChatCompletion(
    [{ role: 'user', content: evaluationPrompt }],
    'You are a senior interview evaluator. Always output valid JSON only. Do not wrap in markdown.',
    provider,
    4000,
    0.6
  );

  return parseInterviewResults(response, candidateAnswers.length, messages);
}

export function parseInterviewResults(
  response: string,
  fallbackCount: number,
  transcriptMessages?: Array<{ role: string; content: string }>
): IFinalResults {
  if (!response || !response.trim()) {
    throw new AIServiceError('AI returned an empty interview evaluation response.', 502);
  }

  let parsed: any = null;
  try {
    parsed = extractAndParseJSON(response);
  } catch (parseErr: any) {
    console.error('[InterviewService] parseInterviewResults: failed to parse JSON for interview results', {
      responseLength: response.length,
      responsePreview: response.slice(0, 180),
      error: parseErr?.message,
    });
    throw new AIServiceError('AI returned malformed JSON for interview response.', 502, parseErr);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AIServiceError('AI returned malformed JSON for interview response.', 502);
  }

  // Normalize and ensure all required fields exist
  const overallScore = typeof parsed.overallScore === 'number' && Number.isFinite(parsed.overallScore)
    ? Math.max(0, Math.min(100, Math.round(parsed.overallScore)))
    : 75;
  const techScore = parsed.categoryScores?.technicalKnowledge?.score ?? parsed.technicalScore ?? overallScore;
  const commScore = parsed.categoryScores?.communicationClarity?.score ?? parsed.communicationScore ?? overallScore;
  const behavScore = parsed.categoryScores?.behavioralCompetence?.score ?? parsed.behavioralScore ?? overallScore;

  // Build questionAnalysis, reconstructing from transcript if needed
  let questionAnalysis: any[] = [];
  if (Array.isArray(parsed.questionAnalysis) && parsed.questionAnalysis.length > 0) {
    questionAnalysis = parsed.questionAnalysis.map((qa: any) => ({
      question: qa.question || '',
      candidateAnswer: qa.candidateAnswer || '',
      score: typeof qa.score === 'number' ? qa.score : overallScore,
      whatWentWell: qa.whatWentWell || 'Addressed the question clearly.',
      missingConcepts: qa.missingConcepts || '',
      suggestedImprovement: qa.suggestedImprovement || 'Provide concrete examples with quantified results.',
      modelAnswerExample: qa.modelAnswerExample || '',
    }));
  } else if (transcriptMessages && transcriptMessages.length > 0) {
    // Reconstruct pairs from transcript
    for (let i = 0; i < transcriptMessages.length; i++) {
      if (transcriptMessages[i].role === 'candidate') {
        const prevQ = i > 0 && transcriptMessages[i - 1].role === 'interviewer'
          ? transcriptMessages[i - 1].content
          : 'Interview Question';
        questionAnalysis.push({
          question: prevQ,
          candidateAnswer: transcriptMessages[i].content,
          score: overallScore,
          whatWentWell: 'Grounded response covering practical experience.',
          missingConcepts: '',
          suggestedImprovement: 'Structure response with Situation, Task, Action, and Result (STAR).',
          modelAnswerExample: 'In my previous project, I solved this by...',
        });
      }
    }
  }

  const result: IFinalResults = {
    overallScore,
    performanceLevel: parsed.performanceLevel || (overallScore >= 85 ? 'Ready for Target Role' : overallScore >= 70 ? 'Developing' : 'Needs Preparation'),
    completionStatus: parsed.completionStatus || 'completed',
    questionsAnswered: typeof parsed.questionsAnswered === 'number' ? parsed.questionsAnswered : fallbackCount,
    summary: parsed.summary || 'Interview completed successfully.',
    categoryScores: {
      technicalKnowledge: {
        score: typeof parsed.categoryScores?.technicalKnowledge?.score === 'number' ? parsed.categoryScores.technicalKnowledge.score : techScore,
        assessed: parsed.categoryScores?.technicalKnowledge?.assessed ?? true,
        feedback: parsed.categoryScores?.technicalKnowledge?.feedback || '',
      },
      problemSolving: {
        score: typeof parsed.categoryScores?.problemSolving?.score === 'number' ? parsed.categoryScores.problemSolving.score : overallScore,
        assessed: parsed.categoryScores?.problemSolving?.assessed ?? true,
        feedback: parsed.categoryScores?.problemSolving?.feedback || '',
      },
      communicationClarity: {
        score: typeof parsed.categoryScores?.communicationClarity?.score === 'number' ? parsed.categoryScores.communicationClarity.score : commScore,
        assessed: parsed.categoryScores?.communicationClarity?.assessed ?? true,
        feedback: parsed.categoryScores?.communicationClarity?.feedback || '',
      },
      behavioralCompetence: {
        score: typeof parsed.categoryScores?.behavioralCompetence?.score === 'number' ? parsed.categoryScores.behavioralCompetence.score : behavScore,
        assessed: parsed.categoryScores?.behavioralCompetence?.assessed ?? true,
        feedback: parsed.categoryScores?.behavioralCompetence?.feedback || '',
      },
      roleResumeAlignment: {
        score: typeof parsed.categoryScores?.roleResumeAlignment?.score === 'number' ? parsed.categoryScores.roleResumeAlignment.score : overallScore,
        assessed: parsed.categoryScores?.roleResumeAlignment?.assessed ?? true,
        feedback: parsed.categoryScores?.roleResumeAlignment?.feedback || '',
      },
    },
    questionAnalysis,
    strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
      ? parsed.strengths.filter((s: any) => typeof s === 'string')
      : ['Strong candidate background', 'Relevant industry experience'],
    areasForImprovement: Array.isArray(parsed.areasForImprovement) && parsed.areasForImprovement.length > 0
      ? parsed.areasForImprovement.filter((s: any) => typeof s === 'string')
      : ['Provide more quantified metrics in project descriptions'],
    unsupportedClaimsOrGaps: Array.isArray(parsed.unsupportedClaimsOrGaps) ? parsed.unsupportedClaimsOrGaps.filter((s: any) => typeof s === 'string') : [],
    personalizedPlan: {
      topicsToStudy: Array.isArray(parsed.personalizedPlan?.topicsToStudy) ? parsed.personalizedPlan.topicsToStudy : [],
      skillsToStrengthen: Array.isArray(parsed.personalizedPlan?.skillsToStrengthen) ? parsed.personalizedPlan.skillsToStrengthen : [],
      recommendedPracticeQuestions: Array.isArray(parsed.personalizedPlan?.recommendedPracticeQuestions) ? parsed.personalizedPlan.recommendedPracticeQuestions : [],
      actionableNextSteps: Array.isArray(parsed.personalizedPlan?.actionableNextSteps) ? parsed.personalizedPlan.actionableNextSteps : [],
    },
    finalSummary: {
      readinessAssessment: parsed.finalSummary?.readinessAssessment || `Demonstrated solid fundamentals for ${overallScore}% fit.`,
      priorityImprovements: Array.isArray(parsed.finalSummary?.priorityImprovements) ? parsed.finalSummary.priorityImprovements.slice(0, 3) : ['Review system design fundamentals', 'Practice concise STAR stories', 'Highlight key resume metrics'],
      recommendedNextSession: parsed.finalSummary?.recommendedNextSession || 'Deep Dive Technical Mock Interview',
    },
    // Backwards compatibility aliases
    communicationScore: commScore,
    technicalScore: techScore,
    behavioralScore: behavScore,
    detailedFeedback: parsed.summary || 'Comprehensive evaluation recorded.',
  };

  return result;
}
