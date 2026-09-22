-- ====================================================================
-- Transport Hubs & Connectivity Schema
-- Tables: airports, railway_stations, bus_stations
-- Extensions: destinations table connection-hub foreign keys
-- ====================================================================

-- 1. Airports Table
CREATE TABLE IF NOT EXISTS airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iata_code VARCHAR(10) NOT NULL,
    icao_code VARCHAR(10),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    terminal_info JSONB DEFAULT '{}'::jsonb,
    facilities JSONB DEFAULT '{}'::jsonb,
    is_nearest_hub BOOLEAN DEFAULT false,
    hub_type TEXT DEFAULT 'co-located',
    connectivity_notes TEXT,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Railway Stations Table
CREATE TABLE IF NOT EXISTS railway_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_code VARCHAR(10) NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    is_nearest_hub BOOLEAN DEFAULT false,
    hub_type TEXT DEFAULT 'co-located',
    connectivity_notes TEXT,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bus Stations Table
CREATE TABLE IF NOT EXISTS bus_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    is_nearest_hub BOOLEAN DEFAULT false,
    hub_type TEXT DEFAULT 'co-located',
    connectivity_notes TEXT,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Extend destinations table with connection-hub references and metadata
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS nearest_airport_id UUID REFERENCES airports(id) ON DELETE SET NULL;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS nearest_railway_station_id UUID REFERENCES railway_stations(id) ON DELETE SET NULL;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS nearest_bus_station_id UUID REFERENCES bus_stations(id) ON DELETE SET NULL;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS connectivity_notes JSONB DEFAULT '{}'::jsonb;

-- 5. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_destination ON airports(destination_id);
CREATE INDEX IF NOT EXISTS idx_railway_stations_code ON railway_stations(station_code);
CREATE INDEX IF NOT EXISTS idx_railway_stations_destination ON railway_stations(destination_id);
CREATE INDEX IF NOT EXISTS idx_bus_stations_destination ON bus_stations(destination_id);

-- 6. Enable RLS and public read policies
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE railway_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'airports' AND policyname = 'Allow public read access on airports'
    ) THEN
        CREATE POLICY "Allow public read access on airports" ON airports FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'railway_stations' AND policyname = 'Allow public read access on railway_stations'
    ) THEN
        CREATE POLICY "Allow public read access on railway_stations" ON railway_stations FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'bus_stations' AND policyname = 'Allow public read access on bus_stations'
    ) THEN
        CREATE POLICY "Allow public read access on bus_stations" ON bus_stations FOR SELECT USING (true);
    END IF;
END $$;
