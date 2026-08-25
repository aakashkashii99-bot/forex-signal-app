import { redis, KEYS } from "./redis";
import crypto from "crypto";

export function generateAccessKey(): string {
  return crypto.randomBytes(9).toString("base64url"); // short, URL-safe
}

export async function createAccessKey(label?: string) {
  const key = generateAccessKey();
  const record = {
    key,
    label: label || "",
    createdAt: new Date().toISOString(),
    active: true
  };
  await redis.set(KEYS.accessKey(key), record);
  await redis.sadd(KEYS.allAccessKeys, key);
  return record;
}

export async function isValidAccessKey(key: string): Promise<boolean> {
  if (!key) return false;
  const record = await redis.get<{ active: boolean }>(KEYS.accessKey(key));
  return !!record?.active;
}

export async function listAccessKeys() {
  const keys = await redis.smembers(KEYS.allAccessKeys);
  if (!keys.length) return [];
  const records = await Promise.all(
    keys.map((k) => redis.get(KEYS.accessKey(k)))
  );
  return records.filter(Boolean);
}

export async function revokeAccessKey(key: string) {
  const record = await redis.get<any>(KEYS.accessKey(key));
  if (!record) return false;
  record.active = false;
  await redis.set(KEYS.accessKey(key), record);
  return true;
}export function checkAdminSecret(providedSecret: string | null): boolean {
  const real = process.env.ADMIN_SECRET;
  if (!real || !providedSecret) return false;
  const a = providedSecret.trim();
  const b = real.trim();
  return (
    a.length === b.length &&
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}

