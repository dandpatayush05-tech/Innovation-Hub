-- Add columns to destinations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS climate_notes TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Add destination_id to places
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    rating NUMERIC DEFAULT 0,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE places ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE;

-- Add category to places (assuming it's currently missing or needs to be a check constraint)
-- We won't strictly enforce an ENUM using CHECK constraint here to avoid breaking existing rows if they have other values,
-- but we will ensure the column exists.
ALTER TABLE places ADD COLUMN IF NOT EXISTS category TEXT;
