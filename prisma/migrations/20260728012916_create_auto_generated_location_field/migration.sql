-- ---------------------------------------------------------
-- ORGANIZATION
-- ---------------------------------------------------------
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "location";

ALTER TABLE "Organization"
ADD COLUMN "location" geography(Point, 4326)
GENERATED ALWAYS AS (
  CASE
    WHEN longitude IS NOT NULL AND latitude IS NOT NULL
    THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ELSE NULL
  END
) STORED;

CREATE INDEX IF NOT EXISTS "Organization_location_gist_idx"
ON "Organization"
USING GIST ("location");

-- ---------------------------------------------------------
-- OPPORTUNITY
-- ---------------------------------------------------------
ALTER TABLE "Opportunity" DROP COLUMN IF EXISTS "location";

ALTER TABLE "Opportunity"
ADD COLUMN "location" geography(Point, 4326)
GENERATED ALWAYS AS (
  CASE
    WHEN longitude IS NOT NULL AND latitude IS NOT NULL
    THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ELSE NULL
  END
) STORED;

CREATE INDEX IF NOT EXISTS "Opportunity_location_gist_idx"
ON "Opportunity"
USING GIST ("location");
