# Schema Map & Database Consolidation

## Executive Summary
This document serves as the single source of truth for the Yatra Setu database schema. 
**Primary Store Decision**: **PostgreSQL (via Supabase)** is the exclusive database for the entire Yatra Setu ecosystem. 
The MongoDB/Mongoose references found in legacy documentation and `README.md` files are deprecated artifacts. All tables, collections, and relational data structures have been fully consolidated into PostgreSQL to ensure ACID compliance, true foreign key constraints, and transactional safety across bookings and payments.

## Authoritative Table Map (PostgreSQL)

### Core Entities
- **`users`**: Primary authentication and user profile table.
  - *FKs*: None
- **`businesses`**: Business profiles for operators (hotels, agencies, guides, etc.).
  - *FKs*: `user_id` -> `users(id)`
- **`destinations`**: Geospatial locations and intelligence data.
  - *FKs*: None

### Inventory & Providers
- **`hotels`**: Hotel inventory.
  - *FKs*: `business_id` -> `businesses(id)`, `destination_id` -> `destinations(id)`
- **`tours`**: Tour and experience inventory.
  - *FKs*: `business_id` -> `businesses(id)`, `destination_id` -> `destinations(id)`
- **`flights`**: Flight schedules and pricing.
  - *FKs*: `business_id` -> `businesses(id)`
- **`buses`**: Bus routes and pricing.
  - *FKs*: `business_id` -> `businesses(id)`
- **`auto_vehicles`**: Local transport fleet.
  - *FKs*: `business_id` -> `businesses(id)`
- **`transport_modes`**: Dynamic fare calculation rules for the transport search engine.
  - *FKs*: None

### Itineraries & Trips (User Organized Data)
- **`trips`**: User-curated trips grouping multiple bookings together.
  - *FKs*: `user_id` -> `users(id)`
- **`trip_photos`**: User-uploaded photos associated with a trip.
  - *FKs*: `trip_id` -> `trips(id)`
- **`itineraries`**: AI-generated travel itineraries (structured JSON output).
  - *FKs*: `user_id` -> `users(id)`

### Bookings
*Note: All booking tables include a `trip_id` FK allowing them to be optionally bundled into a `trips` entity.*
- **`bookings`**: Hotel bookings.
  - *FKs*: `user_id` -> `users(id)`, `business_id` -> `businesses(id)`, `hotel_id` -> `hotels(id)`, `trip_id` -> `trips(id)`
- **`guide_bookings`**: Tour and experience bookings.
  - *FKs*: `user_id` -> `users(id)`, `business_id` -> `businesses(id)`, `tour_id` -> `tours(id)`, `trip_id` -> `trips(id)`
- **`flight_bookings`**: Flight reservations.
  - *FKs*: `user_id` -> `users(id)`, `business_id` -> `businesses(id)`, `flight_id` -> `flights(id)`, `trip_id` -> `trips(id)`
- **`bus_bookings`**: Bus reservations.
  - *FKs*: `user_id` -> `users(id)`, `business_id` -> `businesses(id)`, `bus_id` -> `buses(id)`, `trip_id` -> `trips(id)`
- **`auto_bookings`**: Local transport bookings.
  - *FKs*: `user_id` -> `users(id)`, `business_id` -> `businesses(id)`, `auto_id` -> `auto_vehicles(id)`, `trip_id` -> `trips(id)`

### Payments & Financials
- **`payment_groups`**: Wrapper for multi-leg or whole-trip bundled payments.
  - *FKs*: `user_id` -> `users(id)`, `trip_id` -> `trips(id)`
- **`payment_group_items`**: Individual legs/bookings within a payment group.
  - *FKs*: `payment_group_id` -> `payment_groups(id)`
  - *Note*: `booking_id` is a logical FK (unconstrained) because it polymorphic-ally references any of the booking tables based on `item_type`.
- **`discount_rules`**: Dynamic pricing rules and coupons.
  - *FKs*: None
- **`payments`**: Standard atomic payment records for individual bookings.
  - *FKs*: `user_id` -> `users(id)`
  - *Note*: `booking_id` is a logical polymorphic FK.
- **`invoices`**: Invoice records tied to payments.
  - *FKs*: `payment_id` -> `payments(id)`, `user_id` -> `users(id)`

### Communications & Social
- **`reviews`**: Ratings and reviews for hotels and tours.
  - *FKs*: `user_id` -> `users(id)`, `hotel_id` -> `hotels(id)` (optional), `tour_id` -> `tours(id)` (optional)
- **`notifications`**: System alerts and messages.
  - *FKs*: `user_id` -> `users(id)`
- **`contact_requests`**: Support/Contact messages.
  - *FKs*: None

## Cross-Boundary References (MongoDB -> PostgreSQL)
**None.** 
All data modeling natively relies on PostgreSQL foreign keys. Collections that were conceptually documented as MongoDB candidates (e.g. `itineraries` storing unstructured AI outputs, `passenger_details` storing array data) are properly implemented in PostgreSQL using robust `jsonb` columns. This prevents any silent joins or cross-database synchronization issues.

*Conclusion: The DB layer is entirely unified.*
