const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
  timeout: 15000,
});

const models = [
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-chat:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free'
];

async function check() {
  for (const m of models) {
    process.stdout.write(`Testing ${m}... `);
    const start = Date.now();
    try {
      const res = await client.chat.completions.create({
        model: m,
        messages: [{ role: 'user', content: 'Respond with valid JSON: {"status": "ok"}' }],
        max_tokens: 100,
      });
      const content = res.choices?.[0]?.message?.content;
      const reasoning = res.choices?.[0]?.message?.reasoning;
      console.log(`OK (${Date.now() - start}ms) | content: "${content?.slice(0, 30)}" | reasoning: ${!!reasoning}`);
    } catch (e) {
      console.log(`FAILED (${Date.now() - start}ms): ${e.message} (status: ${e.status})`);
    }
  }
}

check();
