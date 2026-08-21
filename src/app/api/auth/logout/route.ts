import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try { await clearSession(); return NextResponse.json({ ok: true }); }
  catch (error) { console.error("logout failed", error); return NextResponse.json({ error: "Unable to end session." }, { status: 500 }); }
}
