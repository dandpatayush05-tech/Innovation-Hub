-- Run this in Supabase SQL editor to update the live database
ALTER TABLE guide_bookings ADD tour_id uuid REFERENCES tours(id) ON DELETE SET NULL;
ALTER TABLE guide_bookings ADD time_slot text;
ALTER TABLE guide_bookings ADD guest_count integer NOT NULL DEFAULT 1;
ALTER TABLE guide_bookings ADD guest_info jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE guide_bookings ADD total_price numeric;

-- Clean up any existing notes string data if we wanted to, but not strictly necessary.
