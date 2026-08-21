import { NextResponse } from "next/server";
import { hashPassword, normalizeEmail, normalizeMobile, createSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { locationService } from "@/services/locationService";

function validPassword(password: string) { return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password); }

export async function POST(request: Request) {
  try {
    const body = await request.json() as { fullName?: string; email?: string; mobile?: string; password?: string; stateId?: string; districtId?: string; cityId?: string; wardId?: string; address?: string };
    const fullName = body.fullName?.trim(); const email = normalizeEmail(body.email); const mobile = normalizeMobile(body.mobile); const password = body.password ?? "";
    if (!fullName || fullName.length < 2 || (!email && !mobile) || !validPassword(password)) return NextResponse.json({ error: "Provide a name, email or mobile, and a password with 8+ characters, uppercase, lowercase, number, and special character." }, { status: 400 });
    const passwordHash = await hashPassword(password);
    if (!body.stateId || !body.districtId || !body.cityId || !body.wardId || !body.address?.trim()) return NextResponse.json({ error: "State, district, town/city, ward, and address are required." }, { status: 400 });
    if (!locationService.isValidSelection(body.stateId, body.districtId, body.cityId, body.wardId)) return NextResponse.json({ error: "Choose a valid district, town/city, and ward for the selected state." }, { status: 400 });
    const result = await query<{ id: string }>("INSERT INTO users (full_name, email, mobile, password_hash, state_id, district_id, city_id, ward_id, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id", [fullName, email, mobile, passwordHash, body.stateId, body.districtId, body.cityId, body.wardId, body.address.trim()]);
    await createSession(result.rows[0].id);
    return NextResponse.json({ ok: true, role: "USER", message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") return NextResponse.json({ error: "An account with that email or mobile already exists." }, { status: 409 });
    console.error("signup failed", error); return NextResponse.json({ error: "Authentication service is unavailable. Check DATABASE_URL and run db/schema.sql." }, { status: 503 });
  }
}
