import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { supabase } from './src/config/supabase';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for Supabase...');

    // Clear existing data
    await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hotels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('🧹 Cleared existing data');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    const { data: travelerData, error: travelerError } = await supabase.from('users').insert({
      name: 'Alex Traveler',
      email: 'alex@example.com',
      password_hash,
      role: 'traveler'
    }).select().single();

    if (travelerError) throw travelerError;

    const { data: businessUserData, error: businessError } = await supabase.from('users').insert({
      name: 'Sarah Hotelier',
      email: 'sarah@example.com',
      password_hash,
      role: 'business'
    }).select().single();

    if (businessError) throw businessError;

    // Create demo business
    const { data: businessData, error: bizError } = await supabase.from('businesses').insert({
      user_id: businessUserData.id,
      business_name: 'Vstara Elite Stays',
      business_type: 'hotel',
      description: 'Curated premium stays across the Middle East.',
      contact_email: 'contact@vstaraelite.com',
      verified: true
    }).select().single();

    if (bizError) throw bizError;

    // Create destinations
    const { data: destinationsData, error: destError } = await supabase.from('destinations').insert([
      {
        name: 'Petra',
        country: 'Jordan',
        description: 'The famous Rose City, carved directly into vibrant red, white, pink, and sandstone cliff faces.',
        image_url: 'https://images.unsplash.com/photo-1579532536935-619928decd08',
        tags: ['historic', 'desert', 'hiking', 'wonders'],
        latitude: 30.328960,
        longitude: 35.440156
      },
      {
        name: 'Wadi Rum',
        country: 'Jordan',
        description: 'Also known as The Valley of the Moon, featuring spectacular sandstone and granite rock valleys.',
        image_url: 'https://images.unsplash.com/photo-1544431526-724128f1cc4e',
        tags: ['desert', 'adventure', 'camping', 'nature'],
        latitude: 29.5395,
        longitude: 35.4093
      },
      {
        name: 'Dead Sea',
        country: 'Jordan',
        description: 'The lowest point on earth, a salt lake with hyper-saline water that makes floating easy.',
        image_url: 'https://images.unsplash.com/photo-1582885913251-1b12b5e28e46',
        tags: ['wellness', 'spa', 'nature', 'unique'],
        latitude: 31.5590,
        longitude: 35.4732
      },
      {
        name: 'Amman',
        country: 'Jordan',
        description: 'The modern and ancient capital of Jordan, full of Roman ruins and vibrant street life.',
        image_url: 'https://images.unsplash.com/photo-1580838118086-fbdfaf36b132',
        tags: ['city', 'culture', 'food', 'historic'],
        latitude: 31.9454,
        longitude: 35.9284
      },
      {
        name: 'Aqaba',
        country: 'Jordan',
        description: 'A Jordanian port city on the Red Sea\'s Gulf of Aqaba, known for its beach resorts and scuba diving.',
        image_url: 'https://images.unsplash.com/photo-1627889988453-6ec037efdb84',
        tags: ['beach', 'diving', 'resort', 'relax'],
        latitude: 29.5319,
        longitude: 35.0061
      }
    ]).select();

    if (destError) throw destError;

    // Create hotels linked to destinations
    const { error: hotelError } = await supabase.from('hotels').insert([
      {
        business_id: businessData.id,
        destination_id: destinationsData[0].id,
        name: 'Petra Moon Luxury',
        description: 'Stay steps away from the entrance of the ancient city with luxury amenities.',
        price_per_night: 250,
        amenities: ['Pool', 'Spa', 'Breakfast Included', 'Guided Tours'],
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        rating: 4.8,
        latitude: 30.329,
        longitude: 35.441
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[1].id,
        name: 'Martian Bubble Camp',
        description: 'Sleep under the stars in Wadi Rum in our panoramic luxury domes.',
        price_per_night: 300,
        amenities: ['Stargazing', 'Jeep Tours', 'Traditional Dinner'],
        image_url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
        rating: 4.9,
        latitude: 29.54,
        longitude: 35.41
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[2].id,
        name: 'Dead Sea Spa Resort',
        description: 'World-class mud treatments and private access to the Dead Sea.',
        price_per_night: 180,
        amenities: ['Private Beach', 'Mud Baths', 'Multiple Pools'],
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        rating: 4.6,
        latitude: 31.56,
        longitude: 35.47
      }
    ]);

    if (hotelError) throw hotelError;

    // Create tours linked to destinations
    const { error: tourError } = await supabase.from('tours').insert([
      {
        business_id: businessData.id,
        destination_id: destinationsData[0].id,
        name: 'Petra by Night',
        description: 'Experience the magic of Petra illuminated by thousands of candles.',
        price: 35,
        duration_hours: 2,
        category: 'Cultural',
        availability: 50,
        image_url: 'https://images.unsplash.com/photo-1579532536935-619928decd08',
        latitude: 30.328,
        longitude: 35.440
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[1].id,
        name: 'Wadi Rum Jeep Safari',
        description: 'A thrilling 4x4 ride through the dramatic desert landscape.',
        price: 60,
        duration_hours: 4,
        category: 'Adventure',
        availability: 12,
        image_url: 'https://images.unsplash.com/photo-1544431526-724128f1cc4e',
        latitude: 29.539,
        longitude: 35.409
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[2].id,
        name: 'Dead Sea Mud Bath Experience',
        description: 'Relax and rejuvenate with natural mineral-rich mud treatments.',
        price: 45,
        duration_hours: 3,
        category: 'Wellness',
        availability: 20,
        image_url: 'https://images.unsplash.com/photo-1582885913251-1b12b5e28e46',
        latitude: 31.558,
        longitude: 35.472
      }
    ]);

    if (tourError) throw tourError;

    console.log('✅ Seeding complete!');
    console.log('-------------------------------------------');
    console.log('Demo Traveler Account:');
    console.log('Email: alex@example.com');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    console.log('Demo Business Account:');
    console.log('Email: sarah@example.com');
    console.log('Password: password123');
    console.log('-------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
