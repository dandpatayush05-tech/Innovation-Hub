import { flightProvider } from '../src/services/flights';

async function runTests() {
  console.log('--- Testing FlightProvider (Local) ---\n');

  try {
    // 1. Search Flights
    console.log('1. searchFlights');
    // We will look for flights from DEL to BOM (or whatever is seeded in DB)
    // Let's use a very broad date or just no date if it works, or we can fetch a sample from DB directly first
    // Since we don't know the exact seed dates, let's just query origin/destination
    // Note: Our implementation checks for departureDate. Let's pass a known date if we can, 
    // or just pass nothing for departureDate to get all flights between DEL and BOM for now 
    // (Wait, FlightSearchParams requires departureDate as a string).
    // Let's modify our test to query the DB directly first to find a valid flight to test against.
    const { supabase } = require('../src/config/supabase');
    const { data: sampleFlight } = await supabase.from('flights').select('*').limit(1).single();

    if (!sampleFlight) {
      console.log('No seeded flights found in database!');
      return;
    }

    const origin = sampleFlight.departure_airport;
    const dest = sampleFlight.arrival_airport;
    const depTime = new Date(sampleFlight.departure_time);
    const dateStr = depTime.toISOString().split('T')[0];

    const searchParams = {
      origin: origin,
      destination: dest,
      departureDate: dateStr,
      passengers: 1
    };

    console.log(`Searching flights from ${origin} to ${dest} on ${dateStr}`);
    const flights = await flightProvider.searchFlights(searchParams);
    console.log(`Found ${flights.length} flights`);
    if (flights.length > 0) {
      console.log(flights[0]);
    }

    const flightId = sampleFlight.id;
    const flightNumber = sampleFlight.flight_number;

    // 2. getSchedule
    console.log('\n2. getSchedule');
    console.log(`Getting schedule for ${flightNumber} on ${dateStr}`);
    const schedule = await flightProvider.getSchedule(flightNumber, dateStr);
    console.log(schedule);

    // 3. getPrice
    console.log('\n3. getPrice');
    console.log(`Getting price for flight ID: ${flightId}`);
    const price = await flightProvider.getPrice(flightId);
    console.log(price);

    // 4. getBookingInfo
    console.log('\n4. getBookingInfo');
    console.log(`Getting booking info for flight ID: ${flightId}`);
    const bookingInfo = await flightProvider.getBookingInfo(flightId);
    console.log(bookingInfo);

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTests();
