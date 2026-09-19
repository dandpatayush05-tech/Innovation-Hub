# Destination Discovery: Data Model & Schema Decisions

This document outlines the architectural decisions for extending the schema to support advanced destination discovery, including grouped destinations, attractions, hotels, tours, restaurants, shops, nearby places, and weather.

## 1. Unified Places Table vs. Separate Tables
**Decision**: We will reuse the `places` table and distinguish entity types using a `category` column.
**Justification**: Consolidating attractions, restaurants, and shops into a single `places` table with a `category` enum or string ('attraction', 'restaurant', 'shop') prevents table sprawl. They share almost identical structural requirements (name, description, location, lat/lng, images, ratings). This unified approach drastically simplifies querying (e.g., fetching all POIs in an area) and keeps the schema clean.

## 2. Destination Foreign Key on Places
**Decision**: Add a `destination_id` foreign key to the `places` table.
**Justification**: To easily query all attractions, restaurants, or shops belonging to a specific destination (e.g., "Things to do in Goa"), every place must explicitly link back to its parent destination, exactly like the existing `hotels` and `tours` tables do.

## 3. Best Time to Visit & Climate Summaries
**Decision**: Add `best_time_to_visit` (text) and `climate_notes` (text) columns directly to the `destinations` table.
**Justification**: A simple text approach is highly flexible and sufficient for most travel discovery interfaces. Creating a separate structured table (e.g., month-by-month weather averages) adds unnecessary join complexity and data-entry overhead. Text columns allow for quick, human-readable summaries to be displayed directly on the destination hero section.

## 4. "Nearby Places" Implementation Strategy
**Decision**: Implement a Haversine formula (or PostGIS extension) query against lat/lng coordinates across the `places`, `hotels`, and `destinations` tables.
**Justification**: "Nearby" fundamentally implies geospatial proximity rather than administrative grouping. By relying on `latitude` and `longitude`, we can dynamically serve "places of any category within X km of the current location." This provides a much richer user experience than simply returning everything in the same destination.

## 5. Country Grouping
**Decision**: No schema changes required.
**Justification**: The `destinations` table already contains a `country (text, not null)` column. We can support UI sections like "Explore India" out-of-the-box by grouping or filtering by this column on the backend.

## 6. Weather Integration
**Decision**: No schema changes required. External API integration in Stage 2.
**Justification**: Weather data is highly dynamic and real-time. It should not be stored in the primary database. Instead, the backend should expose a `services/weather` module that proxies requests to an external API (like OpenWeatherMap or WeatherAPI) and caches the results temporarily.

---

## Schema Diff (SQL Comments)

```sql
-- Upgrading the existing `places` table
-- ALTER TABLE places ADD COLUMN destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE;
-- ALTER TABLE places ADD COLUMN category TEXT NOT NULL CHECK (category IN ('attraction', 'restaurant', 'shop', 'other'));

-- Upgrading the `destinations` table
-- ALTER TABLE destinations ADD COLUMN best_time_to_visit TEXT;
-- ALTER TABLE destinations ADD COLUMN climate_notes TEXT;

-- (Optional but recommended for geospatial queries for Nearby Places)
-- CREATE INDEX idx_places_location ON places (latitude, longitude);
-- CREATE INDEX idx_hotels_location ON hotels (latitude, longitude);
```
