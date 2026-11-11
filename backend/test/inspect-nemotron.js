const OpenAI = require('openai');
require('dotenv').config();
const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: process.env.OPENROUTER_BASE_URL });
async function run() {
  const res = await client.chat.completions.create({
    model: 'nvidia/nemotron-3.5-lightning:free',
    messages: [{ role: 'user', content: 'Say hello in valid JSON: {"hello": "world"}' }],
    max_tokens: 300,
  });
  console.log('Choices message:', JSON.stringify(res.choices[0].message, null, 2));
}
run();
