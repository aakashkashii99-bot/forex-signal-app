import { NextRequest, NextResponse } from "next/server";
import { isValidAccessKey } from "@/lib/auth";
import { redis, KEYS } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-access-key");
  const valid = await isValidAccessKey(key || "");
  if (!valid) {
    return NextResponse.json({ error: "Invalid or missing access key" }, { status: 401 });
  }

  const signals = (await redis.get(KEYS.signalsCache)) || [];
  const lastScanAt = await redis.get(KEYS.lastScanAt);

  return NextResponse.json({ signals, lastScanAt });
}
