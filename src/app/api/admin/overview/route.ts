import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    const [users, complaints, signatures, recent] = await Promise.all([
      query<{ totalUsers: string; citizens: string; admins: string; officers: string }>(`SELECT count(*)::int AS "totalUsers", count(*) FILTER (WHERE role = 'USER')::int AS citizens, count(*) FILTER (WHERE role IN ('ADMIN','SUPER_ADMIN'))::int AS admins, count(*) FILTER (WHERE role IN ('WARD_COUNSELLOR','DEPARTMENT_OFFICER'))::int AS officers FROM users WHERE is_active = true`),
      query<{ totalComplaints: string; activeComplaints: string; resolvedComplaints: string; highAttention: string }>(`SELECT count(*)::int AS "totalComplaints", count(*) FILTER (WHERE status NOT IN ('RESOLVED','REJECTED'))::int AS "activeComplaints", count(*) FILTER (WHERE status = 'RESOLVED')::int AS "resolvedComplaints", count(*) FILTER (WHERE status IN ('SUBMITTED','IN REVIEW'))::int AS "highAttention" FROM complaints`),
      query<{ totalSignatures: string }>(`SELECT count(*)::int AS "totalSignatures" FROM complaint_signatures`),
      query<{ reference: string; title: string; status: string; updatedAt: string }>(`SELECT reference, title, status, updated_at AS "updatedAt" FROM complaints ORDER BY updated_at DESC LIMIT 8`),
    ]);
    return NextResponse.json({ generatedAt: new Date().toISOString(), users: users.rows[0], complaints: complaints.rows[0], signatures: signatures.rows[0], recent: recent.rows });
  } catch (error) {
    console.error("admin overview failed", error);
    return NextResponse.json({ error: "Unable to load live platform data." }, { status: 503 });
  }
}