import { NextRequest, NextResponse } from "next/server";
import { checkAdminSecret, listAccessKeys, revokeAccessKey } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!checkAdminSecret(adminSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const keys = await listAccessKeys();
  return NextResponse.json({ keys });
}

export async function DELETE(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!checkAdminSecret(adminSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await req.json();
  const ok = await revokeAccessKey(key);
  return NextResponse.json({ revoked: ok });
}
