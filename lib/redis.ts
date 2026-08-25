import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from env.
// These are set automatically if you add Upstash via the Vercel
// integrations marketplace, or manually if you sign up at upstash.com.
export const redis = Redis.fromEnv();

export const KEYS = {
  accessKey: (key: string) => `access_key:${key}`,
  allAccessKeys: "access_keys:all",
  signalsCache: "signals:latest",
  lastScanAt: "signals:last_scan_at"
};
