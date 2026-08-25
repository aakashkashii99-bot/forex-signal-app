// Symbols as Twelve Data expects them.
// XAU/USD = Gold vs US Dollar (spot gold).
export const TRACKED_SYMBOLS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "USD/CAD",
  "AUD/USD",
  "NZD/USD",
  "EUR/JPY",
  "GBP/JPY",
  "EUR/GBP",
  "XAU/USD"
];

// Timeframes scanned per symbol, highest to lowest.
// Higher TFs set directional bias, lower TFs refine the MMR entry.
export const TIMEFRAMES = ["4h", "1h", "15min", "5min", "1min"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
