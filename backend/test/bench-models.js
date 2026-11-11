const OpenAI = require('openai');
require('dotenv').config({ path: 'd:/resume simulator/backend/.env' });

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
  timeout: 30000,
});

const candidates = [
  'nvidia/nemotron-3.5-lightning:free',
  'recursive/flint-v1.0:free',
  'dots-studio/dots-3-note-preview:free',
  'liquid/lfm-2.5-2.6b:free',
  'poolside/laguna-s-2.1:free',
  'thinkingmachines/inkling-small:free',
  'cohere/north-mini-code:free',
  'openrouter/free'
];

async function bench() {
  const prompt = 'Analyze this candidate: John Doe, React Developer with 3 years experience. Return ONLY a JSON object: {"overallScore": 80, "strengths": ["React"]}';

  for (const m of candidates) {
    process.stdout.write(`Benchmarking ${m}... `);
    const start = Date.now();
    try {
      const res = await client.chat.completions.create({
        model: m,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        reasoning: { max_tokens: 0 }
      });
      const content = res.choices?.[0]?.message?.content;
      const reasoning = res.choices?.[0]?.message?.reasoning;
      const duration = Date.now() - start;
      console.log(`SUCCESS in ${duration}ms | content: ${content ? 'YES (' + content.slice(0, 40).replace(/\n/g, ' ') + '...)' : 'NULL'} | reasoning: ${!!reasoning}`);
    } catch (err) {
      console.log(`FAILED in ${Date.now() - start}ms: ${err.message}`);
    }
  }
}

bench();
