import { requireAdmin } from "@/lib/auth/admin";
import { NextResponse } from "next/server";

/** Sanity check: only allowlisted admins receive ok — used to verify server-side auth. */
export async function GET() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
