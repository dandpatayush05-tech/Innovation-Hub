-- Trips
create table if not exists trips (
  id uuid primary key default "uuid-ossp".uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  destination text not null,
  start_date date,
  end_date date,
  cover_photo_url text,
  created_at timestamp with time zone default now()
);
alter table trips enable row level security;

-- Trip Photos
create table if not exists trip_photos (
  id uuid primary key default "uuid-ossp".uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  url text not null,
  caption text,
  uploaded_at timestamp with time zone default now()
);
alter table trip_photos enable row level security;

-- Add trip_id to booking tables
alter table bookings add column if not exists trip_id uuid references trips(id) on delete set null;
alter table guide_bookings add column if not exists trip_id uuid references trips(id) on delete set null;
alter table flight_bookings add column if not exists trip_id uuid references trips(id) on delete set null;
alter table bus_bookings add column if not exists trip_id uuid references trips(id) on delete set null;
alter table auto_bookings add column if not exists trip_id uuid references trips(id) on delete set null;

create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_trip_photos_trip_id on trip_photos(trip_id);
create index if not exists idx_bookings_trip_id on bookings(trip_id);
create index if not exists idx_guide_bookings_trip_id on guide_bookings(trip_id);
create index if not exists idx_flight_bookings_trip_id on flight_bookings(trip_id);
create index if not exists idx_bus_bookings_trip_id on bus_bookings(trip_id);
create index if not exists idx_auto_bookings_trip_id on auto_bookings(trip_id);
