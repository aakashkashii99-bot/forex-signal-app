"use client";

import { useEffect, useState } from "react";

type Signal = {
  symbol: string;
  direction?: "bullish" | "bearish";
  score?: number;
  mmrEntry?: number;
  currentPrice?: number;
  higherTfBias?: string;
  rsiValue?: number;
  narration?: string;
  error?: string;
  updatedAt: string;
};

function scoreClass(score: number) {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

export default function HomePage() {
  const [accessKey, setAccessKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("access_key") : null;
    if (saved) {
      setAccessKey(saved);
      verifyKey(saved);
    }
  }, []);

  async function verifyKey(key: string) {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      const data = await res.json();
      if (data.valid) {
        setUnlocked(true);
        localStorage.setItem("access_key", key);
        loadSignals(key);
      } else {
        setError("Invalid or inactive access key. Ask your admin for one.");
      }
    } catch {
      setError("Could not verify key — try again.");
    } finally {
      setChecking(false);
    }
  }

  async function loadSignals(key: string) {
    const res = await fetch("/api/signals", {
      headers: { "x-access-key": key }
    });
    if (res.ok) {
      const data = await res.json();
      setSignals(data.signals || []);
      setLastScanAt(data.lastScanAt);
    }
  }

  useEffect(() => {
    if (!unlocked) return;
    const interval = setInterval(() => loadSignals(accessKey), 60_000);
    return () => clearInterval(interval);
  }, [unlocked, accessKey]);

  if (!unlocked) {
    return (
      <div className="container">
        <div className="header">
          <span>CONFLUENCE SIGNALS</span>
        </div>
        <div className="card">
          <p style={{ marginTop: 0 }}>Enter your access key to view live setups.</p>
          <input
            placeholder="Access key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verifyKey(accessKey)}
          />
          <div style={{ marginTop: 12 }}>
            <button disabled={checking || !accessKey} onClick={() => verifyKey(accessKey)}>
              {checking ? "Checking..." : "Unlock"}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
        <div className="disclaimer">
          Educational tool only — not financial advice. No entry is certain.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <span>CONFLUENCE SIGNALS</span>
        <span>{lastScanAt ? `updated ${new Date(lastScanAt).toLocaleTimeString()}` : "awaiting first scan"}</span>
      </div>

      {signals.length === 0 && (
        <div className="card">No signals yet — the first automated scan runs shortly after deploy.</div>
      )}

      {signals.map((s) => {
        if (s.error) {
          return (
            <div className="card" key={s.symbol}>
              <div className="row">
                <span className="symbol">{s.symbol}</span>
                <span className="tag">error</span>
              </div>
              <div className="narration">{s.error}</div>
            </div>
          );
        }
        return (
          <div className="card" key={s.symbol}>
            <div className="row">
              <span className="symbol">{s.symbol}</span>
              <span className={`score ${scoreClass(s.score || 0)}`}>{s.score}%</span>
            </div>
            <div className="row">
              <span className={`tag ${s.direction}`}>{s.direction}</span>
              <span className="tag">HTF: {s.higherTfBias}</span>
              <span className="tag">RSI {s.rsiValue}</span>
            </div>
            <div className="row">
              <span className="tag">MMR entry: {s.mmrEntry}</span>
              <span className="tag">price: {s.currentPrice}</span>
            </div>
            {s.narration && <div className="narration">{s.narration}</div>}
          </div>
        );
      })}

      <div className="disclaimer">
        Educational tool only — not financial advice. Scores are a rule-based
        estimate from the Measured Move Ratio (range ÷ 2.6) plus trend/RSI
        confirmation. Weak moves can pull back deeper than expected — no
        entry is certain. Trade at your own risk.
      </div>
    </div>
  );
    }
