# Feature Status Map

This document outlines what features are fully built and functioning vs. what features are currently stubbed, mocked, or missing based on the current codebase.

## Built & Working Features

### 1. Authentication & Users
- **User Registration & Login**: Full JWT flow (access & refresh tokens).
- **Session Persistence**: React context (`AuthContext`) manages state, protected routes enforce login.
- **Roles**: Traveler, Business, and Admin roles dictate UI and API access.

### 2. Core Travel Inventory (Browsing & Booking)
- **Destinations**: View list and detail pages.
- **Hotels**: View list, filter, search, view details, and create bookings.
- **Tours/Experiences**: View list, filter, view details, and create bookings.
- **Flights**: View flight schedules and book passenger tickets.
- **Buses**: View bus routes and book seats.
- **Auto/Transport**: View local transport options.

### 3. Business & User Dashboards
- **Traveler Dashboard**: Users can view their unified bookings (hotels, flights, buses, autos, experiences) and see upcoming trips.
- **Business Dashboard**: Vendors can manage their inventory (create hotels, flights, etc. depending on their business type) and view bookings made against their inventory.

### 4. AI & Advanced Tooling
- **AI Itinerary Generator**: Users can generate multi-day, day-by-day itineraries using a prompt and LLM integration, saving it to their profile.
- **Global Search**: Search across destinations, hotels, and tours from a single interface.
- **Payment Integration**: Razorpay flow is integrated for processing booking payments (`/api/payment/create-order`).

---

## Stubbed, Mocked, or Missing Features

*(Derived from current code vs. expected holistic platform requirements)*

### 1. Notifications
- **Backend**: Exists (`/api/notifications`), can fetch and mark read.
- **Frontend**: Likely missing real-time WebSocket/Server-Sent-Events (SSE) implementation for pushing live notifications to the UI. Often stubbed as a polling mechanism or just a static dropdown.

### 2. Reviews & Ratings
- **Backend**: Schema exists, but full CRUD logic for creating/managing reviews by users who have *actually completed* a trip is minimal or missing.
- **Frontend**: UI components for leaving reviews are likely stubbed or purely display-only at the moment.

### 3. Contact Requests / Support
- **Backend**: `contactController.ts` exists but might only perform basic database inserts without sending actual emails (e.g., via SendGrid or AWS SES).
- **Frontend**: The "Contact Us" form submits to the DB but lacks a sophisticated admin ticketing interface to respond.

### 4. Granular Search Filtering
- While basic search exists, complex geospatial filtering (e.g., "Hotels within 5km of coordinates X,Y") or advanced availability checks (calendar blockers) are not fully implemented. Available seats/rooms are often treated simplistically rather than via complex date-range overlaps.
