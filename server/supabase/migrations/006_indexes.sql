-- Chunk DB-3: Indexing Strategy
-- Adding indexes backed by actual query patterns in the application

-- 1. Payments 
-- Supports dashboard list filters (by user and status)
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments (user_id, status);
-- Supports single receipt fetches by booking ID
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments (booking_id);

-- 2. Payment Groups
-- Supports history ordering for a user's past payment groups
CREATE INDEX IF NOT EXISTS idx_payment_groups_user_created ON payment_groups (user_id, created_at DESC);

-- 3. Payment Group Items
-- Supports assembling the combined receipt for a single payment group
CREATE INDEX IF NOT EXISTS idx_payment_group_items_group_id ON payment_group_items (payment_group_id);

-- 4. Trips
-- Supports "Past Experiences" grid, fetching user's trips ordered by date
CREATE INDEX IF NOT EXISTS idx_trips_user_start_date ON trips (user_id, start_date DESC);

-- 5. Trip Children (Aggregation/Details)
-- Supports fetching all components of a trip
CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON trip_photos (trip_id);
-- Note: Some of these were added in previous chunks, adding IF NOT EXISTS for safety
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings (trip_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_trip_id ON flight_bookings (trip_id);
CREATE INDEX IF NOT EXISTS idx_bus_bookings_trip_id ON bus_bookings (trip_id);
CREATE INDEX IF NOT EXISTS idx_auto_bookings_trip_id ON auto_bookings (trip_id);
CREATE INDEX IF NOT EXISTS idx_guide_bookings_trip_id ON guide_bookings (trip_id);
