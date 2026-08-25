"use client";

import { useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [label, setLabel] = useState("");
  const [keys, setKeys] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState("");

  async function login() {
    setError("");
    const res = await fetch("/api/admin/list-keys", {
      headers: { "x-admin-secret": secret }
    });
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys || []);
      setLoggedIn(true);
      if (typeof window !== "undefined") localStorage.setItem("admin_secret", secret);
    } else {
      setError("Wrong admin secret.");
    }
  }

  async function generate() {
    const res = await fetch("/api/admin/generate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ label })
    });
    const data = await res.json();
    if (data.record) {
      setNewKey(data.record.key);
      setKeys((prev) => [data.record, ...prev]);
      setLabel("");
    }
  }

  async function revoke(key: string) {
    await fetch("/api/admin/list-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ key })
    });
    setKeys((prev) => prev.map((k) => (k.key === key ? { ...k, active: false } : k)));
  }

  if (!loggedIn) {
    return (
      <div className="container">
        <div className="header"><span>ADMIN</span></div>
        <div className="card">
          <p style={{ marginTop: 0 }}>Enter admin secret (set as ADMIN_SECRET env var).</p>
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <div style={{ marginTop: 12 }}>
            <button onClick={login}>Log in</button>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header"><span>ADMIN — ACCESS KEYS</span></div>

      <div className="card">
        <input
          placeholder="Label (optional, e.g. 'John')"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <div style={{ marginTop: 12 }}>
          <button onClick={generate}>Generate new key</button>
        </div>
        {newKey && (
          <div className="narration">
            New key: <strong style={{ color: "var(--teal)" }}>{newKey}</strong> — copy and send this to the user now.
          </div>
        )}
      </div>

      <div className="card">
        {keys.length === 0 && <div className="narration">No keys yet.</div>}
        {keys.map((k) => (
          <div className="keyRow" key={k.key}>
            <span>{k.key} {k.label && `(${k.label})`}</span>
            <span>
              {k.active ? (
                <button onClick={() => revoke(k.key)} style={{ background: "var(--red)" }}>
                  Revoke
                </button>
              ) : (
                <span className="tag">revoked</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
      }
