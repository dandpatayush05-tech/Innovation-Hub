export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TransportSearchParams {
  from: Coordinate;
  to: Coordinate;
  distanceKm: number;
  durationMin: number;
  date: string; // YYYY-MM-DD
  passengers: number;
}

export interface TransportOption {
  id: string;
  mode: 'flight' | 'bus' | 'auto';
  fare: number;
  comfortScore: number;
  etaMin: number;
  provider: string; // e.g. 'local-test', 'amadeus', 'osrm'
  
  // Specific details
  providerDetails: {
    name: string; // Airline, Bus Operator, or Vehicle type
    identifier: string; // Flight number, Route, etc.
    departureTime: string; // ISO String
    arrivalTime: string; // ISO String
  };
}

export interface TransportProvider {
  mode: 'flight' | 'bus' | 'auto';
  getOptions(params: TransportSearchParams): Promise<TransportOption[]>;
}
