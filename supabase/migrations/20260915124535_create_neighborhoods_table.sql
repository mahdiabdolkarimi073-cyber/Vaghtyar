/*
# Create Neighborhoods table for city/neighborhood management

1. New Tables
- "Neighborhood"
  - id (text, primary key, auto-generated UUID)
  - name (text, not null) — neighborhood name
  - slug (text, unique, not null) — URL-friendly slug
  - cityId (text, not null, foreign key to "City"(id) ON DELETE CASCADE)
  - createdAt (timestamptz, default now())
- Index on cityId for fast lookups
- Unique constraint on (cityId, name) to prevent duplicate neighborhoods within the same city

2. Security
- Enable RLS on "Neighborhood"
- Public read for anon + authenticated (neighborhoods are public directory data)
- Authenticated CRUD for admin management
*/

CREATE TABLE IF NOT EXISTS "Neighborhood" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  "cityId" TEXT NOT NULL REFERENCES "City"(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Neighborhood_cityId_idx" ON "Neighborhood"("cityId");
CREATE UNIQUE INDEX IF NOT EXISTS "Neighborhood_cityId_name_key" ON "Neighborhood"("cityId", name);

ALTER TABLE "Neighborhood" ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "anon_read_neighborhoods" ON "Neighborhood";
CREATE POLICY "anon_read_neighborhoods" ON "Neighborhood" FOR SELECT
  TO anon, authenticated USING (true);

-- Authenticated CRUD
DROP POLICY IF EXISTS "auth_neighborhood_insert" ON "Neighborhood";
CREATE POLICY "auth_neighborhood_insert" ON "Neighborhood" FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_neighborhood_update" ON "Neighborhood";
CREATE POLICY "auth_neighborhood_update" ON "Neighborhood" FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_neighborhood_delete" ON "Neighborhood";
CREATE POLICY "auth_neighborhood_delete" ON "Neighborhood" FOR DELETE
  TO authenticated USING (true);