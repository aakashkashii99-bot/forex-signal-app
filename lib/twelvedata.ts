export type Candle = {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

const BASE_URL = "https://api.twelvedata.com/time_series";

/**
 * Fetches recent candles for a symbol/interval from Twelve Data.
 * Free tier: 800 requests/day, 8 requests/minute — the cron scanner
 * paces requests to stay under this (see api/cron/scan/route.ts).
 */
export async function getCandles(
  symbol: string,
  interval: string,
  outputsize = 60
): Promise<Candle[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error("TWELVE_DATA_API_KEY is not set");

  const url = new URL(BASE_URL);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", interval);
  url.searchParams.set("outputsize", String(outputsize));
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Twelve Data HTTP ${res.status} for ${symbol} ${interval}`);
  }
  const data = await res.json();

  if (data.status === "error") {
    throw new Error(`Twelve Data error for ${symbol} ${interval}: ${data.message}`);
  }
  if (!Array.isArray(data.values)) {
    throw new Error(`Twelve Data returned no values for ${symbol} ${interval}`);
  }

  // Twelve Data returns newest-first; flip to oldest-first for analysis.
  const candles: Candle[] = data.values
    .map((v: any) => ({
      datetime: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close)
    }))
    .reverse();

  return candles;
}
