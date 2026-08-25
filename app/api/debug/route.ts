import { NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.ADMIN_SECRET || "";
  return NextResponse.json({
    hasSecret: !!process.env.ADMIN_SECRET,
    secretLength: secret.length,
    firstChar: secret.charAt(0),
    lastChar: secret.charAt(secret.length - 1)
  });
}
