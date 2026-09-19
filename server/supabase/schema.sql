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

-- Transport Modes Table (for unified transport search and dynamic fare calc)
create table if not exists transport_modes (
  id uuid primary key default uuid_generate_v4(),
  mode text not null check (mode in ('flight', 'bus', 'auto')),
  base_fare numeric not null,
  rate_per_km numeric not null,
  comfort_score integer not null check (comfort_score >= 1 and comfort_score <= 5),
  min_distance_km numeric not null,
  max_distance_km numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table transport_modes enable row level security;

-- Payments
create table if not exists payments (
  id uuid primary key default "uuid-ossp".uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  booking_id uuid not null,
  booking_type text not null, -- 'hotel', 'flight', 'bus', 'auto', 'tour'
  amount numeric not null,
  currency text default 'INR',
  provider text default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  status text not null, -- 'created', 'pending', 'paid', 'failed', 'refunded'
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_provider_order_id on payments(provider_order_id);

alter table payments enable row level security;

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
-- Chunk 8a: Payment Groups and Multi-Leg payments

CREATE TABLE public.payment_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    group_type TEXT CHECK (group_type IN ('whole_trip', 'single_leg', 'multi_leg')),
    subtotal NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    discount_code TEXT,
    service_fee NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('created', 'pending', 'paid', 'failed')),
    razorpay_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_group_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_group_id UUID REFERENCES public.payment_groups(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL, -- Logical FK since it can map to bookings, flight_bookings, etc.
    item_type TEXT CHECK (item_type IN ('hotel', 'tour', 'bus_leg', 'flight', 'auto')),
    label TEXT,
    amount NUMERIC NOT NULL
);

ALTER TABLE public.payment_group_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.discount_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE, -- null = automatic rule, not a coupon
    type TEXT CHECK (type IN ('percent', 'flat')),
    value NUMERIC NOT NULL,
    min_amount NUMERIC DEFAULT 0,
    applies_to TEXT CHECK (applies_to IN ('whole_trip', 'any')),
    active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;

-- Seed the automatic discount rule for whole trips (5% off)
INSERT INTO public.discount_rules (code, type, value, min_amount, applies_to, active)
VALUES (null, 'percent', 5, 0, 'whole_trip', true);
-- Chunk DB-2: Constraints, Foreign Keys & Enums Migration

-- 1. Sanitize existing data before applying strict constraints
DO $$ 
BEGIN
    UPDATE payments SET amount = 0 WHERE amount < 0;
    UPDATE payment_groups SET subtotal = 0 WHERE subtotal < 0;
    UPDATE payment_groups SET total = 0 WHERE total < 0;
    UPDATE payment_groups SET service_fee = 0 WHERE service_fee < 0;
    UPDATE payment_group_items SET amount = 0 WHERE amount < 0;
    UPDATE trips SET end_date = start_date WHERE end_date < start_date;
    UPDATE auto_bookings SET end_date = start_date WHERE end_date < start_date;
END $$;

-- 2. Foreign Key ON DELETE adjustments
-- Re-adding/Confirming FK constraints for trips.id
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_trip_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE guide_bookings DROP CONSTRAINT IF EXISTS guide_bookings_trip_id_fkey;
ALTER TABLE guide_bookings ADD CONSTRAINT guide_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE flight_bookings DROP CONSTRAINT IF EXISTS flight_bookings_trip_id_fkey;
ALTER TABLE flight_bookings ADD CONSTRAINT flight_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE bus_bookings DROP CONSTRAINT IF EXISTS bus_bookings_trip_id_fkey;
ALTER TABLE bus_bookings ADD CONSTRAINT bus_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE auto_bookings DROP CONSTRAINT IF EXISTS auto_bookings_trip_id_fkey;
ALTER TABLE auto_bookings ADD CONSTRAINT auto_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE trip_photos DROP CONSTRAINT IF EXISTS trip_photos_trip_id_fkey;
ALTER TABLE trip_photos ADD CONSTRAINT trip_photos_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;

ALTER TABLE payment_group_items DROP CONSTRAINT IF EXISTS payment_group_items_payment_group_id_fkey;
ALTER TABLE payment_group_items ADD CONSTRAINT payment_group_items_payment_group_id_fkey FOREIGN KEY (payment_group_id) REFERENCES payment_groups(id) ON DELETE CASCADE;

-- 3. Create ENUM Types
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('created', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_group_status_enum AS ENUM ('created', 'pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_group_type_enum AS ENUM ('whole_trip', 'single_leg', 'multi_leg');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_item_type_enum AS ENUM ('hotel', 'tour', 'bus_leg', 'flight', 'auto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_rule_type_enum AS ENUM ('percent', 'flat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_applies_to_enum AS ENUM ('whole_trip', 'any');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Convert text columns to ENUMs
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_status_check;
ALTER TABLE payment_groups DROP CONSTRAINT IF EXISTS payment_groups_group_type_check;
ALTER TABLE payment_groups DROP CONSTRAINT IF EXISTS payment_groups_status_check;
ALTER TABLE payment_group_items DROP CONSTRAINT IF EXISTS payment_group_items_item_type_check;
ALTER TABLE discount_rules DROP CONSTRAINT IF EXISTS discount_rules_type_check;
ALTER TABLE discount_rules DROP CONSTRAINT IF EXISTS discount_rules_applies_to_check;

ALTER TABLE payments 
  ALTER COLUMN status TYPE payment_status_enum USING status::payment_status_enum;

ALTER TABLE payment_groups 
  ALTER COLUMN status TYPE payment_group_status_enum USING status::payment_group_status_enum,
  ALTER COLUMN group_type TYPE payment_group_type_enum USING group_type::payment_group_type_enum;

ALTER TABLE payment_group_items 
  ALTER COLUMN item_type TYPE payment_item_type_enum USING item_type::payment_item_type_enum;

ALTER TABLE discount_rules 
  ALTER COLUMN type TYPE discount_rule_type_enum USING type::discount_rule_type_enum,
  ALTER COLUMN applies_to TYPE discount_applies_to_enum USING applies_to::discount_applies_to_enum;

-- 5. NOT NULL Constraints
ALTER TABLE payments ALTER COLUMN amount SET NOT NULL;
ALTER TABLE payments ALTER COLUMN status SET NOT NULL;
ALTER TABLE payments ALTER COLUMN currency SET NOT NULL;
ALTER TABLE payment_groups ALTER COLUMN total SET NOT NULL;
ALTER TABLE payment_groups ALTER COLUMN subtotal SET NOT NULL;
ALTER TABLE trips ALTER COLUMN destination SET NOT NULL;

-- 6. Check Constraints on Money Values and Dates
ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_subtotal_check CHECK (subtotal >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_total_check CHECK (total >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_service_fee_check CHECK (service_fee >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_discount_amount_check CHECK (discount_amount >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_total_invariant CHECK (total >= (subtotal - discount_amount));
ALTER TABLE payment_group_items ADD CONSTRAINT payment_group_items_amount_check CHECK (amount >= 0);

ALTER TABLE trips ADD CONSTRAINT trips_date_check CHECK (end_date >= start_date);
ALTER TABLE auto_bookings ADD CONSTRAINT auto_bookings_date_check CHECK (end_date >= start_date);
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
-- Chunk DB-4: Transactional Integrity for Multi-Step Writes
-- These RPCs ensure that complex multi-table inserts/updates are atomic.

-- 1. Create Payment Group Transaction
CREATE OR REPLACE FUNCTION create_payment_group_txn(
    p_user_id uuid,
    p_trip_id uuid,
    p_group_type text,
    p_subtotal numeric,
    p_discount_amount numeric,
    p_discount_code text,
    p_service_fee numeric,
    p_total numeric,
    p_items jsonb
) RETURNS uuid AS $$
DECLARE
    v_group_id uuid;
    v_item jsonb;
BEGIN
    -- Insert payment group
    INSERT INTO payment_groups (
        user_id, trip_id, group_type, subtotal, discount_amount, discount_code, service_fee, total, status
    ) VALUES (
        p_user_id, p_trip_id, p_group_type::payment_group_type_enum, p_subtotal, p_discount_amount, p_discount_code, p_service_fee, p_total, 'created'
    ) RETURNING id INTO v_group_id;

    -- Insert items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO payment_group_items (
            payment_group_id, booking_id, item_type, label, amount
        ) VALUES (
            v_group_id,
            (v_item->>'booking_id')::uuid,
            (v_item->>'item_type')::payment_item_type_enum,
            v_item->>'label',
            (v_item->>'amount')::numeric
        );
    END LOOP;

    RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Verify Payment Transaction
CREATE OR REPLACE FUNCTION verify_payment_txn(
    p_group_id uuid,
    p_user_id uuid,
    p_provider_order_id text,
    p_provider_payment_id text
) RETURNS void AS $$
DECLARE
    v_item record;
BEGIN
    -- Update group status
    UPDATE payment_groups 
    SET status = 'paid', razorpay_order_id = p_provider_order_id 
    WHERE id = p_group_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment group not found or unauthorized';
    END IF;

    -- Iterate items and create payment records + confirm bookings
    FOR v_item IN (SELECT * FROM payment_group_items WHERE payment_group_id = p_group_id)
    LOOP
        -- Insert atomic payment row
        INSERT INTO payments (
            user_id, booking_id, booking_type, amount, currency, 
            provider, provider_order_id, provider_payment_id, status, paid_at
        ) VALUES (
            p_user_id, v_item.booking_id, v_item.item_type::text, v_item.amount, 'INR',
            'razorpay', p_provider_order_id, p_provider_payment_id, 'paid', NOW()
        );

        -- Confirm booking based on polymorphic type
        IF v_item.item_type = 'hotel' THEN
            UPDATE bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'tour' THEN
            UPDATE guide_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'flight' THEN
            UPDATE flight_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'bus_leg' THEN
            UPDATE bus_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'auto' THEN
            UPDATE auto_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
-- Chunk DB-4: Backfill Transactions
CREATE OR REPLACE FUNCTION backfill_payments_txn(
    p_payments jsonb
) RETURNS void AS $$
DECLARE
    v_payment jsonb;
BEGIN
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        INSERT INTO payments (
            user_id, booking_id, booking_type, amount, currency, 
            provider, provider_order_id, provider_payment_id, status, paid_at, created_at
        ) VALUES (
            (v_payment->>'user_id')::uuid,
            (v_payment->>'booking_id')::uuid,
            v_payment->>'booking_type',
            (v_payment->>'amount')::numeric,
            v_payment->>'currency',
            v_payment->>'provider',
            v_payment->>'provider_order_id',
            v_payment->>'provider_payment_id',
            v_payment->>'status',
            (v_payment->>'paid_at')::timestamptz,
            (v_payment->>'created_at')::timestamptz
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
-- Chunk 12a: Webhook Schema Alignment

-- 1. Create a generic function to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Update payment_groups table
ALTER TABLE payment_groups ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payment_groups ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payment_groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop constraint if it exists to be safe, then add
ALTER TABLE payment_groups DROP CONSTRAINT IF EXISTS payment_groups_razorpay_order_id_key;
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_razorpay_order_id_key UNIQUE (razorpay_order_id);

-- Attach trigger
DROP TRIGGER IF EXISTS update_payment_groups_updated_at ON payment_groups;
CREATE TRIGGER update_payment_groups_updated_at
    BEFORE UPDATE ON payment_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Update payments table
-- The unified payments table starts at line 358 in schema.sql
ALTER TABLE payments RENAME COLUMN provider_order_id TO razorpay_order_id;
ALTER TABLE payments RENAME COLUMN provider_payment_id TO razorpay_payment_id;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Attach trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Attach trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Redefine RPCs to use the newly renamed columns
CREATE OR REPLACE FUNCTION verify_payment_txn(
    p_group_id uuid,
    p_user_id uuid,
    p_provider_order_id text,
    p_provider_payment_id text
) RETURNS void AS $$
DECLARE
    v_item record;
BEGIN
    -- Update group status
    UPDATE payment_groups 
    SET status = 'paid', razorpay_order_id = p_provider_order_id 
    WHERE id = p_group_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment group not found or unauthorized';
    END IF;

    -- Iterate items and create payment records + confirm bookings
    FOR v_item IN (SELECT * FROM payment_group_items WHERE payment_group_id = p_group_id)
    LOOP
        -- Insert atomic payment row
        INSERT INTO payments (
            user_id, booking_id, booking_type, amount, currency, 
            provider, razorpay_order_id, razorpay_payment_id, status, paid_at
        ) VALUES (
            p_user_id, v_item.booking_id, v_item.item_type::text, v_item.amount, 'INR',
            'razorpay', p_provider_order_id, p_provider_payment_id, 'paid', NOW()
        );

        -- Confirm booking based on polymorphic type
        IF v_item.item_type = 'hotel' THEN
            UPDATE bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'tour' THEN
            UPDATE guide_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'flight' THEN
            UPDATE flight_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'bus_leg' THEN
            UPDATE bus_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'auto' THEN
            UPDATE auto_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION backfill_payments_txn(
    p_payments jsonb
) RETURNS void AS $$
DECLARE
    v_payment jsonb;
BEGIN
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        INSERT INTO payments (
            user_id, booking_id, booking_type, amount, currency, 
            provider, razorpay_order_id, razorpay_payment_id, status, paid_at, created_at
        ) VALUES (
            (v_payment->>'user_id')::uuid,
            (v_payment->>'booking_id')::uuid,
            v_payment->>'booking_type',
            (v_payment->>'amount')::numeric,
            v_payment->>'currency',
            v_payment->>'provider',
            v_payment->>'razorpay_order_id',
            v_payment->>'razorpay_payment_id',
            v_payment->>'status',
            (v_payment->>'paid_at')::timestamptz,
            (v_payment->>'created_at')::timestamptz
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
-- Chunk 12e: Notifications Log Table

CREATE TABLE IF NOT EXISTS public.notifications_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_id TEXT, -- Can be null or hold provider_payment_id
    type TEXT NOT NULL, -- e.g., 'sms_payment_success', 'sms_payment_failure'
    status TEXT NOT NULL, -- 'sent', 'failed'
    details TEXT, -- Holds error messages or Twilio SID
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access, standard users no access
CREATE POLICY "Service role can manage notifications" ON public.notifications_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
-- Add phone to users for SMS notifications
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
-- Chunk 12a: Help Center Content Schema

CREATE TABLE IF NOT EXISTS public.help_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS public.help_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.help_categories(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('faq_item', 'policy_section', 'static_page')),
    question TEXT,
    title TEXT,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_help_articles_updated_at ON help_articles;
CREATE TRIGGER update_help_articles_updated_at
    BEFORE UPDATE ON help_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_categories
CREATE POLICY "Public can view help categories" ON public.help_categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Service role can manage help categories" ON public.help_categories
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for help_articles
CREATE POLICY "Public can view published help articles" ON public.help_articles
    FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Service role can manage help articles" ON public.help_articles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for support_tickets
CREATE POLICY "Public can create support tickets" ON public.support_tickets
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Service role can manage support tickets" ON public.support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed Initial Categories
INSERT INTO public.help_categories (slug, title, display_order, icon) VALUES
    ('faq', 'Frequently Asked Questions', 10, 'HelpCircle'),
    ('booking-rules', 'Booking Rules', 20, 'BookOpen'),
    ('cancellation-policy', 'Cancellation Policy', 30, 'XCircle'),
    ('refund-policy', 'Refund Policy', 40, 'Banknote'),
    ('payment-policy', 'Payment Policy', 50, 'CreditCard'),
    ('terms-and-conditions', 'Terms & Conditions', 60, 'FileText'),
    ('privacy-policy', 'Privacy Policy', 70, 'Shield')
ON CONFLICT (slug) DO NOTHING;
