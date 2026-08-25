import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import { TRACKED_SYMBOLS } from "@/lib/pairs";
import { getCandles } from "@/lib/twelvedata";
import { findMmrSetup, scoreSetup } from "@/lib/mmr";
import { explainSignal } from "@/lib/gemini";

// Allow up to 5 min on plans that support it. On Vercel Hobby this is
// capped lower (~60s) — if you're on Hobby, trim TRACKED_SYMBOLS in
// lib/pairs.ts so a full pass finishes in time. See README.
export const maxDuration = 300;

// NOTE ON FREE-TIER LIMITS:
// Twelve Data's free plan allows 8 requests/minute and 800/day.
// To stay under that while covering both a higher timeframe (bias)
// and a lower timeframe (precise MMR entry), the automated scan uses
// TWO timeframes per symbol rather than all five from your reference
// material. Widen TIMEFRAME_PAIR or add more TFs once you're on a
// paid data plan — the code supports any interval Twelve Data does.
const TIMEFRAME_PAIR: { higher: string; lower: string } = {
  higher: "4h",
  lower: "15min"
};

const REQUEST_SPACING_MS = 7700; // ~7.8/min, just under the 8/min cap

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  // Vercel automatically sends this header on real cron invocations
  // when CRON_SECRET is set as an env var — see Vercel Cron docs.
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: any[] = [];

  for (const symbol of TRACKED_SYMBOLS) {
    try {
      const higherCandles = await getCandles(symbol, TIMEFRAME_PAIR.higher, 60);
      await sleep(REQUEST_SPACING_MS);
      const lowerCandles = await getCandles(symbol, TIMEFRAME_PAIR.lower, 60);
      await sleep(REQUEST_SPACING_MS);

      const setup = findMmrSetup(lowerCandles);
      if (!setup) continue;

      const { score, higherTfBias, rsiValue, alignedWithHigherTf } = scoreSetup({
        lowerTfSetup: setup,
        higherTfCandles: higherCandles,
        lowerTfCloses: lowerCandles.map((c) => c.close)
      });

      const narration = await explainSignal({
        symbol,
        direction: setup.direction,
        score,
        mmrEntry: setup.mmrEntry,
        currentPrice: setup.currentPrice,
        higherTfBias,
        rsiValue
      });

      results.push({
        symbol,
        direction: setup.direction,
        score,
        mmrEntry: Number(setup.mmrEntry.toFixed(5)),
        currentPrice: Number(setup.currentPrice.toFixed(5)),
        higherTfBias,
        rsiValue,
        alignedWithHigherTf,
        narration,
        timeframes: TIMEFRAME_PAIR,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      results.push({
        symbol,
        error: err?.message || "scan failed",
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Highest-probability setups first.
  results.sort((a, b) => (b.score || 0) - (a.score || 0));

  await redis.set(KEYS.signalsCache, results);
  await redis.set(KEYS.lastScanAt, new Date().toISOString());

  return NextResponse.json({ ok: true, count: results.length });
      }
