const OpenAI = require('openai');
require('dotenv').config();
const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: process.env.OPENROUTER_BASE_URL });

async function testReasoningControls() {
  const attempts = [
    { name: 'no extra params', extra: {} },
    { name: 'reasoning: { max_tokens: 0 }', extra: { reasoning: { max_tokens: 0 } } },
    { name: 'include_reasoning: false', extra: { include_reasoning: false } },
    { name: 'response_format: { type: "json_object" }', extra: { response_format: { type: 'json_object' } } },
  ];

  for (const a of attempts) {
    try {
      console.log(`--- Testing ${a.name} ---`);
      const res = await client.chat.completions.create({
        model: 'nvidia/nemotron-3.5-lightning:free',
        messages: [{ role: 'user', content: 'Say hello in valid JSON: {"hello": "world"}' }],
        max_tokens: 300,
        ...a.extra,
      });
      console.log('content:', res.choices[0].message.content);
      console.log('reasoning exists:', !!res.choices[0].message.reasoning);
    } catch (err) {
      console.log('Error:', err.message);
    }
  }
}

testReasoningControls();
