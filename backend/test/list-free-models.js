const OpenAI = require('openai');
require('dotenv').config({ path: 'd:/resume simulator/backend/.env' });

async function listFastModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
  });
  const data = await res.json();
  const freeModels = data.data.filter(m => m.id.endsWith(':free'));
  console.log('Free models list:');
  for (const m of freeModels) {
    console.log(`- ${m.id} | name: ${m.name} | context: ${m.context_length}`);
  }
}

listFastModels();
