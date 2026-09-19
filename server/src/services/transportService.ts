import { listFlights } from './flightService';
import { listBuses } from './busService';
import { listAutos } from './autoService';

export const getTransportToDestination = async (destinationName: string) => {
  const [flightsRes, busesRes, autosRes] = await Promise.all([
    listFlights({ arrivalAirport: destinationName, limit: 10 }),
    listBuses({ destination: destinationName, limit: 10 }),
    listAutos({ city: destinationName, limit: 10 })
  ]);

  return {
    flights: flightsRes.data || [],
    buses: busesRes.data || [],
    autos: autosRes.data || []
  };
};
