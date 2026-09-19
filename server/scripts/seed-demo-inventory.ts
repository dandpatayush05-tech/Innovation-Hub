import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  try {
    // 1. Create a demo user for business
    console.log('Creating demo business user...');
    
    // Check if the user already exists to avoid unique constraint violation on email
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'demo_business@innovationhub.test');

    let businessUserId;
    if (existingUsers && existingUsers.length > 0) {
      businessUserId = existingUsers[0].id;
      console.log('User already exists, skipping creation.');
    } else {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          name: 'Demo Business Account',
          email: 'demo_business@innovationhub.test',
          password_hash: 'hashed_password_demo', // Fake hash
          role: 'business'
        })
        .select()
        .single();
      
      if (userError) throw userError;
      businessUserId = user.id;
    }

    // 2. Create a business profile
    console.log('Creating business profile...');
    const { data: existingBusinesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', businessUserId);

    let businessId;
    if (existingBusinesses && existingBusinesses.length > 0) {
      businessId = existingBusinesses[0].id;
      console.log('Business profile already exists.');
    } else {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: businessUserId,
          business_name: 'Innovation Hub Demo Suppliers',
          business_type: 'agency',
          description: 'A demo supplier for testing the booking platform.',
          location: 'Global',
          contact_email: 'suppliers@innovationhub.test',
          verified: true
        })
        .select()
        .single();

      if (businessError) throw businessError;
      businessId = business.id;
    }

    // 3. Create Destinations
    console.log('Creating destinations...');
    const destinations = [
      {
        name: 'Paris',
        country: 'France',
        description: 'The City of Light, capital of France, is one of the most important and attractive cities in the world.',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80',
        tags: ['romantic', 'culture', 'food'],
        latitude: 48.8566,
        longitude: 2.3522
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        description: 'Japan’s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.',
        image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80',
        tags: ['modern', 'culture', 'food'],
        latitude: 35.6762,
        longitude: 139.6503
      },
      {
        name: 'New York',
        country: 'USA',
        description: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean.',
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e2815cb?auto=format&fit=crop&q=80',
        tags: ['city', 'culture', 'shopping'],
        latitude: 40.7128,
        longitude: -74.0060
      },
      {
        name: 'Bali',
        country: 'Indonesia',
        description: 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80',
        tags: ['beach', 'nature', 'relax'],
        latitude: -8.3405,
        longitude: 115.0920
      },
      {
        name: 'Rome',
        country: 'Italy',
        description: 'Rome is the capital city of Italy. It is also the capital of the Lazio region, the centre of the Metropolitan City of Rome.',
        image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80',
        tags: ['history', 'culture', 'food'],
        latitude: 41.9028,
        longitude: 12.4964
      }
    ];

    await supabase
      .from('destinations')
      .upsert(destinations, { onConflict: 'name' }) // this requires a unique constraint, but we don't have one on name. 
      // Instead we will just insert if table is empty
      .select();
    
    // Quick workaround for avoiding duplicates: wipe demo data first (optional) or just wipe and insert.
    // Let's wipe all demo data from destinations (and cascade deletes everything)
    console.log('Wiping old demo data...');
    await supabase.from('businesses').delete().eq('id', businessId);
    // recreate business id to ensure clean slate
    
    const { data: newBusiness } = await supabase
      .from('businesses')
      .insert({
        user_id: businessUserId,
        business_name: 'Innovation Hub Demo Suppliers',
        business_type: 'agency',
        description: 'A demo supplier for testing the booking platform.',
        location: 'Global',
        contact_email: 'suppliers@innovationhub.test',
        verified: true
      })
      .select()
      .single();
    
    businessId = newBusiness!.id;

    const { data: destData, error: dError } = await supabase
      .from('destinations')
      .insert(destinations)
      .select();
    if (dError) throw dError;

    const destMap = destData.reduce((acc, curr) => {
      acc[curr.name] = curr.id;
      return acc;
    }, {} as Record<string, string>);

    // 4. Create Hotels
    console.log('Creating hotels...');
    const hotels = [
      {
        business_id: businessId,
        destination_id: destMap['Paris'],
        name: 'Le Grand Paris Hotel',
        description: 'Luxury hotel near the Eiffel Tower with stunning views.',
        price_per_night: 350,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80',
        rating: 4.8,
        latitude: 48.8584,
        longitude: 2.2945
      },
      {
        business_id: businessId,
        destination_id: destMap['Paris'],
        name: 'Montmartre Boutique',
        description: 'Charming boutique hotel in the historic artists district.',
        price_per_night: 180,
        amenities: ['WiFi', 'Breakfast', 'Bar'],
        image_url: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&q=80',
        rating: 4.5,
        latitude: 48.8867,
        longitude: 2.3431
      },
      {
        business_id: businessId,
        destination_id: destMap['Tokyo'],
        name: 'Tokyo Shinjuku Tower',
        description: 'Modern high-rise hotel in the heart of Shinjuku.',
        price_per_night: 220,
        amenities: ['WiFi', 'Gym', 'Restaurant', 'City View'],
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80',
        rating: 4.7,
        latitude: 35.6895,
        longitude: 139.6917
      },
      {
        business_id: businessId,
        destination_id: destMap['Bali'],
        name: 'Ubud Jungle Resort',
        description: 'Eco-friendly resort surrounded by lush rainforest.',
        price_per_night: 150,
        amenities: ['WiFi', 'Pool', 'Spa', 'Yoga'],
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80',
        rating: 4.9,
        latitude: -8.5069,
        longitude: 115.2625
      },
      {
        business_id: businessId,
        destination_id: destMap['New York'],
        name: 'Manhattan Central Suites',
        description: 'Spacious suites walking distance from Times Square.',
        price_per_night: 400,
        amenities: ['WiFi', 'Gym', 'Breakfast'],
        image_url: 'https://images.unsplash.com/photo-1551882547-ff40c0d589rx?auto=format&fit=crop&q=80',
        rating: 4.6,
        latitude: 40.7580,
        longitude: -73.9855
      }
    ];
    await supabase.from('hotels').insert(hotels);

    // 5. Create Flights
    console.log('Creating flights...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const flights = [
      {
        business_id: businessId,
        airline: 'Air France',
        flight_number: 'AF123',
        departure_airport: 'JFK (New York)',
        arrival_airport: 'CDG (Paris)',
        departure_time: tomorrow.toISOString(),
        arrival_time: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        price: 850
      },
      {
        business_id: businessId,
        airline: 'Japan Airlines',
        flight_number: 'JL456',
        departure_airport: 'LAX (Los Angeles)',
        arrival_airport: 'HND (Tokyo)',
        departure_time: tomorrow.toISOString(),
        arrival_time: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        price: 1200
      },
      {
        business_id: businessId,
        airline: 'Garuda Indonesia',
        flight_number: 'GA789',
        departure_airport: 'SYD (Sydney)',
        arrival_airport: 'DPS (Bali)',
        departure_time: tomorrow.toISOString(),
        arrival_time: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        price: 500
      },
      {
        business_id: businessId,
        airline: 'Delta',
        flight_number: 'DL101',
        departure_airport: 'CDG (Paris)',
        arrival_airport: 'JFK (New York)',
        departure_time: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        arrival_time: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        price: 900
      }
    ];
    await supabase.from('flights').insert(flights);

    // 6. Create Buses
    console.log('Creating buses...');
    const buses = [
      {
        business_id: businessId,
        operator_name: 'FlixBus',
        route_source: 'Paris',
        route_destination: 'London',
        departure_time: tomorrow.toISOString(),
        arrival_time: new Date(tomorrow.getTime() + 7 * 60 * 60 * 1000).toISOString(),
        price: 45,
        total_seats: 50
      },
      {
        business_id: businessId,
        operator_name: 'Megabus',
        route_source: 'New York',
        route_destination: 'Boston',
        departure_time: tomorrow.toISOString(),
        arrival_time: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        price: 25,
        total_seats: 60
      }
    ];
    await supabase.from('buses').insert(buses);

    // 7. Create Auto Vehicles
    console.log('Creating auto vehicles...');
    const autos = [
      {
        business_id: businessId,
        vehicle_type: 'car',
        model: 'Toyota Camry 2023',
        city: 'New York',
        price_per_day: 80,
        driver_included: false
      },
      {
        business_id: businessId,
        vehicle_type: 'suv',
        model: 'Honda CR-V',
        city: 'Paris',
        price_per_day: 120,
        driver_included: false
      },
      {
        business_id: businessId,
        vehicle_type: 'auto_rickshaw',
        model: 'Bajaj RE',
        city: 'New Delhi',
        price_per_day: 20,
        driver_included: true
      }
    ];
    await supabase.from('auto_vehicles').insert(autos);

    // 8. Create Tours
    console.log('Creating tours...');
    const tours = [
      {
        business_id: businessId,
        destination_id: destMap['Paris'],
        name: 'Eiffel Tower Guided Climb',
        description: 'Skip the line and climb the Eiffel Tower with an expert guide.',
        price: 65,
        duration_hours: 3,
        category: 'Sightseeing',
        availability: 20,
        image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80',
        latitude: 48.8584,
        longitude: 2.2945
      },
      {
        business_id: businessId,
        destination_id: destMap['Tokyo'],
        name: 'Sushi Making Masterclass',
        description: 'Learn the art of sushi making from a local chef.',
        price: 120,
        duration_hours: 4,
        category: 'Food & Drink',
        availability: 8,
        image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80',
        latitude: 35.6762,
        longitude: 139.6503
      }
    ];
    await supabase.from('tours').insert(tours);

    console.log('✅ Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
  }
}

seed();
