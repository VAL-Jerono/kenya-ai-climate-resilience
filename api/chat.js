

// /api/chat — RAG endpoint over the 47-county climate recommendation dataset.
// Uses Groq API with llama-3.3-70b-versatile (free tier available at groq.com)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question, data } = req.body || {};
  if (!question || !Array.isArray(data)) {
    res.status(400).json({ error: 'Missing question or data' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      answer:
        "The assistant isn't configured yet — add a GROQ_API_KEY in the Vercel project's Environment Variables (Settings → Environment Variables), then redeploy. Get a free key at groq.com.",
    });
    return;
  }

  try {
    const context = buildContext(question, data);
    const prompt = `You are a climate-adaptation decision-support assistant for Kenyan county governments, NDMA, and WASREB. You answer ONLY using the county data provided below, which comes from an AI model (HistGradientBoosting, ROC-AUC 0.881) and a DEA-BCC linear-programming efficiency analysis (CACI) run on the Kenya Housing Survey 2023/24 (21,347 households, 47 counties).

Rules:
- Be concise, concrete, and decision-oriented (this is for busy policymakers).
- Cite specific numbers from the data (urgency score, at-risk population, CACI, quadrant) when relevant.
- If asked to recommend funding priorities, prioritise by urgency tier and quadrant (Q1: CRITICAL first), and mention the recommended intervention field.
- If the question can't be answered from the data provided, say so plainly rather than guessing.
- Keep answers under ~180 words unless the user asks for a detailed breakdown.

COUNTY DATA (JSON, most relevant rows to this question):
${JSON.stringify(context)}

QUESTION: ${question}`;

    // Groq API endpoint
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const groqRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a climate adaptation decision-support assistant for Kenyan counties.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      res.status(200).json({ answer: `Groq API error (${groqRes.status}). ${errText.slice(0, 200)}` });
      return;
    }

    const json = await groqRes.json();
    const answer = json.choices?.[0]?.message?.content || 
      "I couldn't generate a response from the data. Try rephrasing your question.";

    res.status(200).json({ answer });
  } catch (err) {
    res.status(200).json({ answer: 'Server error while answering: ' + String(err.message || err) });
  }
}

// --- Deterministic retrieval over the 47-row dataset ---
function buildContext(question, data) {
  const q = question.toLowerCase();
  const named = data.filter((c) => q.includes(c.county.toLowerCase()));
  if (named.length > 0) {
    return { requestedCounties: named, nationalSummary: summarize(data) };
  }

  if (/critical|emergency|top|priority|worst|first|fund/.test(q)) {
    const top = [...data].sort((a, b) => b.urgency - a.urgency).slice(0, 10);
    return { topUrgencyCounties: top, nationalSummary: summarize(data) };
  }

  if (/capacity|caci|efficien|best practice|strong/.test(q)) {
    const top = [...data].sort((a, b) => b.caci - a.caci).slice(0, 10);
    const bottom = [...data].sort((a, b) => a.caci - b.caci).slice(0, 10);
    return { highestCapacity: top, lowestCapacity: bottom, nationalSummary: summarize(data) };
  }

  return { topUrgencyCounties: [...data].sort((a, b) => b.urgency - a.urgency).slice(0, 15), nationalSummary: summarize(data) };
}

function summarize(data) {
  const totalAtRisk = data.reduce((s, c) => s + c.atRisk2026, 0);
  const totalPop = data.reduce((s, c) => s + c.pop2026, 0);
  const byTier = {};
  for (const c of data) byTier[c.urgencyTier] = (byTier[c.urgencyTier] || 0) + 1;
  const byQuadrant = {};
  for (const c of data) byQuadrant[c.quadrant] = (byQuadrant[c.quadrant] || 0) + 1;
  return {
    totalCounties: data.length,
    totalPopulation2026: totalPop,
    totalCitizensAtRisk2026: totalAtRisk,
    countiesByUrgencyTier: byTier,
    countiesByQuadrant: byQuadrant,
    avgCACI: +(data.reduce((s, c) => s + c.caci, 0) / data.length).toFixed(3),
  };
}


