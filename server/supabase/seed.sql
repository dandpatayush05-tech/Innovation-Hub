-- Odisha Mock Dataset Seed File
-- IMPORTANT: Run this file to populate your Supabase database with realistic mock data for Odisha.
-- This file will clear existing data in these tables.

-- Clear existing data (in correct foreign-key order)
TRUNCATE TABLE auto_bookings, bus_bookings, flight_bookings, flights, buses, auto_vehicles, reviews, itineraries, contact_requests, guide_bookings, bookings, tours, hotels, destinations, businesses, users CASCADE;

-- Insert Mock Users
INSERT INTO users (id, name, email, password_hash, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@innovationhub.com', 'hashedpassword', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Traveler One', 'traveler1@example.com', 'hashedpassword', 'traveler'),
  ('33333333-3333-3333-3333-333333333333', 'Hotel Owner', 'hotel@odisha.com', 'hashedpassword', 'business'),
  ('44444444-4444-4444-4444-444444444444', 'Transport Operator', 'transport@odisha.com', 'hashedpassword', 'business');

-- Insert Mock Businesses
INSERT INTO businesses (id, user_id, business_name, business_type, description, location, contact_email, verified)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Odisha Hospitality Group', 'hotel', 'Premier hotel operator in Odisha', 'Bhubaneswar', 'hotel@odisha.com', true),
  ('b2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Kalinga Travels', 'bus_operator', 'Reliable bus and auto services across the state', 'Cuttack', 'transport@odisha.com', true),
  ('b3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Air Odisha', 'airline', 'Connecting regional airports', 'Bhubaneswar', 'flights@odisha.com', true);

-- Insert Mock Destinations
INSERT INTO destinations (id, name, country, description, image_url, tags, latitude, longitude)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Bhubaneswar', 'India', 'The Temple City of India, known for over 600 ancient shrines and modern infrastructure.', 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1000&auto=format&fit=crop', '{"temples", "culture", "city"}', 20.2961, 85.8245),
  ('d2222222-2222-2222-2222-222222222222', 'Puri', 'India', 'Coastal pilgrimage town centered on the Jagannath Temple and famous for its beaches.', 'https://images.unsplash.com/photo-1621217036647-380d56ee19d2?q=80&w=1000&auto=format&fit=crop', '{"beach", "pilgrimage", "culture"}', 19.8135, 85.8312),
  ('d3333333-3333-3333-3333-333333333333', 'Konark', 'India', 'Home to the UNESCO World Heritage Sun Temple, a 13th-century chariot-shaped monument.', 'https://images.unsplash.com/photo-1623594248430-81fba1431777?q=80&w=1000&auto=format&fit=crop', '{"heritage", "architecture", "history"}', 19.8876, 86.0945),
  ('d4444444-4444-4444-4444-444444444444', 'Chilika Lake', 'India', 'Asia''s largest brackish water lagoon, known for migratory birds and dolphins.', 'https://images.unsplash.com/photo-1605707788410-d023166299b1?q=80&w=1000&auto=format&fit=crop', '{"nature", "wildlife", "lake"}', 19.6468, 85.3283),
  ('d5555555-5555-5555-5555-555555555555', 'Cuttack', 'India', 'Odisha''s cultural capital, famous for centuries-old silver filigree work.', 'https://images.unsplash.com/photo-1587823528221-52f20dc20760?q=80&w=1000&auto=format&fit=crop', '{"culture", "history", "city"}', 20.4625, 85.8828);

-- Insert Mock Hotels
INSERT INTO hotels (id, business_id, destination_id, name, description, price_per_night, amenities, image_url, rating, latitude, longitude)
VALUES
  ('h1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Mayfair Lagoon', 'A luxury resort offering an oasis of tranquility in the heart of Bhubaneswar.', 8500, '{"pool", "wifi", "restaurant", "spa", "parking"}', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop', 4.8, 20.3015, 85.8188),
  ('h2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'Mayfair Heritage', 'Experience luxury with spectacular views of the Bay of Bengal.', 9200, '{"beach_access", "pool", "wifi", "restaurant"}', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop', 4.7, 19.8055, 85.8242),
  ('h3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'Lotus Eco Resort', 'Eco-friendly stay near the Ramchandi beach and Konark temple.', 4500, '{"beach_access", "wifi", "restaurant"}', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop', 4.2, 19.8700, 86.0850);

-- Insert Mock Flights
INSERT INTO flights (id, business_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, price)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'IndiGo', '6E-453', 'DEL', 'BBI', now() + interval '1 day' + interval '10 hours', now() + interval '1 day' + interval '12 hours', 4500),
  ('f2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 'Air India', 'AI-873', 'BOM', 'BBI', now() + interval '2 days' + interval '14 hours', now() + interval '2 days' + interval '16 hours', 5200);

-- Insert Mock Buses
INSERT INTO buses (id, business_id, operator_name, route_source, route_destination, departure_time, arrival_time, price, total_seats)
VALUES
  ('bus11111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'OSRTC Volvo', 'Bhubaneswar', 'Puri', now() + interval '1 day' + interval '8 hours', now() + interval '1 day' + interval '10 hours', 300, 40),
  ('bus22222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'OSRTC Premium', 'Puri', 'Konark', now() + interval '1 day' + interval '11 hours', now() + interval '1 day' + interval '12 hours', 150, 40);

-- Insert Mock Auto/Taxis
INSERT INTO auto_vehicles (id, business_id, vehicle_type, model, city, price_per_day, driver_included)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'car', 'Dzire', 'Bhubaneswar', 1500, true),
  ('a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'suv', 'Innova', 'Puri', 2500, true);
