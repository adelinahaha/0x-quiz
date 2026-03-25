export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, score, total, company, useCase } = req.body;

  const prompt = `Generate a personalized 0x Trader Card for a booth visitor at Solana Accelerate 2026 Miami.
Name: ${firstName || 'Visitor'}, Score: ${score}/${total}, Company: ${company || 'unknown'}, Use case: ${useCase || 'exploring'}
Output ONLY valid JSON, no markdown:
{"archetype":"2-4 word punchy DeFi archetype e.g. The Routing Oracle","description":"1-2 sharp fun sentences referencing score. Max 30 words.","rank":"1-3 word rank matching score ${score}/${total}","trait":"1-3 word superpower"}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 250,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content.find(b => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const card = JSON.parse(clean);

    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ error: 'Card generation failed', detail: err.message });
  }
}
