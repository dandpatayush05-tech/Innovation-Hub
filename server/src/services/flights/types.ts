export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // ISO format YYYY-MM-DD
  returnDate?: string;   // ISO format YYYY-MM-DD, optional for one-way
  passengers: number;
}

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO format timestamp
  arrivalTime: string;   // ISO format timestamp
  duration: number;      // in minutes
  price: number;
  currency: string;
  seatsAvailable: number;
}

export interface FlightSchedule {
  flightNumber: string;
  date: string;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'IN_AIR' | 'LANDED';
  estimatedDepartureTime?: string;
  estimatedArrivalTime?: string;
}

export interface PriceInfo {
  flightId: string;
  basePrice: number;
  tax: number;
  fees: number;
  totalPrice: number;
  currency: string;
}

export interface BookingInfo {
  flightId: string;
  bookingReference: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  ticketingDeadline?: string;
}

export interface FlightProvider {
  searchFlights(params: FlightSearchParams): Promise<FlightOption[]>;
  getSchedule(flightNumber: string, date: string): Promise<FlightSchedule>;
  getPrice(flightId: string): Promise<PriceInfo>;
  getBookingInfo(flightId: string): Promise<BookingInfo>;
}
