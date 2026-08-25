import { NextRequest, NextResponse } from "next/server";
import { checkAdminSecret, createAccessKey } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!checkAdminSecret(adminSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const record = await createAccessKey(body?.label);
  return NextResponse.json({ record });
}
