# OpenStreetMap & Leaflet Integration Architecture

This document defines the architecture and implementation strategy for integrating maps and place discovery into the Innovation Hub Tour application using 100% free, open-source mapping solutions.

## 1. Required APIs & Libraries

To avoid the high costs and API key requirements of Google Maps, we rely on the following open-source stack:

- **Frontend Visual Map (Leaflet):**
  - We use `react-leaflet` combined with OpenStreetMap's default public tile servers to render visual, interactive maps.
  - This requires **NO API KEY** and loads directly in the browser.

- **Backend Geocoding & Places Discovery (Nominatim & Overpass):**
  - **Nominatim API:** A free geocoding service by OpenStreetMap used to convert physical addresses or place names into exact latitude/longitude coordinates (and vice versa). 
    - *Requirement:* All requests to Nominatim MUST include a custom `User-Agent` identifying our application, as per their strict usage policy.
  - **Overpass API:** Used to query OpenStreetMap data for POIs (restaurants, hospitals, etc.) around a specific radius.

## 2. Security & Rate Limiting

While we do not have an API key to protect, we must strictly respect the rate limits of public OSM servers:
- **Nominatim:** Limited to 1 request per second. We must implement a backend throttle/queue for any bulk geocoding.
- **Overpass:** Subject to fair-use policies.

All complex queries (like finding 10 nearby restaurants) should be proxied through our Express backend, which caches the results to avoid spamming the free servers.

## 3. Directory Structure (`server/src/services/maps/`)

The mapping logic is isolated within the backend:

- `nominatimClient.ts`: Raw wrapper for Nominatim geocoding, handling the `User-Agent` injection and rate-limiting.
- `overpassClient.ts`: Raw wrapper for the Overpass API for POI discovery.
- `nearbyPlacesService.ts`: Core business logic orchestrator. Given a `lat`/`lng` and a `category`, it queries local DB data first, and pads with Overpass API data if necessary.
- `cache.ts`: TTL-based in-memory caching to reduce external hits to free OSM servers.

## 4. Frontend Implementation

The `DestinationMap` component (and any future map components) utilizes `react-leaflet`:

```tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Required globally

// Render OSM tiles
<TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

## 5. Normalized Response Shape

When fetching nearby places from our backend, the data (whether from our local DB or Overpass) will be normalized to:

```typescript
interface NormalizedPlace {
  id: string; // UUID for local, OSM Node ID for OpenStreetMap
  name: string;
  category: string;
  distance_m: number; 
  distance_text: string; // e.g., "1.2 km"
  source: 'local' | 'osm';
  lat: number;
  lng: number;
}
```

## 6. Deduplication Strategy

Our local database (`hotels`, `tours`, `places`) is the absolute source of truth. 
1. **Local First:** Always query local DB first.
2. **Padding:** Use Overpass API to fill any remaining slots to reach the desired UI count.
3. **Deduplication:** Filter out OSM results whose `name` string matches a local result's name AND whose `lat`/`lng` is within a 100m radius.
