CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text UNIQUE,
  mobile text UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'WARD_COUNSELLOR', 'DEPARTMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN')),
  state text,
  district text,
  town text,
  ward text,
  state_id text,
  district_id text,
  city_id text,
  ward_id text,
  address text,
  email_verified boolean NOT NULL DEFAULT false,
  mobile_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  failed_login_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_contact_required CHECK (email IS NOT NULL OR mobile IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  citizen_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  description text NOT NULL CHECK (char_length(description) BETWEEN 3 AND 5000),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'IN REVIEW', 'VERIFIED', 'IN PROGRESS', 'RESOLVED', 'REJECTED')),
  address text NOT NULL,
  latitude double precision,
  longitude double precision,
  photo_name text,
  state_id text,
  district_id text,
  city_id text,
  ward_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS complaints_citizen_id_idx ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS complaints_updated_at_idx ON complaints(updated_at DESC);

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS state_id text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS district_id text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS city_id text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ward_id text;

CREATE TABLE IF NOT EXISTS complaint_signatures (
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  citizen_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (complaint_id, citizen_id)
);

CREATE INDEX IF NOT EXISTS complaint_signatures_citizen_id_idx ON complaint_signatures(citizen_id);

CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  state_id text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  agents text[] NOT NULL DEFAULT '{}',
  head_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (district_id, name)
);

CREATE INDEX IF NOT EXISTS districts_state_id_idx ON districts(state_id);
CREATE INDEX IF NOT EXISTS departments_district_id_idx ON departments(district_id);

CREATE TABLE IF NOT EXISTS wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (district_id, code)
);

CREATE INDEX IF NOT EXISTS wards_district_id_idx ON wards(district_id);