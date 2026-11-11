const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
});

async function main() {
  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  console.log('Testing OpenRouter model:', model);
  console.log('Base URL:', process.env.OPENROUTER_BASE_URL);
  console.log('API Key present:', !!process.env.OPENROUTER_API_KEY, 'starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10));

  try {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Return ONLY JSON: {"test": true}' }],
    });
    console.log('Success! Result:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Failed to create completion:');
    console.error('Message:', err.message);
    console.error('Status:', err.status);
    console.error('Error body:', err.error || err);
  }
}

main();
