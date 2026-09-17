# Innovation Hub Tour API Documentation
**Base URL**: `/api`

## Authentication (`/auth`)
Handled by custom JWT system (`access_token`, `refresh_token`).
- `POST /auth/register`: Register a new user. Returns `access_token` and sets `refresh_token` httpOnly cookie.
- `POST /auth/login`: Authenticate existing user. Returns `access_token` and sets `refresh_token` httpOnly cookie.
- `GET /auth/me`: Get current authenticated user details. (Requires Auth)
- `POST /auth/refresh`: Refresh expired access token using the httpOnly cookie.
- `POST /auth/logout`: Clear refresh token cookie.

## Destinations (`/destinations`)
- `GET /destinations`: List destinations. Supports pagination (`page`, `limit`), `search` (ilike name/desc), `country`, `tags`.
- `GET /destinations/:id`: Get single destination.
- `POST /destinations`: Create destination. (Requires Auth, Role: `business` or `admin`)
- `PATCH /destinations/:id`: Update destination. (Requires Auth, Role: `business` or `admin`)
- `DELETE /destinations/:id`: Delete destination. (Requires Auth, Role: `business` or `admin`)

## Businesses (`/businesses`)
- `GET /businesses`: List verified businesses. Supports pagination, `search`.
- `GET /businesses/:id`: Get single business.
- `POST /businesses/register`: Register a business for a user. (Requires Auth)
- `PATCH /businesses/:id`: Update business details. (Requires Auth, Ownership or Admin)
- `DELETE /businesses/:id`: Delete business. (Requires Auth, Ownership or Admin)

## Hotels (`/hotels`)
- `GET /hotels`: List hotels. Supports filtering (`minPrice`, `maxPrice`, `minRating`, `destinationId`), pagination.
- `GET /hotels/:id`: Get single hotel.
- `POST /hotels`: Create hotel. (Requires Auth, Role: `business`)
- `PATCH /hotels/:id`: Update hotel. (Requires Auth, Ownership or Admin)
- `DELETE /hotels/:id`: Delete hotel. (Requires Auth, Ownership or Admin)

## Tours & Experiences (`/tours`)
- `GET /tours`: List tours. Supports filtering (`category`, `minPrice`, `maxPrice`), pagination.
- `GET /tours/:id`: Get single tour.
- `POST /tours`: Create tour. (Requires Auth, Role: `business`)
- `PATCH /tours/:id`: Update tour. (Requires Auth, Ownership or Admin)
- `DELETE /tours/:id`: Delete tour. (Requires Auth, Ownership or Admin)

## Bookings (`/bookings` & `/guide-bookings`)
- `POST /bookings`: Create hotel booking. (Requires Auth)
- `POST /guide-bookings`: Create tour booking. (Requires Auth)
- `GET /bookings/user/:userId`: Get user's hotel bookings. (Requires Auth, Ownership)
- `GET /guide-bookings/user/:userId`: Get user's tour bookings. (Requires Auth, Ownership)
- `GET /bookings/business/:businessId`: Get business's hotel bookings. (Requires Auth, Ownership or Admin)
- `GET /guide-bookings/business/:businessId`: Get business's tour bookings. (Requires Auth, Ownership or Admin)
- `PATCH /bookings/:id/status`: Update hotel booking status. (Requires Auth, Role: `business` or Admin)
- `PATCH /guide-bookings/:id/status`: Update tour booking status. (Requires Auth, Role: `business` or Admin)
- `GET /bookings`: Admin catch-all for all bookings. (Requires Auth, Role: `admin`)
- `GET /bookings/:id`: Get single booking. (Requires Auth, Ownership)
- `DELETE /bookings/:id`: Delete/cancel booking. (Requires Auth, Ownership)

## AI Itineraries (`/itineraries`)
- `POST /itineraries/generate`: Generate an AI itinerary via prompt. (Requires Auth)
- `GET /itineraries/user/:userId`: List user's saved itineraries. (Requires Auth, Ownership)
- `GET /itineraries/:id`: Get single itinerary. (Requires Auth, Ownership)

## Reviews (`/reviews`)
- `GET /reviews`: List reviews. Filters by `hotel_id` or `tour_id`.
- `POST /reviews`: Create review. (Requires Auth, 1 per resource)
- `PATCH /reviews/:id`: Update review. (Requires Auth, Ownership)
- `DELETE /reviews/:id`: Delete review. (Requires Auth, Ownership or Admin)

## Real-Time Chat (`/conversations`)
- `GET /conversations`: List conversations for the active user/business. (Requires Auth)
- `GET /conversations/:id/messages`: List messages in a conversation. (Requires Auth, Ownership)
- `POST /conversations/:id/messages`: Send a message. (Requires Auth, Ownership)

## Payments (`/payments`)
- `POST /payments/create-order`: Create Razorpay order ID. (Requires Auth)
- `POST /payments/verify`: Verify Razorpay signature and capture payment. (Requires Auth)

## Global Search (`/search`)
- `GET /search`: Search across destinations, verified businesses, hotels, and tours. Supports `q` and optional `type`.

## System & Contact
- `GET /health`: Basic health and DB connectivity check.
- `POST /contact`: Submit contact form.
- `GET /contact`: View contact requests. (Requires Auth, Role: `admin`)
