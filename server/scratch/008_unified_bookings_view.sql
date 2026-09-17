-- Create a unified view for all bookings

CREATE OR REPLACE VIEW unified_bookings AS
-- 1. Hotel Bookings
SELECT 
  b.id,
  b.user_id,
  'hotel' AS type,
  b.status,
  b.check_in AS date,
  h.name AS title,
  'Hotel Booking' AS subtitle,
  (SELECT amount FROM payments WHERE booking_id = b.id LIMIT 1) AS amount,
  b.created_at
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id

UNION ALL

-- 2. Tour/Experience Bookings
SELECT 
  gb.id,
  gb.user_id,
  'experience' AS type,
  gb.status,
  gb.date AS date,
  t.name AS title,
  'Experience Booking' AS subtitle,
  gb.total_price AS amount,
  gb.created_at
FROM guide_bookings gb
JOIN tours t ON gb.tour_id = t.id

UNION ALL

-- 3. Flight Bookings
SELECT 
  fb.id,
  fb.user_id,
  'flight' AS type,
  fb.status,
  f.departure_time AS date,
  f.airline || ' (' || f.flight_number || ')' AS title,
  f.departure_airport || ' -> ' || f.arrival_airport AS subtitle,
  (f.price * fb.passengers) AS amount,
  fb.created_at
FROM flight_bookings fb
JOIN flights f ON fb.flight_id = f.id

UNION ALL

-- 4. Bus Bookings
SELECT 
  bb.id,
  bb.user_id,
  'bus' AS type,
  bb.status,
  bs.departure_time AS date,
  bs.operator_name AS title,
  bs.route_source || ' -> ' || bs.route_destination AS subtitle,
  (bs.price * bb.seats) AS amount,
  bb.created_at
FROM bus_bookings bb
JOIN buses bs ON bb.bus_id = bs.id

UNION ALL

-- 5. Auto Bookings
SELECT 
  ab.id,
  ab.user_id,
  'auto' AS type,
  ab.status,
  ab.start_date AS date,
  'Local Transport' AS title,
  ab.pickup_location || ' -> ' || ab.dropoff_location AS subtitle,
  (SELECT amount FROM payments WHERE booking_id = ab.id LIMIT 1) AS amount,
  ab.created_at
FROM auto_bookings ab;
