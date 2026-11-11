const OpenAI = require('openai');
require('dotenv').config();
const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: process.env.OPENROUTER_BASE_URL });
async function run() {
  const models = ['nvidia/nemotron-3.5-lightning:free', 'poolside/laguna-s-2.1:free', 'dots-studio/dots-3-note-preview:free', 'openrouter/free'];
  for (const m of models) {
    const t0 = Date.now();
    try {
      const res = await client.chat.completions.create({
        model: m,
        messages: [{ role: 'user', content: 'Return valid JSON only: {"status": "ok"}' }],
        max_tokens: 150,
      });
      const c = res.choices[0].message.content;
      const r = res.choices[0].message.reasoning;
      console.log(m, 'SUCCESS in', Date.now()-t0, 'ms | content len:', c ? c.length : 'NULL', '| reasoning len:', r ? r.length : 'NULL');
    } catch (e) {
      console.log(m, 'FAILED in', Date.now()-t0, 'ms |', e.message);
    }
  }
}
run();
