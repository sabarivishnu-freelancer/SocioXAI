import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await context.params;
    const complaint = await query<{ id: string; wardId: string | null }>(`SELECT id, ward_id AS "wardId" FROM complaints WHERE id = $1`, [id]);
    if (!complaint.rows[0]) return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    if (complaint.rows[0].wardId && complaint.rows[0].wardId !== user.wardId) return NextResponse.json({ error: "You can only sign petitions in your ward." }, { status: 403 });
    const result = await query<{ signedAt: string }>(`INSERT INTO complaint_signatures (complaint_id, citizen_id) VALUES ($1, $2) ON CONFLICT (complaint_id, citizen_id) DO NOTHING RETURNING signed_at AS "signedAt"`, [id, user.id]);
    const count = await query<{ signatureCount: string }>(`SELECT count(*)::int AS "signatureCount" FROM complaint_signatures WHERE complaint_id = $1`, [id]);
    return NextResponse.json({ signed: result.rowCount === 1, signatureCount: Number(count.rows[0]?.signatureCount ?? 0), signedAt: result.rows[0]?.signedAt ?? null });
  } catch (error) {
    console.error("petition signature failed", error);
    return NextResponse.json({ error: "Unable to sign petition." }, { status: 503 });
  }
}