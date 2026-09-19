# Flight Provider Architecture

This document defines the architecture for integrating flight search, pricing, and booking capabilities into the platform.

## The `FlightProvider` Interface

To ensure the system remains decoupled from any specific third-party flight API (such as Amadeus, Skyscanner API, Sabre, etc.), we have defined a generic `FlightProvider` interface. 

The interface is located in [`server/src/services/flights/types.ts`](../server/src/services/flights/types.ts).

```typescript
interface FlightProvider {
  searchFlights(params: FlightSearchParams): Promise<FlightOption[]>;
  getSchedule(flightNumber: string, date: string): Promise<FlightSchedule>;
  getPrice(flightId: string): Promise<PriceInfo>;
  getBookingInfo(flightId: string): Promise<BookingInfo>;
}
```

### Why use this interface?

This abstraction allows us to swap in a real provider later **without touching controllers, routes, or the frontend**. 

The core flow is as follows:
1. The user requests flight options from the frontend.
2. The controller calls the unified flight service.
3. The flight service delegates the request to the injected or active `FlightProvider` implementation.
4. The implementation translates our internal types (like `FlightSearchParams`) into the specific payload required by the 3rd party API, makes the HTTP request, and normalizes the API's response back into our internal types (like `FlightOption[]`).

Because the controllers and frontend only ever see `FlightOption` and `PriceInfo`, we can easily switch from a mock implementation to Amadeus or any other provider by simply writing a new class that implements `FlightProvider` and instantiating it.

### Future Implementations

A real provider has not been selected yet. In future development phases, we will select an appropriate API provider and build an implementation of the `FlightProvider` interface tailored to that API.
