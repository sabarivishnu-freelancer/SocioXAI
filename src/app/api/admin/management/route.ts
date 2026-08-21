import { NextResponse } from "next/server";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

const departmentSeed = [
  ["Roads & Transportation", "Potholes, roads, signals, bridges, and footpaths", "Vision,Geo,Severity,Routing"], ["Water & Drainage", "Leakage, flooding, sewage, and drainage", "Vision,Geo,Prediction,Emergency"], ["Waste Management & Sanitation", "Dumping, bins, and collection", "Vision,Geo,Duplicate,Routing"], ["Electricity & Street Lighting", "Streetlights, wires, and hazards", "Vision,Safety,Severity,Emergency"], ["Environment & Public Spaces", "Pollution, trees, parks, and public spaces", "Vision,Environmental,Geo,Prediction"], ["Public Health & Safety", "Hazards and unsafe public conditions", "Risk,Vision,Geo,Emergency"], ["Traffic & Mobility", "Congestion, parking, signals, and mobility", "Geo,Vision,Traffic,Prediction"], ["Buildings & Urban Planning", "Construction, zoning, and encroachment", "Vision,GIS,Compliance"], ["Emergency & Disaster Management", "Floods, fires, and major hazards", "Emergency,Severity,Geo,Notification"], ["Civic Administration & Grievance", "General complaints and escalations", "Intake,Classification,Routing,Escalation"],
];

async function actor() { const user = await getSessionUser(); if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return null; return user; }

export async function GET() {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const districts = await query(`SELECT d.id, d.code, d.name, d.state_id AS "stateId", count(DISTINCT u.id)::int AS administrators FROM districts d LEFT JOIN users u ON u.district_id = d.id::text AND u.role = 'ADMIN' GROUP BY d.id ORDER BY d.name`);
  const departments = await query(`SELECT dp.id, dp.district_id AS "districtId", dp.name, dp.description, dp.agents, u.full_name AS "headName" FROM departments dp LEFT JOIN users u ON u.id = dp.head_id WHERE $1 = 'SUPER_ADMIN' OR dp.district_id::text = $2 ORDER BY dp.name`, [user.role, user.districtId]);
  const wards = await query(`SELECT w.id, w.district_id AS "districtId", w.code, w.name FROM wards w WHERE $1 = 'SUPER_ADMIN' OR w.district_id::text = $2 ORDER BY w.code`, [user.role, user.districtId]);
  const administrators = user.role === "SUPER_ADMIN" ? await query(`SELECT id, full_name AS "fullName", email, role, district_id AS "districtId" FROM users WHERE role IN ('ADMIN','WARD_COUNSELLOR','DEPARTMENT_OFFICER') ORDER BY created_at DESC`) : await query(`SELECT id, full_name AS "fullName", email, role, district_id AS "districtId" FROM users WHERE district_id = $1 AND role <> 'USER' ORDER BY created_at DESC`, [user.districtId]);
  const complaintScope = user.role === "SUPER_ADMIN" ? "TRUE" : "c.district_id = $1";
  const complaintParams = user.role === "SUPER_ADMIN" ? [] : [user.districtId];
  const complaints = await query(`SELECT c.id, c.reference, c.title, c.category, c.status, c.address, c.updated_at AS "updatedAt", count(cs.citizen_id)::int AS signatures FROM complaints c LEFT JOIN complaint_signatures cs ON cs.complaint_id = c.id WHERE ${complaintScope} GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 100`, complaintParams);
  const complaintCounts = await query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE status NOT IN ('RESOLVED','REJECTED'))::int AS unsolved, count(*) FILTER (WHERE status = 'RESOLVED')::int AS solved FROM complaints c WHERE ${complaintScope}`, complaintParams);
  return NextResponse.json({ districts: districts.rows, departments: departments.rows, wards: wards.rows, administrators: administrators.rows, complaints: complaints.rows, complaintCounts: complaintCounts.rows[0] });
}

export async function POST(request: Request) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json() as { action?: string; name?: string; code?: string; stateId?: string; districtId?: string; wardId?: string; fullName?: string; email?: string; password?: string; departmentId?: string; departmentName?: string };
  if (user.role === "SUPER_ADMIN" && body.action === "district") {
    if (!body.name?.trim() || !body.code?.trim() || !body.stateId?.trim()) return NextResponse.json({ error: "District name, code, and state are required." }, { status: 400 });
    const result = await query(`INSERT INTO districts (name, code, state_id) VALUES ($1,$2,$3) RETURNING id, code, name, state_id AS "stateId"`, [body.name.trim(), body.code.trim().toUpperCase(), body.stateId.trim()]);
    return NextResponse.json({ district: result.rows[0] }, { status: 201 });
  }
  if (user.role === "SUPER_ADMIN" && body.action === "districtAdmin") {
    if (!body.fullName?.trim() || !body.email?.trim() || !body.password || !body.districtId) return NextResponse.json({ error: "Name, email, password, and district are required." }, { status: 400 });
    const district = await query<{ id: string }>(`SELECT id FROM districts WHERE id::text = $1 OR code = $1 LIMIT 1`, [body.districtId.trim()]);
    if (!district.rows[0]) return NextResponse.json({ error: "District ID or district code was not found." }, { status: 400 });
    const result = await query(`INSERT INTO users (full_name, email, password_hash, role, district_id) VALUES ($1,$2,$3,'ADMIN',$4) RETURNING id, full_name AS "fullName", email, role, district_id AS "districtId"`, [body.fullName.trim(), body.email.trim().toLowerCase(), await hashPassword(body.password), district.rows[0].id]);
    return NextResponse.json({ administrator: result.rows[0] }, { status: 201 });
  }
  if (user.role === "ADMIN" && body.action === "department") {
    if (!body.departmentName?.trim() || !user.districtId) return NextResponse.json({ error: "Department name is required." }, { status: 400 });
    const seed = departmentSeed.find((item) => item[0] === body.departmentName);
    const result = await query(`INSERT INTO departments (district_id, name, description, agents) VALUES ($1,$2,$3,$4) RETURNING id, district_id AS "districtId", name, description, agents`, [user.districtId, body.departmentName.trim(), seed?.[1] ?? "District civic department", (seed?.[2] ?? "Intake,Routing").split(",")]);
    return NextResponse.json({ department: result.rows[0] }, { status: 201 });
  }
  if (user.role === "ADMIN" && body.action === "ward") {
    if (!body.code?.trim() || !body.name?.trim() || !user.districtId) return NextResponse.json({ error: "Ward code and name are required." }, { status: 400 });
    const result = await query(`INSERT INTO wards (district_id, code, name) VALUES ($1,$2,$3) RETURNING id, district_id AS "districtId", code, name`, [user.districtId, body.code.trim().toUpperCase(), body.name.trim()]);
    return NextResponse.json({ ward: result.rows[0] }, { status: 201 });
  }
  if (user.role === "ADMIN" && body.action === "wardCouncillor") {
    if (!body.wardId || !body.fullName?.trim() || !body.email?.trim() || !body.password || !user.districtId) return NextResponse.json({ error: "Ward, name, email, and password are required." }, { status: 400 });
    const ward = await query(`SELECT id FROM wards WHERE (id::text = $1 OR code = $1) AND district_id = $2`, [body.wardId.trim(), user.districtId]);
    if (!ward.rows[0]) return NextResponse.json({ error: "Ward does not belong to your district." }, { status: 400 });
    const result = await query(`INSERT INTO users (full_name, email, password_hash, role, district_id, ward_id) VALUES ($1,$2,$3,'WARD_COUNSELLOR',$4,$5) RETURNING id, full_name AS "fullName", email, role, district_id AS "districtId", ward_id AS "wardId"`, [body.fullName.trim(), body.email.trim().toLowerCase(), await hashPassword(body.password), user.districtId, ward.rows[0].id]);
    return NextResponse.json({ councillor: result.rows[0] }, { status: 201 });
  }
  if (user.role === "ADMIN" && body.action === "departmentHead") {
    if (!body.departmentId || !body.fullName?.trim() || !body.email?.trim() || !body.password || !user.districtId) return NextResponse.json({ error: "Department, name, email, and password are required." }, { status: 400 });
    const department = await query<{ id: string }>(`SELECT id FROM departments WHERE (id::text = $1 OR name = $1) AND district_id = $2`, [body.departmentId.trim(), user.districtId]);
    if (!department.rows[0]) return NextResponse.json({ error: "Department does not belong to your district." }, { status: 400 });
    const result = await query(`INSERT INTO users (full_name, email, password_hash, role, district_id) VALUES ($1,$2,$3,'DEPARTMENT_OFFICER',$4) RETURNING id`, [body.fullName.trim(), body.email.trim().toLowerCase(), await hashPassword(body.password), user.districtId]);
    await query(`UPDATE departments SET head_id = $1 WHERE id = $2 AND district_id = $3`, [result.rows[0].id, department.rows[0].id, user.districtId]);
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  return NextResponse.json({ error: "Action is not allowed for this role." }, { status: 403 });
}