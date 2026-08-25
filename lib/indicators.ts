import { Candle } from "./twelvedata";

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  values.forEach((v, i) => {
    if (i === 0) {
      out.push(v);
    } else {
      out.push(v * k + out[i - 1] * (1 - k));
    }
  });
  return out;
}

export function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50; // neutral if not enough data
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Simple higher-timeframe trend bias from EMA20 vs EMA50 slope.
 * Returns "bullish" | "bearish" | "flat".
 */
export function trendBias(candles: Candle[]): "bullish" | "bearish" | "flat" {
  const closes = candles.map((c) => c.close);
  if (closes.length < 55) return "flat";
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const last20 = ema20[ema20.length - 1];
  const last50 = ema50[ema50.length - 1];
  const spread = (last20 - last50) / last50;
  if (spread > 0.0007) return "bullish";
  if (spread < -0.0007) return "bearish";
  return "flat";
}
