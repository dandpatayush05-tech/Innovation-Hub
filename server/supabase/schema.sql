-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'traveler' check (role in ('traveler', 'business', 'admin')),
  refresh_token_hash text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Businesses Table
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  business_name text not null,
  business_type text not null check (business_type in ('hotel', 'agency', 'guide', 'airline', 'bus_operator', 'transport')),
  description text,
  location text,
  contact_email text not null,
  verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Destinations Table
create table if not exists destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  description text not null,
  image_url text not null,
  tags text[] default '{}',
  intelligence_data jsonb default '{}',
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Hotels Table
create table if not exists hotels (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  description text not null,
  price_per_night numeric not null,
  amenities text[] default '{}',
  image_url text not null,
  rating numeric default 0,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tours Table
create table if not exists tours (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  description text not null,
  price numeric not null check (price >= 0),
  duration_hours integer not null check (duration_hours > 0),
  category text not null,
  availability integer not null default 0 check (availability >= 0),
  image_url text not null,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Bookings Table
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  check_in timestamp with time zone not null,
  check_out timestamp with time zone not null,
  guests integer not null check (guests >= 1),
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'no_show')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- GuideBookings Table
create table if not exists guide_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  tour_id uuid references tours(id) on delete set null,
  date timestamp with time zone not null,
  time_slot text,
  guest_count integer not null default 1,
  guest_info jsonb not null default '[]'::jsonb,
  total_price numeric,
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ContactRequests Table
create table if not exists contact_requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  organization_type text not null check (organization_type in ('traveler', 'hotel', 'agency', 'guide')),
  message text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Itineraries Table
create table if not exists itineraries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  name text,
  prompt text not null,
  destination text not null,
  start_date date,
  end_date date,
  travelers integer default 1,
  days jsonb not null default '[]',
  estimated_budget text not null,
  notes text,
  cover_image text,
  is_public boolean default false,
  ai_recommendations text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Security: Enable Row Level Security (RLS)
-- Since our backend uses the Service Role Key, it bypasses RLS automatically.
-- However, enabling RLS is highly recommended to block unauthorized access from frontend clients directly.
alter table users enable row level security;
alter table businesses enable row level security;
alter table destinations enable row level security;
alter table hotels enable row level security;
alter table bookings enable row level security;
alter table guide_bookings enable row level security;
alter table contact_requests enable row level security;
alter table itineraries enable row level security;
alter table tours enable row level security;

-- Reviews Table
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  tour_id uuid references tours(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  check (
      (hotel_id is not null and tour_id is null) or
      (hotel_id is null and tour_id is not null)
  )
);
alter table reviews enable row level security;

-- Flights Table
create table if not exists flights (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  airline text not null,
  flight_number text not null,
  departure_airport text not null,
  arrival_airport text not null,
  departure_time timestamp with time zone not null,
  arrival_time timestamp with time zone not null,
  price numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table flights enable row level security;

-- Buses Table
create table if not exists buses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  operator_name text not null,
  route_source text not null,
  route_destination text not null,
  departure_time timestamp with time zone not null,
  arrival_time timestamp with time zone not null,
  price numeric not null,
  total_seats integer not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table buses enable row level security;

-- AutoVehicles Table
create table if not exists auto_vehicles (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  vehicle_type text not null check (vehicle_type in ('car', 'suv', 'van', 'auto_rickshaw')),
  model text not null,
  city text not null,
  price_per_day numeric not null,
  driver_included boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table auto_vehicles enable row level security;

-- FlightBookings Table
create table if not exists flight_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  flight_id uuid not null references flights(id) on delete cascade,
  passengers integer not null check (passengers >= 1),
  passenger_details jsonb not null default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table flight_bookings enable row level security;

-- BusBookings Table
create table if not exists bus_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  bus_id uuid not null references buses(id) on delete cascade,
  seats integer not null check (seats >= 1),
  passenger_details jsonb not null default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table bus_bookings enable row level security;

-- AutoBookings Table
create table if not exists auto_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  auto_id uuid references auto_vehicles(id) on delete set null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  pickup_location text not null,
  dropoff_location text not null,
  passenger_count integer not null default 1,
  vehicle_type text,
  additional_instructions text,
  status text default 'pending' check (status in ('requested', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table auto_bookings enable row level security;

-- Payments Table
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  booking_id uuid not null, -- generic reference
  booking_type text not null check (booking_type in ('hotel', 'tour', 'flight', 'bus', 'auto')),
  amount numeric not null,
  currency text default 'USD',
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table payments enable row level security;

-- Invoices Table
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references payments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  invoice_number text not null unique,
  amount numeric not null,
  issued_at timestamp with time zone default now(),
  pdf_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table invoices enable row level security;

-- Notifications Table
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('booking_confirmation', 'payment_success', 'reminder', 'system_alert')),
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table notifications enable row level security;

-- Unified Bookings View
create or replace view unified_bookings as
select 
  b.id, b.user_id, 'hotel' as type, b.status, b.check_in as date,
  h.name as title, 'Hotel Booking' as subtitle,
  (select amount from payments where booking_id = b.id limit 1) as amount,
  b.created_at
from bookings b join hotels h on b.hotel_id = h.id
union all
select 
  gb.id, gb.user_id, 'experience' as type, gb.status, gb.date as date,
  t.name as title, 'Experience Booking' as subtitle,
  gb.total_price as amount, gb.created_at
from guide_bookings gb join tours t on gb.tour_id = t.id
union all
select 
  fb.id, fb.user_id, 'flight' as type, fb.status, f.departure_time as date,
  f.airline || ' (' || f.flight_number || ')' as title,
  f.departure_airport || ' -> ' || f.arrival_airport as subtitle,
  (f.price * fb.passengers) as amount, fb.created_at
from flight_bookings fb join flights f on fb.flight_id = f.id
union all
select 
  bb.id, bb.user_id, 'bus' as type, bb.status, bs.departure_time as date,
  bs.operator_name as title, bs.route_source || ' -> ' || bs.route_destination as subtitle,
  (bs.price * bb.seats) as amount, bb.created_at
from bus_bookings bb join buses bs on bb.bus_id = bs.id
union all
select 
  ab.id, ab.user_id, 'auto' as type, ab.status, ab.start_date as date,
  'Local Transport' as title, ab.pickup_location || ' -> ' || ab.dropoff_location as subtitle,
  (select amount from payments where booking_id = ab.id limit 1) as amount,
  ab.created_at
from auto_bookings ab;
