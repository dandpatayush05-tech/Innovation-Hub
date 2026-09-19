import { supabase } from '../../../config/supabase';
import { 
  FlightProvider, 
  FlightSearchParams, 
  FlightOption, 
  FlightSchedule, 
  PriceInfo, 
  BookingInfo 
} from '../types';

export class LocalFlightProvider implements FlightProvider {
  
  async searchFlights(params: FlightSearchParams): Promise<FlightOption[]> {
    let query = supabase
      .from('flights')
      .select('*')
      .eq('departure_airport', params.origin)
      .eq('arrival_airport', params.destination);
      
    // Date filtering (assuming departure_time is a timestamp)
    if (params.departureDate) {
      const startOfDay = `${params.departureDate}T00:00:00.000Z`;
      const endOfDay = `${params.departureDate}T23:59:59.999Z`;
      query = query.gte('departure_time', startOfDay).lte('departure_time', endOfDay);
    }
    
    // In a real app we'd handle returnDate here for round trips,
    // but for the demo we'll focus on the outbound flight search.

    const { data, error } = await query.order('departure_time', { ascending: true });
    
    if (error) {
      console.error('Error searching flights:', error);
      throw new Error('Failed to search flights from local database');
    }
    
    return data.map((flight: any) => {
      const departure = new Date(flight.departure_time);
      const arrival = new Date(flight.arrival_time);
      const durationMs = arrival.getTime() - departure.getTime();
      const durationMins = Math.floor(durationMs / 60000);

      return {
        id: flight.id,
        airline: flight.airline,
        flightNumber: flight.flight_number,
        origin: flight.departure_airport,
        destination: flight.arrival_airport,
        departureTime: flight.departure_time,
        arrivalTime: flight.arrival_time,
        duration: durationMins,
        price: Number(flight.price),
        currency: 'USD',
        seatsAvailable: 50 // Demo hardcoded value
      };
    });
  }

  async getSchedule(flightNumber: string, date: string): Promise<FlightSchedule> {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('flight_number', flightNumber)
      .gte('departure_time', startOfDay)
      .lte('departure_time', endOfDay)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Flight schedule not found');
      }
      console.error('Error fetching flight schedule:', error);
      throw new Error('Failed to fetch flight schedule');
    }

    return {
      flightNumber: data.flight_number,
      date: date,
      status: 'SCHEDULED', // In a real system, this would be dynamic
      estimatedDepartureTime: data.departure_time,
      estimatedArrivalTime: data.arrival_time
    };
  }

  async getPrice(flightId: string): Promise<PriceInfo> {
    // Note: In the real world, this would refresh live pricing from an external GDS.
    // Here it's a direct read from our local 'flights' table.
    const { data, error } = await supabase
      .from('flights')
      .select('price')
      .eq('id', flightId)
      .single();

    if (error) {
      throw new Error('Failed to fetch flight price');
    }

    const basePrice = Number(data.price);
    const tax = basePrice * 0.1; // 10% tax for demo
    const fees = 25; // fixed fee for demo

    return {
      flightId: flightId,
      basePrice: basePrice,
      tax: tax,
      fees: fees,
      totalPrice: basePrice + tax + fees,
      currency: 'USD'
    };
  }

  async getBookingInfo(flightId: string): Promise<BookingInfo> {
    // Note: In the real world, this would initialize a booking intent with the airline.
    // For local demo, we just verify the flight exists.
    const { data, error } = await supabase
      .from('flights')
      .select('id')
      .eq('id', flightId)
      .single();

    if (error) {
      throw new Error('Flight not found for booking');
    }

    return {
      flightId: flightId,
      bookingReference: `LOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'PENDING'
    };
  }
}
