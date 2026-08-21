import { NextResponse } from "next/server";
import { createSession, normalizeEmail, normalizeMobile, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { identifier?: string; password?: string };
    const identifier = body.identifier?.trim() ?? ""; const password = body.password ?? "";
    const email = normalizeEmail(identifier); const mobile = normalizeMobile(identifier);
    const result = await query<{ id: string; role: "USER" | "WARD_COUNSELLOR" | "DEPARTMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN"; password_hash: string; full_name: string }>("SELECT id, role, password_hash, full_name FROM users WHERE (email = $1 OR mobile = $2) AND is_active = true AND (locked_until IS NULL OR locked_until < now()) LIMIT 1", [email, mobile]);
    const user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    await query("UPDATE users SET failed_login_count = 0, locked_until = NULL, updated_at = now() WHERE id = $1", [user.id]);
    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role, name: user.full_name });
  } catch (error) { console.error("login failed", error); return NextResponse.json({ error: "Authentication service is unavailable. Check PostgreSQL configuration." }, { status: 503 }); }
}
