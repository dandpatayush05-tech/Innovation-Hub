# API Documentation

## Standard Error Response Format
The API uses a consistent error response shape across most controllers.
```json
{
  "error": {
    "message": "Human readable error message",
    "code": "INTERNAL_ERROR | VALIDATION_ERROR | UNAUTHORIZED | etc",
    "details": "Optional detailed string from the database or validation library"
  }
}
```
*Note: Any Zod validation errors from middleware may wrap their issues differently before hitting the controller, but business-logic errors follow the shape above.*

---

## Auth (`/api/auth`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| POST | `/register` | No | - | `{ name, email, password, role }` | `{ message, data: user, tokens: { accessToken, refreshToken } }` |
| POST | `/login` | No | - | `{ email, password }` | `{ message, data: user, tokens: { accessToken, refreshToken } }` |
| POST | `/refresh` | No (Cookie) | - | - | `{ accessToken }` |
| POST | `/logout` | Yes | Any | - | `204 No Content` |
| GET | `/me` | Yes | Any | - | `{ data: user }` |
| PATCH | `/me` | Yes | Any | `{ name?, password? }` | `{ data: user }` |

## Destinations (`/api/travel/destinations`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| GET | `/` | No | - | - | `{ data: destinations[], pagination: {...} }` |
| GET | `/:id` | No | - | - | `{ data: destination }` |
| POST | `/` | Yes | Business/Admin | `{ name, country, description, imageUrl... }` | `{ message, data: destination }` |
| PATCH | `/:id` | Yes | Business/Admin | `{ name?, country?... }` | `{ data: destination }` |
| DELETE| `/:id` | Yes | Business/Admin | - | `204 No Content` |

## Businesses (`/api/travel/businesses`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| GET | `/` | No | - | - | `{ data: businesses[] }` |
| GET | `/:id` | No | - | - | `{ data: business }` |
| POST | `/register`| Yes | Any | `{ businessName, businessType, contactEmail...}`| `{ message, data: business }` |
| PATCH | `/:id` | Yes | Business/Admin | `{ businessName?... }` | `{ data: business }` |
| DELETE| `/:id` | Yes | Business/Admin | - | `204 No Content` |

## Hotels (`/api/travel/hotels`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| GET | `/` | No | - | - | `{ data: hotels[], pagination: {...} }` |
| GET | `/:id` | No | - | - | `{ data: hotel }` |
| POST | `/` | Yes | Business | `{ name, destinationId, pricePerNight... }`| `{ message, data: hotel }` |
| PATCH | `/:id` | Yes | Business/Admin | `{ name?, pricePerNight?... }` | `{ data: hotel }` |
| DELETE| `/:id` | Yes | Business/Admin | - | `204 No Content` |

## Tours / Experiences (`/api/travel/tours`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| GET | `/` | No | - | - | `{ data: tours[], pagination: {...} }` |
| GET | `/:id` | No | - | - | `{ data: tour }` |
| POST | `/` | Yes | Business | `{ name, destinationId, price... }` | `{ message, data: tour }` |
| PATCH | `/:id` | Yes | Business/Admin | `{ name?, price?... }` | `{ data: tour }` |
| DELETE| `/:id` | Yes | Business/Admin | - | `204 No Content` |

## General Bookings (`/api/travel/bookings`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| GET | `/` | Yes | Admin | - | `{ data: unifiedBookings[] }` |
| GET | `/user/:userId`| Yes | Owner/Admin | - | `{ data: unifiedBookings[] }` |
| POST | `/` | Yes | Any | `{ hotelId, checkIn, checkOut, guests }` | `{ message, data: booking }` |
| POST | `/:id/cancel`| Yes | Owner/Admin | - | `{ message, data: booking }` |

## Flight Bookings (`/api/travel/bookings/flights`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| POST | `/` | Yes | Any | `{ flightId, passengers, passengerDetails }`| `{ message, data: flightBooking }` |

## Itineraries (`/api/itineraries`)
| Method | Path | Auth Required | Role | Request Body | Response Shape |
|---|---|---|---|---|---|
| POST | `/generate`| Optional | - | `{ destination, days, budget, travelers, prompt }`| `{ data: { itinerary } }` (AI generated) |
| POST | `/` | Yes | Any | `{ name, prompt, destination, days... }` | `{ message, data: itinerary }` |
| GET | `/user/:userId`| Yes | Owner/Admin | - | `{ data: itineraries[] }` |
| GET | `/:id` | Optional | - | - | `{ data: itinerary }` |
| PATCH | `/:id` | Yes | Owner/Admin | `{ name?, isPublic?... }` | `{ data: itinerary }` |
| DELETE| `/:id` | Yes | Owner/Admin | - | `204 No Content` |
| POST | `/:id/duplicate`| Yes | Any | - | `{ message, data: newItinerary }` |
