const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
});

async function testResumeAnalysis() {
  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  console.log('Testing with model:', model);

  const ANALYSIS_SYSTEM_PROMPT = `You are an expert resume analyst, ATS specialist, and senior career coach with 15+ years of experience. Analyze resumes thoroughly and provide detailed, actionable, specific feedback tailored to the candidate's target role. Always return valid JSON only.`;

  const resumeText = `John Doe
Frontend Developer
john.doe@example.com | (555) 123-4567 | github.com/johndoe
Summary: Experienced Frontend Developer with 4 years of experience building modern web applications using React, TypeScript, Next.js, and Tailwind CSS.
Experience:
Senior Frontend Engineer at TechCorp (2022 - Present)
- Built scalable web apps using Next.js, React, and TypeScript.
- Improved Core Web Vitals by 35% across key user flows.
- Mentored 4 junior developers and led code reviews.
Frontend Developer at StartupInc (2020 - 2022)
- Developed responsive web interfaces using React and Redux.
- Collaborated with UX designers to implement Figma designs.
Education:
B.S. in Computer Science, University of Technology (2016 - 2020)
Skills: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Git, Jest, REST APIs.`;

  const prompt = `The candidate is targeting the role of: **Frontend Developer**.
Evaluate this resume specifically for that role:
- How well does their experience align with Frontend Developer requirements?
- What key skills for Frontend Developer are missing or underdeveloped?
- Are there Frontend Developer-specific keywords that should be added for ATS?
- What sections need the most work to be competitive for Frontend Developer positions?

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
${resumeText}`;

  console.log('Sending request to OpenRouter with reasoning: { max_tokens: 0 }...');
  const startTime = Date.now();
  try {
    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      reasoning: { max_tokens: 0 },
    });
    console.log(`Request completed in ${Date.now() - startTime}ms`);
    console.log('Content preview:', res.choices[0].message.content?.slice(0, 300));
    console.log('Reasoning exists:', !!res.choices[0].message.reasoning);
  } catch (err) {
    console.error(`Request failed in ${Date.now() - startTime}ms`);
    console.error('Error:', err.message);
  }
}

testResumeAnalysis();
