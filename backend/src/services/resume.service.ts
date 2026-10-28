import { AIServiceError, generateCompletion, AIProvider } from './ai.service';

const ANALYSIS_SYSTEM_PROMPT = `You are an expert resume analyst, ATS specialist, and senior career coach with 15+ years of experience. Analyze resumes thoroughly and provide detailed, actionable, specific feedback tailored to the candidate's target role. Always return valid JSON only.`;

const IMPROVEMENT_SYSTEM_PROMPT = `You are an expert resume writer and career strategist. Provide highly specific, impactful improvements tailored to the candidate's target role. Each suggestion should be immediately actionable. Always return a valid JSON object with an "improvements" array.`;

interface ResumeSectionAnalysis {
  score: number;
  feedback: string[];
}

interface ResumeAnalysis {
  overallScore: number;
  sections: Record<
    'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'formatting',
    ResumeSectionAnalysis
  >;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  atsCompatibility: number;
}

export async function analyzeResume(
  resumeText: string,
  targetRole: string,
  provider: AIProvider = 'gemini'
): Promise<ResumeAnalysis> {
  const roleContext = targetRole
    ? `The candidate is targeting the role of: **${targetRole}**.
Evaluate this resume specifically for that role:
- How well does their experience align with ${targetRole} requirements?
- What key skills for ${targetRole} are missing or underdeveloped?
- Are there ${targetRole}-specific keywords that should be added for ATS?
- What sections need the most work to be competitive for ${targetRole} positions?
`
    : '';

  const prompt = `${roleContext}
Analyze the following resume comprehensively and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <integer 0-100>,
  "sections": {
    "contact": { "score": <0-100>, "feedback": ["<specific actionable feedback>", "<feedback 2>"] },
    "summary": { "score": <0-100>, "feedback": ["<feedback>"] },
    "experience": { "score": <0-100>, "feedback": ["<feedback>"] },
    "education": { "score": <0-100>, "feedback": ["<feedback>"] },
    "skills": { "score": <0-100>, "feedback": ["<feedback>"] },
    "formatting": { "score": <0-100>, "feedback": ["<feedback>"] }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<critical improvement 1>", "<critical improvement 2>", "<critical improvement 3>"],
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "atsCompatibility": <integer 0-100>
}

RESUME:
${resumeText.substring(0, 6000)}`;

  const response = await generateCompletion(prompt, ANALYSIS_SYSTEM_PROMPT, provider);
  return parseResumeAnalysis(response);
}

export async function generateImprovements(
  resumeText: string,
  targetRole: string,
  provider: AIProvider = 'gemini'
): Promise<ResumeImprovementSuggestion[]> {
  const roleContext = targetRole
    ? `Target role: **${targetRole}**. Every improvement suggestion must be focused on making this resume more competitive for a ${targetRole} position — add missing ${targetRole} keywords, highlight relevant experience, fix skill gaps.\n`
    : '';

  const prompt = `${roleContext}Based on this resume, provide 6 highly specific improvement suggestions. Return a JSON object with an "improvements" array using this structure (no markdown):
{
  "improvements": [
    {
      "section": "<section name e.g. Experience, Skills, Summary>",
      "original": "<exact text or description of current content>",
      "suggested": "<significantly improved version with concrete changes>",
      "reason": "<clear explanation of why this improvement matters for hiring managers/ATS${targetRole ? ` hiring for ${targetRole}` : ''}>"
    }
  ]
}

RESUME:
${resumeText.substring(0, 6000)}`;

  const response = await generateCompletion(prompt, IMPROVEMENT_SYSTEM_PROMPT, provider);
  return parseImprovements(response);
}

export interface ResumeImprovementSuggestion {
  section: string;
  original: string;
  suggested: string;
  reason: string;
}

export function parseImprovements(response: string): ResumeImprovementSuggestion[] {
  const parsed = parseJSON(response, 'resume improvements');
  const entries = findImprovementEntries(parsed);
  if (!entries || entries.length === 0) {
    throw new AIServiceError(
      'AI returned valid JSON but no resume improvement suggestions.',
      502
    );
  }

  const improvements = entries.map(normalizeImprovement);
  if (improvements.some((improvement) => improvement === undefined)) {
    throw new AIServiceError(
      'AI returned incomplete resume suggestions. Each suggestion must include section, original, and suggested text.',
      502
    );
  }

  return improvements as ResumeImprovementSuggestion[];
}

function findImprovementEntries(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') return undefined;

  const record = value as Record<string, unknown>;
  const preferredKeys = ['improvements', 'suggestions', 'recommendations', 'resumeImprovements'];
  for (const key of preferredKeys) {
    if (key in record) {
      const nested = findImprovementEntries(record[key]);
      if (nested) return nested;
    }
  }

  if (normalizeImprovement(record)) return [record];

  for (const nestedValue of Object.values(record)) {
    const nested = findImprovementEntries(nestedValue);
    if (nested) return nested;
  }

  return undefined;
}

function normalizeImprovement(value: unknown): {
  section: string;
  original: string;
  suggested: string;
  reason: string;
} | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  const record = value as Record<string, unknown>;
  const readNonEmptyString = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      if (typeof record[key] === 'string' && record[key].trim()) {
        return (record[key] as string).trim();
      }
    }
    return undefined;
  };

  const section = readNonEmptyString('section', 'category');
  const original = readNonEmptyString('original', 'before', 'current');
  const suggested = readNonEmptyString('suggested', 'after', 'improved', 'rewrite');
  if (!section || !original || !suggested) return undefined;

  return {
    section,
    original,
    suggested,
    reason: readNonEmptyString('reason', 'rationale', 'why') || '',
  };
}

function parseJSON(response: string, label: string): unknown {
  const fencedBlocks = [...response.matchAll(/```(?:json)?[ \t]*\r?\n?([\s\S]*?)```/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const candidates = [...fencedBlocks, response.trim()];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      const extracted = extractJSONValue(candidate);
      if (!extracted) continue;
      try {
        return JSON.parse(extracted);
      } catch {
        continue;
      }
    }
  }

  throw new AIServiceError(
    `AI returned an empty or invalid JSON response for ${label}. Please retry the request.`,
    502
  );
}

function parseResumeAnalysis(response: string): ResumeAnalysis {
  const parsed = parseJSON(response, 'resume analysis');
  if (!isResumeAnalysis(parsed)) {
    throw new AIServiceError(
      'AI returned incomplete resume analysis data. Please retry the request.',
      502
    );
  }
  return parsed;
}

function isResumeAnalysis(value: unknown): value is ResumeAnalysis {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const sections = record.sections;
  const sectionNames = ['contact', 'summary', 'experience', 'education', 'skills', 'formatting'] as const;
  const validScore = (score: unknown): score is number =>
    typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
  const validStringArray = (items: unknown): items is string[] =>
    Array.isArray(items) && items.every((item) => typeof item === 'string');

  const validSections = sections !== null && typeof sections === 'object' &&
    !Array.isArray(sections) &&
    sectionNames.every((name) => {
      const section = (sections as Record<string, unknown>)[name];
      if (!section || typeof section !== 'object' || Array.isArray(section)) return false;
      const sectionRecord = section as Record<string, unknown>;
      return validScore(sectionRecord.score) && validStringArray(sectionRecord.feedback);
    });

  if (
    !validScore(record.overallScore) ||
    !validScore(record.atsCompatibility) ||
    !validSections ||
    !validStringArray(record.strengths) ||
    !validStringArray(record.improvements) ||
    !validStringArray(record.keywords)
  ) {
    return false;
  }

  return true;
}

function extractJSONValue(value: string): string | undefined {
  let start = -1;
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{' || character === '[') {
      if (stack.length === 0) start = index;
      stack.push(character);
      continue;
    }

    if (character === '}' || character === ']') {
      const opening = stack.pop();
      if ((character === '}' && opening !== '{') || (character === ']' && opening !== '[')) {
        return undefined;
      }
      if (stack.length === 0 && start !== -1) return value.slice(start, index + 1);
    }
  }

  return undefined;
}
