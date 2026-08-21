import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try { const user = await getSessionUser(); return user ? NextResponse.json({ authenticated: true, user }) : NextResponse.json({ authenticated: false }, { status: 401 }); }
  catch (error) { console.error("session lookup failed", error); return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 }); }
}
