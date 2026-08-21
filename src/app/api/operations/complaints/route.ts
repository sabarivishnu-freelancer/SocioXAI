import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !["DEPARTMENT_OFFICER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) return NextResponse.json({ error: "Government access required." }, { status: 403 });
    const result = await query(`SELECT c.id, c.citizen_id AS "citizenId", c.reference, c.title, c.description, c.category, c.status, c.address, c.latitude, c.longitude, c.photo_name AS "photoName", c.state_id AS "stateId", c.district_id AS "districtId", c.city_id AS "cityId", c.ward_id AS "wardId", count(cs.citizen_id)::int AS "signatureCount", bool_or(cs.citizen_id = $1) AS "signedByMe", c.created_at AS "createdAt", c.updated_at AS "updatedAt" FROM complaints c LEFT JOIN complaint_signatures cs ON cs.complaint_id = c.id WHERE $2 = 'SUPER_ADMIN' OR ($2 = 'ADMIN' AND c.district_id = $3) OR ($2 = 'DEPARTMENT_OFFICER' AND c.district_id = $3) GROUP BY c.id ORDER BY c.updated_at DESC`, [user.id, user.role, user.districtId]);
    return NextResponse.json({ complaints: result.rows });
  } catch (error) {
    console.error("operations complaints lookup failed", error);
    return NextResponse.json({ error: "Unable to load operations map data." }, { status: 503 });
  }
}
