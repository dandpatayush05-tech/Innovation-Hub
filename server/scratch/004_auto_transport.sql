-- Run this in Supabase SQL editor to update the live database
ALTER TABLE auto_bookings DROP CONSTRAINT IF EXISTS auto_bookings_auto_id_fkey;
ALTER TABLE auto_bookings ALTER COLUMN auto_id DROP NOT NULL;
ALTER TABLE auto_bookings ADD CONSTRAINT auto_bookings_auto_id_fkey FOREIGN KEY (auto_id) REFERENCES auto_vehicles(id) ON DELETE SET NULL;

ALTER TABLE auto_bookings ALTER COLUMN end_date DROP NOT NULL;
ALTER TABLE auto_bookings ADD COLUMN passenger_count integer NOT NULL DEFAULT 1;
ALTER TABLE auto_bookings ADD COLUMN vehicle_type text;
ALTER TABLE auto_bookings ADD COLUMN additional_instructions text;

ALTER TABLE auto_bookings DROP CONSTRAINT IF EXISTS auto_bookings_status_check;
ALTER TABLE auto_bookings ADD CONSTRAINT auto_bookings_status_check CHECK (status in ('requested', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));
