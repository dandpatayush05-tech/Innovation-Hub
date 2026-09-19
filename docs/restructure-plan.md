# Server Restructure Plan

## Middleware
- **`server/src/middleware/authGuard.ts`** -> Split into `server/src/middleware/authGuard.ts` and `server/src/middleware/requireRole.ts`
  - *Extraction*: The `requireRole`, `isOwnerOrAdmin`, and `requireOwnershipOrAdmin` functions currently living in `authGuard.ts` should be moved into the new `requireRole.ts` middleware.

## Routes
- **`server/src/routes/authRoutes.ts`** -> `server/src/routes/authRoutes.ts`
- **`server/src/routes/itineraryRoutes.ts`** -> `server/src/routes/itineraryRoutes.ts`
- **`server/src/routes/paymentRoutes.ts`** -> `server/src/routes/paymentRoutes.ts`
- **`server/src/routes/bookingRoutes.ts`** -> `server/src/routes/bookingRoutes.ts` (will absorb booking endpoints from travelRoutes)
- **`server/src/routes/chatRoutes.ts`** -> `server/src/routes/tripRoutes.ts`
- **`server/src/routes/notificationRoutes.ts`** -> `server/src/routes/tripRoutes.ts`
- **`server/src/routes/travelRoutes.ts`** -> SPLIT INTO:
  - `server/src/routes/travelRoutes.ts` (Destinations, Hotels, Tours, Businesses, Search)
  - `server/src/routes/bookingRoutes.ts` (Hotel Bookings, Guide Bookings)
  - `server/src/routes/transportRoutes.ts` (Flights, Buses, Auto Transport)
  - `server/src/routes/tripRoutes.ts` (Reviews, Contact Requests)
  - `server/src/routes/paymentRoutes.ts` (Razorpay order creation & verification)

## Controllers
- **`server/src/controllers/authController.ts`** -> `server/src/controllers/authController.ts`
- **`server/src/controllers/destinationController.ts`** -> `server/src/controllers/destinationController.ts`
- **`server/src/controllers/hotelController.ts`** -> `server/src/controllers/hotelController.ts`
- **`server/src/controllers/tourController.ts`** -> `server/src/controllers/tourController.ts`
- **`server/src/controllers/bookingController.ts`** -> `server/src/controllers/bookingController.ts`
- **`server/src/controllers/itineraryController.ts`** -> `server/src/controllers/itineraryController.ts`
- **`server/src/controllers/paymentController.ts`** -> `server/src/controllers/paymentController.ts`
  - *Extraction*: Razorpay implementation logic currently inline should be extracted into `server/src/services/payments/`
- **`server/src/controllers/flightController.ts`** -> `server/src/controllers/transportController.ts`
  - *Extraction*: Logic should be extracted into `server/src/services/flights/`
- **`server/src/controllers/busController.ts`** -> `server/src/controllers/transportController.ts`
  - *Extraction*: Logic should be extracted into `server/src/services/buses/`
- **`server/src/controllers/autoController.ts`** -> `server/src/controllers/transportController.ts`
  - *Extraction*: Logic should be extracted into `server/src/services/transport/`
- **`server/src/controllers/businessController.ts`** -> `server/src/controllers/placeController.ts`
- **`server/src/controllers/reviewController.ts`** -> `server/src/controllers/placeController.ts`
- **`server/src/controllers/chatController.ts`** -> `server/src/controllers/tripController.ts`
- **`server/src/controllers/contactController.ts`** -> `server/src/controllers/tripController.ts`
- **`server/src/controllers/notificationController.ts`** -> `server/src/controllers/tripController.ts`
  - *Extraction*: SSE streaming and notification creation logic should be extracted into `server/src/services/notifications/`
- **`server/src/controllers/searchController.ts`** -> merge into `server/src/controllers/destinationController.ts` (or `placeController.ts`)
  - *Extraction*: Distance calculations or mapping logic should be extracted to `server/src/services/maps/`

## Validators
- **`server/src/validators/authValidator.ts`** -> `server/src/validators/authValidator.ts`
- **`server/src/validators/itineraryValidator.ts`** -> `server/src/validators/travelValidator.ts`
- **`server/src/validators/chatValidator.ts`** -> `server/src/validators/travelValidator.ts`
- **`server/src/validators/travelValidator.ts`** -> SPLIT INTO:
  - `server/src/validators/travelValidator.ts` (Businesses, Hotels, Tours, Destinations, Reviews, Contact)
  - `server/src/validators/bookingValidator.ts` (Hotel Bookings, Guide Bookings, Booking Status Updates)
  - `server/src/validators/transportValidator.ts` (Flight Bookings, Bus Bookings, Auto Bookings)
