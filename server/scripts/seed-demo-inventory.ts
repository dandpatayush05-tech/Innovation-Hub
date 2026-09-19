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
        name: 'Goa', country: 'India', description: 'Famous for its beaches, places of worship and world heritage architecture.',
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80',
        tags: ['beach', 'party', 'relax'], latitude: 15.2993, longitude: 74.1240,
        best_time_to_visit: 'Mid-November to Mid-February', climate_notes: 'Tropical monsoon climate'
      },
      {
        name: 'Delhi', country: 'India', description: 'The capital of India, known for its rich history and vibrant culture.',
        image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80',
        tags: ['city', 'history', 'culture'], latitude: 28.7041, longitude: 77.1025,
        best_time_to_visit: 'October to March', climate_notes: 'Humid subtropical climate'
      },
      {
        name: 'Mumbai', country: 'India', description: 'The financial, commercial, and entertainment capital of India.',
        image_url: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80',
        tags: ['city', 'culture', 'shopping'], latitude: 19.0760, longitude: 72.8777,
        best_time_to_visit: 'October to February', climate_notes: 'Tropical wet and dry climate'
      },
      {
        name: 'Jaipur', country: 'India', description: 'The Pink City, known for its fascinating monuments and colorful markets.',
        image_url: 'https://images.unsplash.com/photo-1533555231920-5c68b6b2165f?auto=format&fit=crop&q=80',
        tags: ['history', 'culture', 'architecture'], latitude: 26.9124, longitude: 75.7873,
        best_time_to_visit: 'November to February', climate_notes: 'Hot semi-arid climate'
      },
      {
        name: 'Kerala', country: 'India', description: 'Gods Own Country, famous for its backwaters and lush greenery.',
        image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80',
        tags: ['nature', 'relax', 'culture'], latitude: 10.8505, longitude: 76.2711,
        best_time_to_visit: 'September to March', climate_notes: 'Tropical monsoon climate'
      },
      {
        name: 'Odisha', country: 'India', description: 'Known for its tribal cultures and ancient Hindu temples.',
        image_url: 'https://images.unsplash.com/photo-1622301827409-eec8c5ed3412?auto=format&fit=crop&q=80',
        tags: ['history', 'culture', 'temples'], latitude: 20.9517, longitude: 85.0985,
        best_time_to_visit: 'October to March', climate_notes: 'Tropical savanna climate'
      },
      {
        name: 'Kashmir', country: 'India', description: 'Paradise on Earth, known for its beautiful landscapes and valleys.',
        image_url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&q=80',
        tags: ['nature', 'mountains', 'relax'], latitude: 34.0837, longitude: 74.7973,
        best_time_to_visit: 'March to August', climate_notes: 'Humid subtropical/Continental climate'
      },
      {
        name: 'Rajasthan', country: 'India', description: 'The Land of Kings, featuring majestic forts and palaces.',
        image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80',
        tags: ['history', 'culture', 'desert'], latitude: 27.0238, longitude: 74.2179,
        best_time_to_visit: 'October to March', climate_notes: 'Arid and semi-arid climate'
      },
      {
        name: 'Manali', country: 'India', description: 'A high-altitude Himalayan resort town known for backpacking and honeymooning.',
        image_url: 'https://images.unsplash.com/photo-1605649487212-4dcf3b7211a5?auto=format&fit=crop&q=80',
        tags: ['mountains', 'adventure', 'nature'], latitude: 32.2396, longitude: 77.1887,
        best_time_to_visit: 'October to June', climate_notes: 'Subtropical highland climate'
      },
      {
        name: 'Varanasi', country: 'India', description: 'The spiritual capital of India, situated on the banks of the Ganges.',
        image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80',
        tags: ['culture', 'spiritual', 'history'], latitude: 25.3176, longitude: 82.9739,
        best_time_to_visit: 'October to March', climate_notes: 'Humid subtropical climate'
      },
      {
        name: 'Paris', country: 'France', description: 'The City of Light.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80', tags: ['romantic', 'culture', 'food'], latitude: 48.8566, longitude: 2.3522
      },
      {
        name: 'Tokyo', country: 'Japan', description: 'Japan’s busy capital.', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80', tags: ['modern', 'culture', 'food'], latitude: 35.6762, longitude: 139.6503
      },
      {
        name: 'New York', country: 'USA', description: 'New York City comprises 5 boroughs.', image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e2815cb?auto=format&fit=crop&q=80', tags: ['city', 'culture', 'shopping'], latitude: 40.7128, longitude: -74.0060
      },
      {
        name: 'Bali', country: 'Indonesia', description: 'Bali is an Indonesian island.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80', tags: ['beach', 'nature', 'relax'], latitude: -8.3405, longitude: 115.0920
      },
      {
        name: 'Rome', country: 'Italy', description: 'Rome is the capital city of Italy.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80', tags: ['history', 'culture', 'food'], latitude: 41.9028, longitude: 12.4964
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

    // 9. Create Places
    console.log('Creating places...');
    const places = [
      // ATTRACTIONS
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'Taj Mahal', description: 'An ivory-white marble mausoleum on the right bank of the river Yamuna.', category: 'attraction', latitude: 27.1751, longitude: 78.0421, image_url: 'https://images.unsplash.com/photo-1564507592208-0176882655cc?auto=format&fit=crop&q=80', rating: 4.9
      },
      {
        business_id: businessId, destination_id: destMap['Mumbai'], name: 'Gateway of India', description: 'An arch-monument built in the early 20th century.', category: 'attraction', latitude: 18.9220, longitude: 72.8347, image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80', rating: 4.6
      },
      {
        business_id: businessId, destination_id: destMap['Odisha'], name: 'Konark Sun Temple', description: 'A 13th-century CE Sun temple at Konark about 35 kilometres northeast from Puri.', category: 'attraction', latitude: 19.8876, longitude: 86.0945, image_url: 'https://images.unsplash.com/photo-1622301827409-eec8c5ed3412?auto=format&fit=crop&q=80', rating: 4.8
      },
      {
        business_id: businessId, destination_id: destMap['Odisha'], name: 'Jagannath Temple', description: 'An important Hindu temple dedicated to Jagannath, a form of Vishnu, in Puri.', category: 'attraction', latitude: 19.8048, longitude: 85.8179, image_url: 'https://images.unsplash.com/photo-1599896792372-50d4dcf9c4ff?auto=format&fit=crop&q=80', rating: 4.8
      },
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'India Gate', description: 'A war memorial located astride the Rajpath, on the eastern edge of the ceremonial axis of New Delhi.', category: 'attraction', latitude: 28.6129, longitude: 77.2295, image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80', rating: 4.7
      },
      // RESTAURANTS & SHOPS FOR GOA
      {
        business_id: businessId, destination_id: destMap['Goa'], name: 'Gunpowder', description: 'South Indian coastal cuisine.', category: 'restaurant', rating: 4.7, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80', latitude: 15.5562, longitude: 73.7538
      },
      {
        business_id: businessId, destination_id: destMap['Goa'], name: 'Thalassa', description: 'Greek taverna with sunset views.', category: 'restaurant', rating: 4.6, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80', latitude: 15.6171, longitude: 73.7441
      },
      {
        business_id: businessId, destination_id: destMap['Goa'], name: 'Fishermans Wharf', description: 'Goan seafood delicacies.', category: 'restaurant', rating: 4.5, image_url: 'https://images.unsplash.com/photo-1574936145840-28808d77a0b6?auto=format&fit=crop&q=80', latitude: 15.1764, longitude: 73.9406
      },
      {
        business_id: businessId, destination_id: destMap['Goa'], name: 'Anjuna Flea Market', description: 'Famous wednesday flea market.', category: 'shop', rating: 4.4, image_url: 'https://images.unsplash.com/photo-1552568282-386d9a9097e1?auto=format&fit=crop&q=80', latitude: 15.5800, longitude: 73.7429
      },
      {
        business_id: businessId, destination_id: destMap['Goa'], name: 'Mapusa Market', description: 'Traditional Goan Friday market.', category: 'shop', rating: 4.3, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80', latitude: 15.5905, longitude: 73.8117
      },
      // RESTAURANTS & SHOPS FOR DELHI
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'Bukhara', description: 'World-renowned North West Frontier cuisine.', category: 'restaurant', rating: 4.8, image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80', latitude: 28.5973, longitude: 77.1732
      },
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'Indian Accent', description: 'Inventive Indian cuisine.', category: 'restaurant', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80', latitude: 28.5882, longitude: 77.2341
      },
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'Karim', description: 'Historic Mughal cuisine eatery.', category: 'restaurant', rating: 4.6, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80', latitude: 28.6496, longitude: 77.2335
      },
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'Dilli Haat', description: 'Open-air craft bazaar and food plaza.', category: 'shop', rating: 4.5, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80', latitude: 28.5724, longitude: 77.2078
      },
      {
        business_id: businessId, destination_id: destMap['Delhi'], name: 'Khan Market', description: 'Upscale shopping district.', category: 'shop', rating: 4.6, image_url: 'https://images.unsplash.com/photo-1519011985187-444d62641929?auto=format&fit=crop&q=80', latitude: 28.6006, longitude: 77.2270
      },
      // RESTAURANTS & SHOPS FOR JAIPUR
      {
        business_id: businessId, destination_id: destMap['Jaipur'], name: 'Suvarna Mahal', description: 'Fine dining in a royal palace setting.', category: 'restaurant', rating: 4.8, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80', latitude: 26.8974, longitude: 75.8080
      },
      {
        business_id: businessId, destination_id: destMap['Jaipur'], name: 'Chokhi Dhani', description: 'Traditional Rajasthani village resort and restaurant.', category: 'restaurant', rating: 4.5, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80', latitude: 26.7667, longitude: 75.8340
      },
      {
        business_id: businessId, destination_id: destMap['Jaipur'], name: '1135 AD', description: 'Authentic royal Rajasthani cuisine.', category: 'restaurant', rating: 4.7, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80', latitude: 26.9855, longitude: 75.8513
      },
      {
        business_id: businessId, destination_id: destMap['Jaipur'], name: 'Johari Bazaar', description: 'Famous market for jewelry and gems.', category: 'shop', rating: 4.6, image_url: 'https://images.unsplash.com/photo-1552568282-386d9a9097e1?auto=format&fit=crop&q=80', latitude: 26.9189, longitude: 75.8271
      },
      {
        business_id: businessId, destination_id: destMap['Jaipur'], name: 'Bapu Bazaar', description: 'Popular for traditional Rajasthani textiles.', category: 'shop', rating: 4.5, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80', latitude: 26.9182, longitude: 75.8239
      }
    ];
    const { error: pError } = await supabase.from('places').insert(places);
    if (pError) {
      console.error('Places Insert Error:', pError);
      throw pError;
    }

    console.log('✅ Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
  }
}

seed();
