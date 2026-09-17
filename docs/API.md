# Innovation Hub Tour API Documentation

## Base Information
- **Base URL**: `http://localhost:5000/api`
- **Environment**: Development
- **Content Type**: `application/json`

## Authentication Flow
The API uses a standard dual-token JWT flow:
1. **Login**: POST to `/auth/login` to receive an `accessToken` (15m expiry) and `refreshToken` (7d expiry).
2. **Authorize Requests**: Include the `accessToken` in the `Authorization` header of authenticated endpoints:
   ```
   Authorization: Bearer <your_access_token>
   ```
3. **Refresh**: When the `accessToken` expires, use the `refreshToken` to POST to `/auth/refresh` to get a new pair.

---

## 1. Authentication Endpoints

### 1.1 Login
- **Method**: `POST /auth/login`
- **Role Required**: Public
- **Request Body**:
  ```json
  {
    "email": "traveler@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "uuid",
      "email": "traveler@example.com",
      "role": "traveler",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid credentials), `422 Unprocessable Entity` (Validation failure)

### 1.2 Register
- **Method**: `POST /auth/register`
- **Role Required**: Public
- **Request Body**:
  ```json
  {
    "email": "traveler@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "traveler" // Optional. Defaults to traveler.
  }
  ```
- **Response** (201 Created): Same as Login response.
- **Errors**: `409 Conflict` (Email exists), `422 Unprocessable Entity` (Validation failure)

### 1.3 Refresh Token
- **Method**: `POST /auth/refresh`
- **Role Required**: Public
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbG..."
  }
  ```
- **Response** (200 OK): Returns new `tokens` object.
- **Errors**: `401 Unauthorized` (Invalid/Expired token)

### 1.4 Get Me
- **Method**: `GET /auth/me`
- **Role Required**: Authenticated (Any)
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK): Returns the `user` object.
- **Errors**: `401 Unauthorized`

---

## 2. Destinations

### 2.1 Get Destinations
- **Method**: `GET /destinations`
- **Role Required**: Public
- **Query Params**: `page`, `limit`, `search`, `country`, `tags`, `sortBy`, `sortOrder`
- **Response** (200 OK):
  ```json
  {
    "destinations": [
      {
        "id": "uuid",
        "name": "Paris",
        "country": "France",
        "description": "City of lights",
        "image_url": "url",
        "tags": ["culture", "romantic"]
      }
    ],
    "pagination": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
  }
  ```

### 2.2 Create / Update / Delete Destination
- **Methods**: 
  - `POST /destinations`
  - `PATCH /destinations/:id`
  - `DELETE /destinations/:id`
- **Role Required**: `admin`, `business`
- **Request Body (POST/PATCH)**: Matches the `Destination` object.
- **Errors**: `403 Forbidden`, `422 Unprocessable Entity`

---

## 3. Businesses

### 3.1 Get Businesses
- **Method**: `GET /businesses`
- **Role Required**: Public
- **Query Params**: `user_id`, `page`, `limit`, `search`, `business_type`
- **Response** (200 OK): Array of Business objects.

### 3.2 Update / Delete Business
- **Methods**: 
  - `PATCH /businesses/:id`
  - `DELETE /businesses/:id`
- **Role Required**: `admin`, `business` (Must own the business)
- **Errors**: `403 Forbidden` (Ownership check failed)

---

## 4. Hotels & Tours

### 4.1 Get Hotels
- **Method**: `GET /hotels`
- **Role Required**: Public
- **Query Params**: `destinationId`, `search`, `minPrice`, `maxPrice`, `minRating`
- **Response** (200 OK): Array of Hotel objects.

### 4.2 Get Tours
- **Method**: `GET /tours`
- **Role Required**: Public
- **Query Params**: `destinationId`, `search`, `category`, `minPrice`, `maxPrice`
- **Response** (200 OK): Array of Tour objects.

### 4.3 Manage Hotels & Tours
- **Methods**: `POST`, `PATCH /:id`, `DELETE /:id` across `/hotels` and `/tours`.
- **Role Required**: `admin`, `business` (Must own the associated business).
- **Errors**: `403 Forbidden` (Ownership check failed), `422 Unprocessable Entity`.

---

## 5. Bookings (Hotels & Guides)

### 5.1 Create Booking
- **Method**: `POST /bookings` (Hotels) | `POST /guide-bookings` (Tours)
- **Role Required**: Authenticated (Any)
- **Request Body (Hotels)**:
  ```json
  {
    "hotel_id": "uuid",
    "check_in_date": "2026-10-01",
    "check_out_date": "2026-10-05",
    "guests": 2,
    "rooms": 1,
    "total_price": 400
  }
  ```
- **Errors**: `409 Conflict` (Duplicate active booking detected for exact same date/resource)

### 5.2 Get User / Business Bookings
- **Methods**: 
  - `GET /bookings/user/:userId`
  - `GET /bookings/business/:businessId`
- **Role Required**: Authenticated (Must match `userId` or own `businessId`)

### 5.3 Update Booking Status
- **Method**: `PATCH /bookings/:id/status`
- **Role Required**: `admin`, `business` (Must own the associated hotel/tour)
- **Request Body**: `{ "status": "confirmed" | "cancelled" }`

---

## 6. Reviews

### 6.1 Get Reviews
- **Method**: `GET /reviews`
- **Query Params**: `hotel_id` OR `tour_id`
- **Response** (200 OK): Array of review objects with populated `user` (id, name).

### 6.2 Create / Update / Delete Review
- **Methods**: 
  - `POST /reviews`
  - `PATCH /reviews/:id`
  - `DELETE /reviews/:id`
- **Role Required**: Authenticated (Must own the review for PATCH/DELETE)
- **Request Body (POST)**:
  ```json
  {
    "hotel_id": "uuid", // XOR tour_id
    "rating": 5,
    "comment": "Amazing experience!"
  }
  ```
- **Errors**: `409 Conflict` (User already reviewed this resource), `403 Forbidden` (Not the author).

---

## 7. AI Itineraries

### 7.1 Generate Itinerary
- **Method**: `POST /itineraries/generate`
- **Role Required**: Optional Auth (Saved to DB with `user_id` if token provided)
- **Rate Limit**: 5 per hour per IP.
- **Request Body**: `{ "prompt": "3 days in Paris..." }`
- **Response** (201 Created):
  ```json
  {
    "message": "Itinerary generated successfully",
    "itinerary": {
      "destination": "Paris",
      "estimated_budget": "$1500",
      "ai_recommendations": ["Eat croissants"],
      "days": [{ "day": 1, "title": "Arrival", "activities": [] }]
    }
  }
  ```

### 7.2 Get Past Itineraries
- **Methods**: 
  - `GET /itineraries/user/:userId` (Must be the user or admin)
  - `GET /itineraries/:id` (Must be the creator or admin)
- **Errors**: `403 Forbidden`
