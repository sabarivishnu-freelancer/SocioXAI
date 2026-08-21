import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

type ComplaintRow = { id: string; citizenId: string; reference: string; title: string; description: string; category: string; status: string; address: string; latitude: number | null; longitude: number | null; photoName: string | null; stateId: string | null; districtId: string | null; cityId: string | null; wardId: string | null; signatureCount: number; signedByMe: boolean; createdAt: string; updatedAt: string };

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const result = await query<ComplaintRow>(`SELECT c.id, c.citizen_id AS "citizenId", c.reference, c.title, c.description, c.category, c.status, c.address, c.latitude, c.longitude, c.photo_name AS "photoName", c.state_id AS "stateId", c.district_id AS "districtId", c.city_id AS "cityId", c.ward_id AS "wardId", count(cs.citizen_id)::int AS "signatureCount", bool_or(cs.citizen_id = $1) AS "signedByMe", c.created_at AS "createdAt", c.updated_at AS "updatedAt" FROM complaints c LEFT JOIN complaint_signatures cs ON cs.complaint_id = c.id WHERE c.citizen_id = $1 OR c.ward_id = $2 GROUP BY c.id ORDER BY c.updated_at DESC`, [user.id, user.wardId]);
    return NextResponse.json({ complaints: result.rows });
  } catch (error) {
    console.error("complaints lookup failed", error);
    return NextResponse.json({ error: "Unable to load complaints." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { title?: string; description?: string; category?: string; address?: string; latitude?: number; longitude?: number; photoName?: string };
    const title = body.title?.trim();
    const description = body.description?.trim();
    const category = body.category?.trim();
    const address = body.address?.trim();
    if (!title || !description || !category || !address) return NextResponse.json({ error: "Title, description, category, and address are required." }, { status: 400 });
    if (body.latitude !== undefined && (!Number.isFinite(body.latitude) || body.latitude < -90 || body.latitude > 90)) return NextResponse.json({ error: "Latitude is invalid." }, { status: 400 });
    if (body.longitude !== undefined && (!Number.isFinite(body.longitude) || body.longitude < -180 || body.longitude > 180)) return NextResponse.json({ error: "Longitude is invalid." }, { status: 400 });
    const duplicate = await query<ComplaintRow>(`SELECT c.id, c.citizen_id AS "citizenId", c.reference, c.title, c.description, c.category, c.status, c.address, c.latitude, c.longitude, c.photo_name AS "photoName", c.state_id AS "stateId", c.district_id AS "districtId", c.city_id AS "cityId", c.ward_id AS "wardId", count(cs.citizen_id)::int AS "signatureCount", bool_or(cs.citizen_id = $1) AS "signedByMe", c.created_at AS "createdAt", c.updated_at AS "updatedAt" FROM complaints c LEFT JOIN complaint_signatures cs ON cs.complaint_id = c.id WHERE c.ward_id = $2 AND c.category = $3 AND (lower(c.title) = lower($4) OR lower(c.address) = lower($5) OR (c.latitude IS NOT NULL AND c.longitude IS NOT NULL AND $6::double precision IS NOT NULL AND $7::double precision IS NOT NULL AND abs(c.latitude - $6) < 0.001 AND abs(c.longitude - $7) < 0.001)) GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 1`, [user.id, user.wardId, category, title, address, body.latitude ?? null, body.longitude ?? null]);
    if (duplicate.rows[0]) return NextResponse.json({ error: "A similar complaint already exists in your ward.", duplicate: duplicate.rows[0] }, { status: 409 });
    const reference = `SX-${Date.now().toString(36).toUpperCase()}`;
    const result = await query<ComplaintRow>(`INSERT INTO complaints (reference, citizen_id, title, description, category, address, latitude, longitude, photo_name, state_id, district_id, city_id, ward_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, citizen_id AS "citizenId", reference, title, description, category, status, address, latitude, longitude, photo_name AS "photoName", state_id AS "stateId", district_id AS "districtId", city_id AS "cityId", ward_id AS "wardId", 0 AS "signatureCount", false AS "signedByMe", created_at AS "createdAt", updated_at AS "updatedAt"`, [reference, user.id, title, description, category, address, body.latitude ?? null, body.longitude ?? null, body.photoName ?? null, user.stateId, user.districtId, user.cityId, user.wardId]);
    return NextResponse.json({ complaint: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("complaint creation failed", error);
    return NextResponse.json({ error: "Unable to create complaint." }, { status: 503 });
  }
}