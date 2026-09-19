-- Chunk DB-4/5: Soft Deletion for Bookings

-- 1. Add deleted_at column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE guide_bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE flight_bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE bus_bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE auto_bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Enforce Row Level Security to hide deleted rows globally
-- We use AS RESTRICTIVE so this ANDs with any existing permissive policies.
CREATE POLICY hide_deleted_bookings ON bookings AS RESTRICTIVE FOR ALL USING (deleted_at IS NULL);
CREATE POLICY hide_deleted_guide_bookings ON guide_bookings AS RESTRICTIVE FOR ALL USING (deleted_at IS NULL);
CREATE POLICY hide_deleted_flight_bookings ON flight_bookings AS RESTRICTIVE FOR ALL USING (deleted_at IS NULL);
CREATE POLICY hide_deleted_bus_bookings ON bus_bookings AS RESTRICTIVE FOR ALL USING (deleted_at IS NULL);
CREATE POLICY hide_deleted_auto_bookings ON auto_bookings AS RESTRICTIVE FOR ALL USING (deleted_at IS NULL);

-- Note: The Supabase Service Role key (used in server/src/config/supabase.ts) bypasses RLS,
-- so backend services can still retrieve deleted bookings if needed for receipt generation.
