import { generateChatCompletion, AIProvider } from './ai.service';

const buildSystemPrompt = (resumeText: string, targetRole: string) => {
  const roleLine = targetRole
    ? `You are interviewing this candidate for a **${targetRole}** position.`
    : 'You are conducting a general job interview for this candidate.';

  const roleQuestionGuidance = targetRole
    ? `- Ask technical questions specific to ${targetRole} (tools, frameworks, methodologies used in that field)
- Ask about experience gaps between their resume and typical ${targetRole} requirements
- Probe their understanding of ${targetRole}-specific concepts
- Ask how their past work experience prepared them for a ${targetRole} role`
    : '';

  return `You are a senior HR interviewer and hiring manager. ${roleLine}

You have the candidate's resume in front of you:
---
${resumeText.substring(0, 5000)}
---

STRICT INTERVIEW RULES — follow at all times:
1. Ask ONE question at a time. Never ask two questions together.
2. Every question MUST be directly tied to either:
   a) Something specific in the resume (a company, role, project, skill, tool, date, or achievement they listed), OR
   b) A requirement or concept relevant to the ${targetRole || 'role'} they are applying for.
3. DO NOT ask generic questions like "tell me about yourself" or "where do you see yourself in 5 years" unless they are clearly connected to the resume or role.
4. Cover these areas using resume content and role requirements:
   - Dig into specific roles and responsibilities they listed (e.g. "At [Company from resume], you mentioned X — walk me through that.")
   - Ask about specific technologies/tools they listed (e.g. "You've listed React — describe a project where you solved a real challenge with it.")
   - Probe specific achievements (e.g. "You mentioned increasing performance by 40% — what was your exact approach?")
   - Ask role-specific technical questions
   ${roleQuestionGuidance}
5. After the candidate answers, briefly acknowledge it naturally in 1 sentence, then move to the next question.
6. Be professional, warm, and realistic — like a real senior interviewer would be.
7. Do NOT give scores or ratings during the interview.`;
};

const SCORING_PROMPT = `You are an expert interview coach and hiring manager. Analyze the mock interview conversation objectively and return ONLY a valid JSON object (no markdown, raw JSON):
{
  "overallScore": <integer 0-100>,
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "behavioralScore": <0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "detailedFeedback": "<3 paragraphs of detailed, specific, actionable feedback covering communication style, content quality, and career advice>"
}`;

export async function generateInterviewerResponse(
  messages: Array<{ role: string; content: string }>,
  resumeText: string,
  isStart: boolean,
  targetRole: string = '',
  provider: AIProvider = 'gemini'
): Promise<string> {
  const systemPrompt = buildSystemPrompt(resumeText, targetRole);

  const roleIntro = targetRole
    ? `for the ${targetRole} position`
    : 'today';

  if (isStart) {
    return generateChatCompletion(
      [{
        role: 'user',
        content: `Start the interview. Greet the candidate briefly with your name and a realistic company name relevant to ${targetRole || 'the role'}. Mention you are interviewing them ${roleIntro}. Then immediately ask your FIRST question — it must reference something SPECIFIC from their resume (a company, role, project, or skill they listed) or a core ${targetRole || 'role'}-specific skill. Do not ask generic questions.`,
      }],
      systemPrompt,
      provider
    );
  }

  return generateChatCompletion(messages, systemPrompt, provider);
}

export async function generateInterviewResults(
  messages: Array<{ role: string; content: string }>,
  provider: AIProvider = 'gemini'
): Promise<any> {
  const conversation = messages
    .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const response = await generateChatCompletion(
    [{ role: 'user', content: `Analyze this interview:\n\n${conversation}` }],
    SCORING_PROMPT,
    provider
  );

  const cleaned = response.replace(/\`\`\`json\n?|\`\`\`\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse interview results');
  return JSON.parse(match[0]);
}
