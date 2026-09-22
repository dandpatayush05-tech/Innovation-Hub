import { Request, Response } from 'express';
import { executeTransportSearch } from '../services/transportSearchService';
import { ApiError, NotFoundError } from '../utils/ApiError';
import { supabase } from '../config/supabase';
import { sendList, sendSingle } from '../utils/response';

// Common flight schedules for Indian Hubs
const MOCK_FLIGHTS = [
  {
    id: 'fl-del-bom-6e101',
    airline: 'IndiGo',
    flight_number: '6E-101',
    departure_airport: 'DEL',
    arrival_airport: 'BOM',
    departure_time: '06:00 AM',
    arrival_time: '08:15 AM',
    duration: '2h 15m',
    price: 4500,
    cabin_class: 'economy',
    stops: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fl-del-bom-ai804',
    airline: 'Air India',
    flight_number: 'AI-804',
    departure_airport: 'DEL',
    arrival_airport: 'BOM',
    departure_time: '09:30 AM',
    arrival_time: '11:50 AM',
    duration: '2h 20m',
    price: 5200,
    cabin_class: 'economy',
    stops: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fl-bom-goa-uk811',
    airline: 'Vistara',
    flight_number: 'UK-811',
    departure_airport: 'BOM',
    arrival_airport: 'GOI',
    departure_time: '11:15 AM',
    arrival_time: '12:30 PM',
    duration: '1h 15m',
    price: 3400,
    cabin_class: 'economy',
    stops: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fl-del-blr-6e423',
    airline: 'IndiGo',
    flight_number: '6E-423',
    departure_airport: 'DEL',
    arrival_airport: 'BLR',
    departure_time: '02:00 PM',
    arrival_time: '04:50 PM',
    duration: '2h 50m',
    price: 4900,
    cabin_class: 'economy',
    stops: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_BUSES = [
  {
    id: 'bus-blr-goa-vrl01',
    operator_name: 'VRL Travels',
    bus_type: 'Multi-Axle Volvo AC Sleeper',
    origin: 'Bangalore',
    destination: 'Goa',
    departure_time: '09:00 PM',
    arrival_time: '08:00 AM',
    duration: '11h 00m',
    price: 1350,
    available_seats: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bus-del-manali-zing02',
    operator_name: 'Zingbus Electric',
    bus_type: 'AC Semi-Sleeper Luxury',
    origin: 'Delhi',
    destination: 'Manali',
    departure_time: '07:30 PM',
    arrival_time: '09:00 AM',
    duration: '13h 30m',
    price: 1650,
    available_seats: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bus-mum-pune-neeta03',
    operator_name: 'Neeta Tours',
    bus_type: 'Mercedes Benz Multi-Axle',
    origin: 'Mumbai',
    destination: 'Pune',
    departure_time: '07:00 AM',
    arrival_time: '10:30 AM',
    duration: '3h 30m',
    price: 450,
    available_seats: 26,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const getFlights = async (req: Request, res: Response) => {
  const origin = (req.query.origin as string)?.toUpperCase();
  const destination = (req.query.destination as string)?.toUpperCase();

  const { data: dbFlights } = await supabase.from('flights').select('*');
  const allFlights = (dbFlights && dbFlights.length > 0) ? dbFlights : MOCK_FLIGHTS;

  let filtered = allFlights;
  if (origin) {
    filtered = filtered.filter(f => f.departure_airport?.toUpperCase().includes(origin) || f.origin?.toUpperCase().includes(origin));
  }
  if (destination) {
    filtered = filtered.filter(f => f.arrival_airport?.toUpperCase().includes(destination) || f.destination?.toUpperCase().includes(destination));
  }

  return sendList(res, filtered.length > 0 ? filtered : allFlights);
};

export const getFlightById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data: flight } = await supabase.from('flights').select('*').eq('id', id).single();
  
  if (flight) {
    return sendSingle(res, flight);
  }

  const mock = MOCK_FLIGHTS.find(f => f.id === id);
  if (mock) {
    return sendSingle(res, mock);
  }

  throw new NotFoundError('Flight not found');
};

export const searchFlightsHandler = async (req: Request, res: Response) => {
  const origin = (req.query.origin as string || '').trim().toLowerCase();
  const destination = (req.query.destination as string || '').trim().toLowerCase();

  const { data: dbFlights } = await supabase.from('flights').select('*');
  let allFlights = (dbFlights && dbFlights.length > 0) ? dbFlights : MOCK_FLIGHTS;

  if (origin) {
    allFlights = allFlights.filter((f: any) => 
      f.from?.toLowerCase().includes(origin) || 
      f.origin?.toLowerCase().includes(origin) ||
      f.departure_airport?.toLowerCase().includes(origin)
    );
  }
  if (destination) {
    allFlights = allFlights.filter((f: any) => 
      f.to?.toLowerCase().includes(destination) || 
      f.destination?.toLowerCase().includes(destination) ||
      f.arrival_airport?.toLowerCase().includes(destination)
    );
  }

  return res.json({
    outbound: allFlights,
    return: null,
    data: allFlights
  });
};

export const getBuses = async (req: Request, res: Response) => {
  const { data: dbBuses } = await supabase.from('buses').select('*');
  const allBuses = (dbBuses && dbBuses.length > 0) ? dbBuses : MOCK_BUSES;

  return sendList(res, allBuses);
};

export const getBusById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data: bus } = await supabase.from('buses').select('*').eq('id', id).single();
  
  if (bus) {
    return sendSingle(res, bus);
  }

  const mock = MOCK_BUSES.find(b => b.id === id);
  if (mock) {
    return sendSingle(res, mock);
  }

  throw new NotFoundError('Bus not found');
};

export const estimateTransport = async (req: Request, res: Response) => {
  const { pickup, drop, type } = req.body;
  
  // Calculate estimated distance based on strings or mock route
  const distance_km = 18.5;
  const rates: Record<string, number> = {
    auto: 16,
    sedan: 22,
    suv: 30,
    bike: 10
  };

  const rate = rates[type] || 20;
  const estimated_price = Math.round(50 + (distance_km * rate));

  return sendSingle(res, {
    pickup: pickup || 'Pickup Point',
    drop: drop || 'Drop Point',
    vehicle_type: type || 'sedan',
    distance_km,
    estimated_price,
    eta_minutes: 25
  });
};

export const searchTransport = async (req: Request, res: Response) => {
  try {
    const { from, to, date, passengers, sortBy } = req.body;
    
    const result = await executeTransportSearch(
      from,
      to,
      date,
      passengers,
      sortBy
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Transport Search Error:', error);
    throw new ApiError(500, 'Failed to execute transport search', 'INTERNAL_ERROR', error.message);
  }
};
