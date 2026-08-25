import { NextRequest, NextResponse } from "next/server";
import { isValidAccessKey } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { key } = await req.json();
  const valid = await isValidAccessKey(key);
  return NextResponse.json({ valid });
}
