import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.ADMIN_SECRET || "";
  return NextResponse.json({
    hasSecret: !!process.env.ADMIN_SECRET,
    secretLength: secret.length
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const typed = (body.value || "") as string;
  const real = process.env.ADMIN_SECRET || "";
  return NextResponse.json({
    typedLength: typed.length,
    realLength: real.length,
    typedValue: typed,
    matches: typed === real,
    matchesTrimmed: typed.trim() === real.trim()
  });
}
