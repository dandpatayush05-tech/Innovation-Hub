# Database Documentation

## RLS & Authorization Architecture

All tables in the database have Row Level Security (RLS) enabled.
**However, the Express backend uses the `SUPABASE_SERVICE_ROLE_KEY` to interact with the database.** This service role key intentionally bypasses all RLS policies. 
Therefore, database-level RLS acts solely as a safeguard against direct external queries from the frontend. **All authorization, data isolation, and permission logic is strictly enforced in the Express backend via middleware (`authGuard.ts`).**

## Tables and Schemas

### `users`
Stores all application users.
- `id` (uuid, primary key, default v4)
- `name` (text, not null)
- `email` (text, not null, unique)
- `password_hash` (text, not null)
- `role` (text, not null, default 'traveler', check: traveler/business/admin)
- `refresh_token_hash` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### `businesses`
Stores vendor profiles.
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`** (cascade delete)
- `business_name` (text, not null)
- `business_type` (text, not null, check: hotel/agency/guide/airline/bus_operator/transport)
- `description` (text)
- `location` (text)
- `contact_email` (text, not null)
- `verified` (boolean, default false)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### `destinations`
Stores general location data.
- `id` (uuid, primary key)
- `name` (text, not null)
- `country` (text, not null)
- `description` (text, not null)
- `image_url` (text, not null)
- `tags` (text array, default '{}')
- `intelligence_data` (jsonb, default '{}')
- `latitude` (numeric)
- `longitude` (numeric)
- `created_at` / `updated_at` (timestamp with time zone)

### `hotels`
Stores hotel properties.
- `id` (uuid, primary key)
- `business_id` (uuid, not null) - **Belongs to `businesses`** (cascade delete)
- `destination_id` (uuid, not null) - **Belongs to `destinations`** (cascade delete)
- `name` (text, not null)
- `description` (text, not null)
- `price_per_night` (numeric, not null)
- `amenities` (text array, default '{}')
- `image_url` (text, not null)
- `rating` (numeric, default 0)
- `latitude` / `longitude` (numeric)
- `created_at` / `updated_at` (timestamp with time zone)

### `tours`
Stores tour packages and experiences.
- `id` (uuid, primary key)
- `business_id` (uuid, not null) - **Belongs to `businesses`** (cascade delete)
- `destination_id` (uuid, not null) - **Belongs to `destinations`** (cascade delete)
- `name` (text, not null)
- `description` (text, not null)
- `price` (numeric, not null)
- `duration_hours` (integer, not null)
- `category` (text, not null)
- `availability` (integer, not null, default 0)
- `image_url` (text, not null)
- `latitude` / `longitude` (numeric)
- `created_at` / `updated_at` (timestamp with time zone)

### `flights`
Stores flight schedules.
- `id` (uuid, primary key)
- `business_id` (uuid, not null) - **Belongs to `businesses`** (cascade delete)
- `airline` / `flight_number` (text, not null)
- `departure_airport` / `arrival_airport` (text, not null)
- `departure_time` / `arrival_time` (timestamp with time zone, not null)
- `price` (numeric, not null)
- `created_at` / `updated_at` (timestamp with time zone)

### `buses`
Stores bus routes.
- `id` (uuid, primary key)
- `business_id` (uuid, not null) - **Belongs to `businesses`** (cascade delete)
- `operator_name` / `route_source` / `route_destination` (text, not null)
- `departure_time` / `arrival_time` (timestamp with time zone, not null)
- `price` (numeric, not null)
- `total_seats` (integer, not null)
- `created_at` / `updated_at` (timestamp with time zone)

### `auto_vehicles`
Stores local transport options.
- `id` (uuid, primary key)
- `business_id` (uuid, not null) - **Belongs to `businesses`** (cascade delete)
- `vehicle_type` (text, not null, check: car/suv/van/auto_rickshaw)
- `model` / `city` (text, not null)
- `price_per_day` (numeric, not null)
- `driver_included` (boolean, default false)
- `created_at` / `updated_at` (timestamp with time zone)

### `bookings` (Hotel Bookings)
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`** (cascade delete)
- `business_id` (uuid, not null) - **Belongs to `businesses`** (cascade delete)
- `hotel_id` (uuid, not null) - **Belongs to `hotels`** (cascade delete)
- `check_in` / `check_out` (timestamp with time zone, not null)
- `guests` (integer, not null)
- `status` (text, default 'pending', check constraints apply)
- `created_at` / `updated_at` (timestamp with time zone)

### `guide_bookings` (Tour Bookings)
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`**
- `business_id` (uuid, not null) - **Belongs to `businesses`**
- `tour_id` (uuid) - **Belongs to `tours`** (set null on delete)
- `date` (timestamp with time zone, not null)
- `time_slot` (text)
- `guest_count` (integer, not null)
- `guest_info` (jsonb, not null)
- `total_price` (numeric)
- `notes` / `status` (text)
- `created_at` / `updated_at` (timestamp with time zone)

### `flight_bookings`
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`**
- `business_id` (uuid, not null) - **Belongs to `businesses`**
- `flight_id` (uuid, not null) - **Belongs to `flights`**
- `passengers` (integer, not null)
- `passenger_details` (jsonb, not null)
- `status` (text, default 'pending')
- `created_at` / `updated_at` (timestamp with time zone)

### `bus_bookings`
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`**
- `business_id` (uuid, not null) - **Belongs to `businesses`**
- `bus_id` (uuid, not null) - **Belongs to `buses`**
- `seats` (integer, not null)
- `passenger_details` (jsonb, not null)
- `status` (text, default 'pending')
- `created_at` / `updated_at` (timestamp with time zone)

### `auto_bookings`
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`**
- `business_id` (uuid, not null) - **Belongs to `businesses`**
- `auto_id` (uuid) - **Belongs to `auto_vehicles`**
- `start_date` / `end_date` (timestamp with time zone)
- `pickup_location` / `dropoff_location` (text, not null)
- `passenger_count` (integer, not null)
- `vehicle_type` / `additional_instructions` / `status` (text)
- `created_at` / `updated_at` (timestamp with time zone)

### `payments`
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`** (cascade delete)
- `booking_id` (uuid, not null) - Generic reference to any booking table
- `booking_type` (text, not null, check: hotel/tour/flight/bus/auto)
- `amount` (numeric, not null)
- `currency` (text, default 'USD')
- `payment_status` (text, default 'pending')
- `razorpay_order_id` / `razorpay_payment_id` (text)
- `created_at` / `updated_at` (timestamp with time zone)

### `invoices`
- `id` (uuid, primary key)
- `payment_id` (uuid, not null) - **Belongs to `payments`** (cascade delete)
- `user_id` (uuid, not null) - **Belongs to `users`** (cascade delete)
- `invoice_number` (text, not null, unique)
- `amount` (numeric, not null)
- `issued_at` (timestamp with time zone, default now())
- `pdf_url` (text)
- `created_at` / `updated_at` (timestamp with time zone)

### `itineraries`
- `id` (uuid, primary key)
- `user_id` (uuid) - **Belongs to `users`** (set null on delete)
- `name` / `prompt` / `destination` (text)
- `start_date` / `end_date` (date)
- `travelers` (integer)
- `days` (jsonb, not null)
- `estimated_budget` / `notes` / `cover_image` (text)
- `is_public` (boolean, default false)
- `ai_recommendations` (text array)
- `created_at` / `updated_at` (timestamp with time zone)

### `reviews`
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`**
- `hotel_id` (uuid) - **Belongs to `hotels`**
- `tour_id` (uuid) - **Belongs to `tours`**
- `rating` (integer, not null)
- `comment` (text, not null)
- *Constraint: Must reference either a hotel OR a tour, not both.*
- `created_at` / `updated_at` (timestamp with time zone)

### `notifications`
- `id` (uuid, primary key)
- `user_id` (uuid, not null) - **Belongs to `users`**
- `type` / `title` / `message` (text, not null)
- `read` (boolean, default false)
- `created_at` / `updated_at` (timestamp with time zone)

### `contact_requests`
- `id` (uuid, primary key)
- `name` / `email` / `organization_type` / `message` (text, not null)
- `created_at` / `updated_at` (timestamp with time zone)

## Relationship Diagram (ASCII)

```
[users] 1 -- * [businesses]
[users] 1 -- * [itineraries]
[users] 1 -- * [notifications]

[businesses] 1 -- * [hotels]
[businesses] 1 -- * [tours]
[businesses] 1 -- * [flights]
[businesses] 1 -- * [buses]
[businesses] 1 -- * [auto_vehicles]

[destinations] 1 -- * [hotels]
[destinations] 1 -- * [tours]

(Bookings link users, businesses, and specific services)
[users] 1 -- * [bookings] * -- 1 [hotels]
[users] 1 -- * [guide_bookings] * -- 1 [tours]
[users] 1 -- * [flight_bookings] * -- 1 [flights]
[users] 1 -- * [bus_bookings] * -- 1 [buses]
[users] 1 -- * [auto_bookings] * -- 1 [auto_vehicles]

[users] 1 -- * [payments] 1 -- 1 [invoices]
[users] 1 -- * [reviews]
```
