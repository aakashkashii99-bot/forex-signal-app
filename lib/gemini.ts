const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Gemini is used ONLY to turn already-computed numbers into a short,
 * readable explanation — it is explicitly told not to change or
 * invent the score. This keeps the probability figure reproducible
 * and avoids treating an LLM's guess at price action as ground truth.
 */
export async function explainSignal(input: {
  symbol: string;
  direction: "bullish" | "bearish";
  score: number;
  mmrEntry: number;
  currentPrice: number;
  higherTfBias: string;
  rsiValue: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Gemini API key not configured — narration unavailable.";

  const prompt = `You are annotating a pre-computed forex/gold trade setup for a dashboard.
Do NOT change, question, or restate a different probability than the one given — only explain it.
Write 2-3 short sentences, plain language, no financial advice disclaimers (those are shown separately in the UI).

Symbol: ${input.symbol}
Direction: ${input.direction}
Computed score (0-100, already final): ${input.score}
MMR entry level: ${input.mmrEntry}
Current price: ${input.currentPrice}
Higher-timeframe bias: ${input.higherTfBias}
RSI: ${input.rsiValue}

Explain briefly why this score makes sense given these numbers.`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    if (!res.ok) {
      return `Narration unavailable (Gemini HTTP ${res.status}).`;
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Narration unavailable.";
    return text.trim();
  } catch (err) {
    return "Narration unavailable (request failed).";
  }
      }
