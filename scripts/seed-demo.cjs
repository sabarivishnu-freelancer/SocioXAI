const crypto = require("node:crypto");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://sociox:sociox_dev_password@localhost:5432/sociox";
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
};

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("BEGIN");
    const district = (await client.query("INSERT INTO districts (code, name, state_id) VALUES ('DEMO-001', 'Demo District', 'DEMO') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id")).rows[0];
    const ward = (await client.query("INSERT INTO wards (district_id, code, name) VALUES ($1, 'DEMO-WARD', 'Demo Ward') ON CONFLICT (district_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id", [district.id])).rows[0];
    const department = (await client.query("INSERT INTO departments (district_id, name, description, agents) VALUES ($1, 'Roads & Transportation', 'Demo civic department', ARRAY['Intake','Geo','Routing']) ON CONFLICT (district_id, name) DO UPDATE SET description = EXCLUDED.description RETURNING id", [district.id])).rows[0];

    const superAdmin = (await client.query("INSERT INTO users (full_name, email, password_hash, role, district_id) VALUES ('Demo Super Admin', 'superadmin@demo.sociox.local', $1, 'SUPER_ADMIN', $2) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = true RETURNING id", [hashPassword("Demo@12345"), district.id])).rows[0];
    const districtAdmin = (await client.query("INSERT INTO users (full_name, email, password_hash, role, district_id) VALUES ('Demo District Admin', 'admin@demo.sociox.local', $1, 'ADMIN', $2) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, district_id = EXCLUDED.district_id, is_active = true RETURNING id", [hashPassword("Demo@12345"), district.id])).rows[0];
    await client.query("INSERT INTO users (full_name, email, password_hash, role, district_id, ward_id) VALUES ('Demo Ward Counsellor', 'counsellor@demo.sociox.local', $1, 'WARD_COUNSELLOR', $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, district_id = EXCLUDED.district_id, ward_id = EXCLUDED.ward_id, is_active = true", [hashPassword("Demo@12345"), district.id, ward.id]);
    await client.query("INSERT INTO users (full_name, email, password_hash, role, district_id) VALUES ('Demo Department Officer', 'officer@demo.sociox.local', $1, 'DEPARTMENT_OFFICER', $2) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, district_id = EXCLUDED.district_id, is_active = true", [hashPassword("Demo@12345"), district.id]);
    const citizen = (await client.query("INSERT INTO users (full_name, email, password_hash, role, district_id, ward_id, ward, address) VALUES ('Demo Citizen', 'citizen@demo.sociox.local', $1, 'USER', $2, $3, 'DEMO-WARD', 'Demo Ward') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, district_id = EXCLUDED.district_id, ward_id = EXCLUDED.ward_id, is_active = true RETURNING id", [hashPassword("Demo@12345"), district.id, ward.id])).rows[0];
    await client.query("INSERT INTO departments (district_id, name, description, agents, head_id) VALUES ($1, 'Roads & Transportation', 'Demo civic department', ARRAY['Intake','Geo','Routing'], $2) ON CONFLICT (district_id, name) DO NOTHING", [district.id, districtAdmin.id]);
    await client.query("INSERT INTO complaints (reference, citizen_id, title, description, category, status, address, latitude, longitude, district_id, ward_id) VALUES ('DEMO-0001', $1, 'Pothole near Demo Road', 'A large pothole is affecting vehicles and pedestrians.', 'Roads & Transportation', 'SUBMITTED', 'Demo Ward Main Road', 12.9716, 77.5946, $2, $3) ON CONFLICT (reference) DO NOTHING", [citizen.id, district.id, ward.id]);
    await client.query("COMMIT");
    console.log("Demo accounts ready. Password for all accounts: Demo@12345");
    console.log("superadmin@demo.sociox.local | admin@demo.sociox.local | counsellor@demo.sociox.local | officer@demo.sociox.local | citizen@demo.sociox.local");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
