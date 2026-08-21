import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { query } from "./db";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "sociox_session";
const SESSION_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 7);

export type AuthUser = { id: string; fullName: string; email: string | null; mobile: string | null; role: "USER" | "WARD_COUNSELLOR" | "DEPARTMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN"; ward: string | null; stateId: string | null; districtId: string | null; cityId: string | null; wardId: string | null; address: string | null };

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [, salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function normalizeEmail(value: string | undefined) { return value?.trim().toLowerCase() || null; }
export function normalizeMobile(value: string | undefined) { return value?.replace(/[^\d+]/g, "") || null; }
function tokenHash(token: string) { return createHmac("sha256", process.env.AUTH_SECRET ?? "development-only-change-me").update(token).digest("hex"); }

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await query("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)", [userId, tokenHash(token), expires]);
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await query<AuthUser>("SELECT u.id, u.full_name AS \"fullName\", u.email, u.mobile, u.role, u.ward, u.state_id AS \"stateId\", u.district_id AS \"districtId\", u.city_id AS \"cityId\", u.ward_id AS \"wardId\", u.address FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now() AND u.is_active = true", [tokenHash(token)]);
  return result.rows[0] ?? null;
}

export async function clearSession() {
  const cookieStore = await cookies(); const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
  cookieStore.delete(COOKIE_NAME);
}