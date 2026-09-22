import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { supabase } from './src/config/supabase';

dotenv.config();

const INDIAN_DESTINATIONS = [
  {
    name: 'Varanasi',
    country: 'India',
    description: 'The spiritual capital of India, perched along the sacred ghats of the Ganges with ancient rituals and timeless energy.',
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
    tags: ['spiritual', 'ghats', 'ancient', 'ganga', 'heritage', 'temples'],
    latitude: 25.3176,
    longitude: 82.9739,
    intelligence_data: {
      safety_score: 92,
      crowd_level: 'High (Festive Peak)',
      best_time_to_visit: 'October to March',
      ideal_duration: '3-4 Days',
      local_tips: 'Attend the evening Ganga Aarti at Dashashwamedh Ghat by 6:00 PM for the best boat view. Don’t miss blue lassi and kashi chaat.',
      peak_hours: '05:30 AM - 08:30 AM & 06:00 PM - 08:30 PM',
      avg_daily_budget: 1800
    }
  },
  {
    name: 'Goa',
    country: 'India',
    description: 'Sun-drenched golden beaches, Portuguese colonial architecture, vibrant shacks, water sports, and tranquil backwaters.',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop',
    tags: ['beach', 'nightlife', 'coastal', 'seafood', 'adventure', 'relaxation'],
    latitude: 15.2993,
    longitude: 74.1240,
    intelligence_data: {
      safety_score: 95,
      crowd_level: 'Moderate',
      best_time_to_visit: 'November to February',
      ideal_duration: '4-6 Days',
      local_tips: 'Rent a scooter to explore secluded South Goa beaches like Palolem, Butterfly, and Cola Beach.',
      peak_hours: '04:00 PM - 11:00 PM',
      avg_daily_budget: 3200
    }
  },
  {
    name: 'Manali',
    country: 'India',
    description: 'Magnificent snow-clad Himalayan valley, pine forests, adventure sports in Solang Valley, and high mountain passes.',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop',
    tags: ['mountains', 'snow', 'adventure', 'himalayas', 'trekking', 'nature'],
    latitude: 32.2432,
    longitude: 77.1892,
    intelligence_data: {
      safety_score: 90,
      crowd_level: 'Moderate',
      best_time_to_visit: 'October to June',
      ideal_duration: '4-5 Days',
      local_tips: 'Book Rohtang Pass permits in advance. Try authentic siddu and trout fish in Old Manali cafes.',
      peak_hours: '10:00 AM - 05:00 PM',
      avg_daily_budget: 2500
    }
  },
  {
    name: 'Jaipur',
    country: 'India',
    description: 'The illustrious Pink City, home to majestic hilltop fortresses, ornate royal palaces, and vibrant Rajasthani bazaars.',
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop',
    tags: ['royal', 'forts', 'palaces', 'culture', 'heritage', 'handicrafts'],
    latitude: 26.9124,
    longitude: 75.7873,
    intelligence_data: {
      safety_score: 93,
      crowd_level: 'Moderate to High',
      best_time_to_visit: 'October to March',
      ideal_duration: '3-4 Days',
      local_tips: 'Visit Amer Fort early morning for serene elephant/jeep rides. Try Pyaaz Kachori at Rawat Mishtan Bhandar.',
      peak_hours: '09:30 AM - 05:30 PM',
      avg_daily_budget: 2400
    }
  },
  {
    name: 'Udaipur',
    country: 'India',
    description: 'The romantic City of Lakes, crowned by shimmering Lake Pichola, floating white palaces, and Aravalli hills.',
    image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop',
    tags: ['lakes', 'palaces', 'romantic', 'heritage', 'luxury'],
    latitude: 24.5854,
    longitude: 73.7125,
    intelligence_data: {
      safety_score: 96,
      crowd_level: 'Moderate',
      best_time_to_visit: 'September to March',
      ideal_duration: '3-4 Days',
      local_tips: 'Take a sunset boat ride from Rameshwar Ghat to Jagmandir Island for breathtaking palace reflections.',
      peak_hours: '04:30 PM - 07:30 PM',
      avg_daily_budget: 2800
    }
  },
  {
    name: 'Munnar',
    country: 'India',
    description: 'Rolling emerald tea hills, misty waterfalls, spice estates, and cool mountain breezes in the Western Ghats.',
    image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop',
    tags: ['tea-gardens', 'hills', 'nature', 'kerala', 'waterfalls', 'trekking'],
    latitude: 10.0889,
    longitude: 77.0595,
    intelligence_data: {
      safety_score: 98,
      crowd_level: 'Pleasantly Calm',
      best_time_to_visit: 'September to May',
      ideal_duration: '3-4 Days',
      local_tips: 'Visit Kolukkumalai for the world’s highest tea estate sunrise. Bring a light jacket year-round.',
      peak_hours: '08:00 AM - 04:00 PM',
      avg_daily_budget: 2200
    }
  },
  {
    name: 'Ladakh (Leh)',
    country: 'India',
    description: 'Land of high mountain passes, pristine azure lakes like Pangong Tso, Buddhist monasteries, and dramatic landscapes.',
    image_url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&auto=format&fit=crop',
    tags: ['himalayas', 'adventure', 'buddhism', 'lakes', 'biking', 'stargazing'],
    latitude: 34.1526,
    longitude: 77.5771,
    intelligence_data: {
      safety_score: 94,
      crowd_level: 'Seasonal Peak',
      best_time_to_visit: 'May to September',
      ideal_duration: '6-8 Days',
      local_tips: 'Dedicate your first 24-48 hours completely to acclimatization in Leh. Carry Diamox and drink plenty of water.',
      peak_hours: '09:00 AM - 05:00 PM',
      avg_daily_budget: 3500
    }
  },
  {
    name: 'Rishikesh',
    country: 'India',
    description: 'The Yoga Capital of the World along the pristine upper Ganges, offering spiritual ashrams and thrilling river rafting.',
    image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&auto=format&fit=crop',
    tags: ['yoga', 'rafting', 'adventure', 'spirituality', 'ganga', 'meditation'],
    latitude: 30.0869,
    longitude: 78.2676,
    intelligence_data: {
      safety_score: 95,
      crowd_level: 'Moderate',
      best_time_to_visit: 'September to April',
      ideal_duration: '3-5 Days',
      local_tips: 'Witness Parmarth Niketan Ganga Aarti and cross the Beatles Ashram for serene meditative walks.',
      peak_hours: '07:00 AM - 11:00 AM & 05:00 PM - 07:30 PM',
      avg_daily_budget: 1900
    }
  },
  {
    name: 'Agra',
    country: 'India',
    description: 'World-famous home to the peerless marble Taj Mahal, Agra Fort, and the historical Mughal legacy.',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop',
    tags: ['taj-mahal', 'wonder', 'heritage', 'monuments', 'mughal'],
    latitude: 27.1751,
    longitude: 78.0421,
    intelligence_data: {
      safety_score: 91,
      crowd_level: 'High',
      best_time_to_visit: 'October to March',
      ideal_duration: '1-2 Days',
      local_tips: 'Enter Taj Mahal from the East Gate at sunrise (05:45 AM) to skip crowds and photograph the golden reflection.',
      peak_hours: '06:00 AM - 10:00 AM & 03:30 PM - 06:00 PM',
      avg_daily_budget: 2000
    }
  },
  {
    name: 'Amritsar',
    country: 'India',
    description: 'Spiritual heart of Sikhism with the gleaming Golden Temple, sacred langar community dining, and patriotic Wagah Border.',
    image_url: 'https://images.unsplash.com/photo-1588096344356-9b5192131238?w=800&auto=format&fit=crop',
    tags: ['golden-temple', 'spirituality', 'food', 'patriotism', 'heritage'],
    latitude: 31.6340,
    longitude: 74.8723,
    intelligence_data: {
      safety_score: 97,
      crowd_level: 'High (Spiritual)',
      best_time_to_visit: 'October to March',
      ideal_duration: '2-3 Days',
      local_tips: 'Visit Golden Temple at night when illuminated. Eat Amritsari Kulcha with Chole at Kulcha Land.',
      peak_hours: '04:00 AM - 08:00 AM & 07:00 PM - 10:00 PM',
      avg_daily_budget: 1600
    }
  },
  {
    name: 'Andaman (Havelock Island)',
    country: 'India',
    description: 'Pristine turquoise waters, world-renowned Radhanagar Beach, vibrant coral reefs, and bioluminescent night kayaking.',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
    tags: ['island', 'beach', 'scuba', 'corals', 'tropical', 'relaxation'],
    latitude: 11.9761,
    longitude: 92.9876,
    intelligence_data: {
      safety_score: 98,
      crowd_level: 'Peaceful',
      best_time_to_visit: 'October to May',
      ideal_duration: '5-7 Days',
      local_tips: 'Book private catamarans (Makruzz/Nautika) between Port Blair and Havelock well in advance.',
      peak_hours: '09:00 AM - 03:00 PM',
      avg_daily_budget: 4000
    }
  },
  {
    name: 'Alleppey (Alappuzha)',
    country: 'India',
    description: 'The Venice of the East, famous for tranquil palm-fringed backwater cruises on traditional kettuvallam houseboats.',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop',
    tags: ['backwaters', 'houseboat', 'kerala', 'ayurveda', 'nature'],
    latitude: 9.4981,
    longitude: 76.3388,
    intelligence_data: {
      safety_score: 96,
      crowd_level: 'Moderate',
      best_time_to_visit: 'September to March',
      ideal_duration: '2-3 Days',
      local_tips: 'Opt for an overnight houseboat with an onboard private chef for fresh Karimeen Pollichathu fish.',
      peak_hours: '01:00 PM - 06:00 PM',
      avg_daily_budget: 3000
    }
  },
  {
    name: 'Darjeeling',
    country: 'India',
    description: 'Queen of the Hills, renowned for Tiger Hill sunrise views over Mount Kanchenjunga, tea gardens, and the UNESCO Toy Train.',
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop',
    tags: ['tea', 'himalayas', 'toy-train', 'mountains', 'scenic'],
    latitude: 27.0410,
    longitude: 88.2663,
    intelligence_data: {
      safety_score: 94,
      crowd_level: 'Moderate',
      best_time_to_visit: 'March to May & October to December',
      ideal_duration: '3-4 Days',
      local_tips: 'Reach Tiger Hill by 04:30 AM to catch the magical alpine sunrise touching the world’s 3rd highest peak.',
      peak_hours: '05:00 AM - 09:00 AM & 03:00 PM - 06:00 PM',
      avg_daily_budget: 2100
    }
  },
  {
    name: 'Hampi',
    country: 'India',
    description: 'UNESCO World Heritage wonder featuring majestic boulder landscapes, ruins of the Vijayanagara Empire, and monolith temples.',
    image_url: 'https://images.unsplash.com/photo-1600100397608-f010f443b745?w=800&auto=format&fit=crop',
    tags: ['unesco', 'ruins', 'history', 'boulders', 'temples', 'architecture'],
    latitude: 15.3350,
    longitude: 76.4600,
    intelligence_data: {
      safety_score: 95,
      crowd_level: 'Calm to Moderate',
      best_time_to_visit: 'October to February',
      ideal_duration: '3-4 Days',
      local_tips: 'Rent a bicycle or moped to traverse both the sacred temple zone and the hippie island across the Tungabhadra River.',
      peak_hours: '07:00 AM - 11:00 AM & 04:00 PM - 06:30 PM',
      avg_daily_budget: 1700
    }
  },
  {
    name: 'Shillong & Cherrapunji',
    country: 'India',
    description: 'Scotland of the East with living root bridges, crystalline Umngot River at Dawki, and thundering monsoon waterfalls.',
    image_url: 'https://images.unsplash.com/photo-1622308644420-a297e20b57cf?w=800&auto=format&fit=crop',
    tags: ['waterfalls', 'living-roots', 'northeast', 'nature', 'caves', 'greenery'],
    latitude: 25.5788,
    longitude: 91.8933,
    intelligence_data: {
      safety_score: 96,
      crowd_level: 'Low to Moderate',
      best_time_to_visit: 'October to May',
      ideal_duration: '4-6 Days',
      local_tips: 'Trek down to the Double Decker Living Root Bridge in Nongriat (3,500 stone steps) with a local Khasi guide.',
      peak_hours: '09:00 AM - 04:00 PM',
      avg_daily_budget: 2600
    }
  },
  {
    name: 'Jaisalmer',
    country: 'India',
    description: 'The Golden City in the heart of the Thar Desert, boasting a living sandstone fort, camel desert safaris, and folk music camps.',
    image_url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&auto=format&fit=crop',
    tags: ['desert', 'forts', 'camel-safari', 'sand-dunes', 'rajasthan'],
    latitude: 26.9157,
    longitude: 70.9083,
    intelligence_data: {
      safety_score: 95,
      crowd_level: 'Moderate',
      best_time_to_visit: 'October to March',
      ideal_duration: '3-4 Days',
      local_tips: 'Spend a night glamping under the desert stars at Sam Sand Dunes with traditional Kalbeliya folk performances.',
      peak_hours: '04:00 PM - 09:30 PM',
      avg_daily_budget: 2300
    }
  },
  {
    name: 'Shimla',
    country: 'India',
    description: 'Historic colonial summer capital surrounded by cedar forests, the Mall Road, Christ Church, and panoramic Himalayan vistas.',
    image_url: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&auto=format&fit=crop',
    tags: ['colonial', 'hills', 'snow', 'mall-road', 'heritage'],
    latitude: 31.1048,
    longitude: 77.1734,
    intelligence_data: {
      safety_score: 94,
      crowd_level: 'High in Summer/Winter',
      best_time_to_visit: 'March to June & December to February',
      ideal_duration: '3-4 Days',
      local_tips: 'Take the Jakhu ropeway to the hilltop Hanuman temple for a 360-degree panoramic view of the snow ridges.',
      peak_hours: '11:00 AM - 08:00 PM',
      avg_daily_budget: 2400
    }
  },
  {
    name: 'Ooty & Coonoor',
    country: 'India',
    description: 'Queen of the Nilgiris with blue-tinted eucalyptus mountains, botanical gardens, tea estates, and charming misty trails.',
    image_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop',
    tags: ['nilgiris', 'tea', 'hills', 'toy-train', 'lakes'],
    latitude: 11.4102,
    longitude: 76.6950,
    intelligence_data: {
      safety_score: 97,
      crowd_level: 'Moderate',
      best_time_to_visit: 'October to June',
      ideal_duration: '3-4 Days',
      local_tips: 'Take the scenic Nilgiri Mountain Railway between Mettupalayam, Coonoor, and Ooty for iconic viaduct views.',
      peak_hours: '10:00 AM - 05:00 PM',
      avg_daily_budget: 2200
    }
  },
  {
    name: 'Madurai & Rameshwaram',
    country: 'India',
    description: 'Spiritual epicenter with thousand-pillar Meenakshi Amman Temple, sacred Ramanathaswamy Temple wells, and the historic Pamban Bridge.',
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
    tags: ['temples', 'spirituality', 'heritage', 'pamban-bridge', 'south-india'],
    latitude: 9.9195,
    longitude: 78.1193,
    intelligence_data: {
      safety_score: 95,
      crowd_level: 'High (Spiritual)',
      best_time_to_visit: 'October to March',
      ideal_duration: '3-4 Days',
      local_tips: 'Witness the night chariot and bed chamber ceremony at Meenakshi Temple starting around 09:00 PM.',
      peak_hours: '06:00 AM - 11:30 AM & 05:00 PM - 09:30 PM',
      avg_daily_budget: 1700
    }
  },
  {
    name: 'Pondicherry (Puducherry)',
    country: 'India',
    description: 'French Riviera of the East with mustard-yellow colonial quarters, seaside promenade, bohemian cafes, and Auroville ashram.',
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
    tags: ['french-quarter', 'beach', 'cafes', 'auroville', 'relaxation'],
    latitude: 11.9416,
    longitude: 79.8083,
    intelligence_data: {
      safety_score: 96,
      crowd_level: 'Moderate',
      best_time_to_visit: 'October to March',
      ideal_duration: '2-4 Days',
      local_tips: 'Rent a pastel bicycle in White Town to explore heritage bakeries, art galleries, and the rock beach promenade.',
      peak_hours: '07:00 AM - 10:00 AM & 04:30 PM - 09:00 PM',
      avg_daily_budget: 2500
    }
  },
  {
    name: 'Kolkata',
    country: 'India',
    description: 'City of Joy, cultural epicenter known for Victoria Memorial, Howrah Bridge, traditional tram cars, and mouthwatering sweets.',
    image_url: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop',
    tags: ['culture', 'heritage', 'sweets', 'howrah', 'literature', 'art'],
    latitude: 22.5726,
    longitude: 88.3639,
    intelligence_data: {
      safety_score: 93,
      crowd_level: 'High',
      best_time_to_visit: 'October to March',
      ideal_duration: '3-4 Days',
      local_tips: 'Ride the iconic yellow ambassador taxi and historic tram. Try authentic Roshogolla and Kolkata Biryani.',
      peak_hours: '09:00 AM - 08:00 PM',
      avg_daily_budget: 1800
    }
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting full Indian Travel Hub database seeding for Yatra Setu...');

    // Clear existing data in correct foreign key order
    await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hotels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('🧹 Cleared existing data');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    const { data: travelerUser, error: travelerError } = await supabase.from('users').insert({
      name: 'Ayush Traveler',
      email: 'traveler@yatrasetu.com',
      password_hash,
      role: 'traveler'
    }).select().single();

    if (travelerError) throw travelerError;

    const { data: businessUserData, error: businessError } = await supabase.from('users').insert({
      name: 'Yatra Setu Experiences Partner',
      email: 'partner@yatrasetu.com',
      password_hash,
      role: 'business'
    }).select().single();

    if (businessError) throw businessError;

    // Create demo business
    const { data: businessData, error: bizError } = await supabase.from('businesses').insert({
      user_id: businessUserData.id,
      business_name: 'Yatra Setu Certified Tours & Stays',
      business_type: 'travel_agency',
      description: 'Official verified travel experiences & heritage stay partner for Yatra Setu across India.',
      contact_email: 'support@yatrasetu.com',
      verified: true
    }).select().single();

    if (bizError) throw bizError;

    // Seed 21 real Indian destinations with intelligence_data
    const { data: destinationsData, error: destError } = await supabase
      .from('destinations')
      .insert(INDIAN_DESTINATIONS)
      .select();

    if (destError) throw destError;
    console.log(`✅ Seeded ${destinationsData.length} Indian destinations with full intelligence data`);

    // Create Hotels linked to destinations
    const hotelsToInsert = [
      {
        business_id: businessData.id,
        destination_id: destinationsData[0].id, // Varanasi
        name: 'BrijRama Palace Heritage Ghat Hotel',
        description: 'Spectacular 18th-century palace on Darbhanga Ghat with private boat check-in and royal dining.',
        price_per_night: 8500,
        amenities: ['Ghat View', 'Vegetarian Gourmet', 'Spa', 'Evening Classical Recitals', 'Airport Transfer'],
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
        rating: 4.9,
        latitude: 25.3050,
        longitude: 83.0100
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[1].id, // Goa
        name: 'Taj Exotica Resort & Spa',
        description: 'Mediterranean-style luxury beachfront resort in Benaulim overlooking the Arabian Sea.',
        price_per_night: 14000,
        amenities: ['Private Beach', 'Infinity Pool', 'Golf Course', 'Jiva Spa', 'Seafood Grill'],
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
        rating: 4.8,
        latitude: 15.2490,
        longitude: 73.9240
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[2].id, // Manali
        name: 'The Himalayan Luxury Castle & Resort',
        description: 'Victorian Gothic castle resort surrounded by apple orchards and snow peaks.',
        price_per_night: 7200,
        amenities: ['Fireplace Suites', 'Heated Pool', 'Mountain View', 'Fine Dining', 'Trekking Desk'],
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
        rating: 4.7,
        latitude: 32.2500,
        longitude: 77.1850
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[3].id, // Jaipur
        name: 'Rambagh Palace (The Jewel of Jaipur)',
        description: 'Former residence of the Maharaja of Jaipur featuring hand-carved marble and lush gardens.',
        price_per_night: 22000,
        amenities: ['Royal Butler', 'Peacock Gardens', 'Indoor Pool', 'Historic Tour', 'Jharokha Dining'],
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
        rating: 5.0,
        latitude: 26.8970,
        longitude: 75.8080
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[4].id, // Udaipur
        name: 'Taj Lake Palace',
        description: 'Iconic marble palace floating gracefully on Lake Pichola, accessible only by private speedboat.',
        price_per_night: 28000,
        amenities: ['Floating Palace', 'Royal Jiva Spa Boat', 'Lake View Suites', 'Astrology Sessions', 'Champagne Breakfast'],
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
        rating: 4.9,
        latitude: 24.5760,
        longitude: 73.6800
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[5].id, // Munnar
        name: 'Fragrant Nature Sunset Tea Estate Resort',
        description: 'Boutique hill resort with panoramic views of tea plantations and mist valleys.',
        price_per_night: 5800,
        amenities: ['Ayurvedic Spa', 'Plantation Treks', 'Fireplace', 'Cloud View Restaurant'],
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
        rating: 4.6,
        latitude: 10.0500,
        longitude: 77.0200
      }
    ];

    const { error: hotelError } = await supabase.from('hotels').insert(hotelsToInsert);
    if (hotelError) throw hotelError;
    console.log('✅ Seeded luxury & heritage hotels');

    // Create Tours spread across ALL 10 categories
    const toursToInsert = [
      {
        business_id: businessData.id,
        destination_id: destinationsData[0].id, // Varanasi
        name: 'Varanasi Sunrise Boat Tour & Ghat Walk',
        description: 'Experience early morning spiritual ceremonies, sacred chants, and holy Ganga ghats with an authorized local scholar.',
        price: 1499,
        duration_hours: 3,
        category: 'Heritage',
        availability: 30,
        image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
        latitude: 25.3176,
        longitude: 82.9739
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[18].id, // Madurai
        name: 'Meenakshi Amman Ancient Temple Tour',
        description: 'Uncover thousand-pillar stone architecture, golden gopurams, and mythological legends with a heritage guide.',
        price: 1350,
        duration_hours: 3,
        category: 'Temple',
        availability: 25,
        image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
        latitude: 9.9195,
        longitude: 78.1193
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[5].id, // Munnar
        name: 'Munnar Misty Cloud Walk & Tea Trek',
        description: 'Trek through emerald rolling tea hills, lush plantations, and hidden mountain springs in Kerala.',
        price: 1200,
        duration_hours: 4,
        category: 'Nature',
        availability: 20,
        image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop',
        latitude: 10.0889,
        longitude: 77.0595
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[7].id, // Rishikesh
        name: 'Rishikesh Grade IV White-Water Rafting',
        description: 'Conquer thrilling Himalayan rapids from Marine Drive to NIM Beach, ending with a cliff jumping challenge.',
        price: 1850,
        duration_hours: 4,
        category: 'Adventure',
        availability: 18,
        image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&auto=format&fit=crop',
        latitude: 30.0869,
        longitude: 78.2676
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[10].id, // Andaman
        name: 'Havelock Island Scuba & Coral Reef Dive',
        description: 'Explore vibrant turquoise reefs, sea turtles, and clownfish with certified PADI instructors.',
        price: 3800,
        duration_hours: 3,
        category: 'Beach',
        availability: 15,
        image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
        latitude: 11.9761,
        longitude: 92.9876
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[6].id, // Ladakh
        name: 'Ladakh Cliffside Monastery & Stargazing Safari',
        description: 'Meditate in ancient high-altitude gompas and observe the pristine Milky Way with an astronomer.',
        price: 3499,
        duration_hours: 6,
        category: 'Cultural',
        availability: 12,
        image_url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&auto=format&fit=crop',
        latitude: 34.1526,
        longitude: 77.5771
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[20].id, // Kolkata
        name: 'Historic Kolkata Night Street Food Safari',
        description: 'Tasting trail through historic lanes for puchkas, kathi rolls, jhal muri, and authentic mishti doi.',
        price: 1650,
        duration_hours: 3,
        category: 'Food Tours',
        availability: 20,
        image_url: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=800&auto=format&fit=crop',
        latitude: 22.5726,
        longitude: 88.3639
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[3].id, // Jaipur
        name: 'Jaipur Forts & Royal Palaces Sightseeing',
        description: 'Full day private guided excursion covering Amer Fort, Hawa Mahal, City Palace, and Jantar Mantar.',
        price: 2100,
        duration_hours: 7,
        category: 'Local Sightseeing',
        availability: 25,
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop',
        latitude: 26.9124,
        longitude: 75.7873
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[8].id, // Agra
        name: 'Taj Mahal Sunrise Master Photography Walk',
        description: 'Master iconic angles and secret river reflection viewpoints with an award-winning travel photographer.',
        price: 2200,
        duration_hours: 3,
        category: 'Photography',
        availability: 10,
        image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop',
        latitude: 27.1751,
        longitude: 78.0421
      },
      {
        business_id: businessData.id,
        destination_id: destinationsData[1].id, // Goa
        name: 'Goa Coastal Dolphin Cruise & Family Picnic',
        description: 'Gentle morning boat safari spotting playful bottlenose dolphins followed by a beachside lunch.',
        price: 1750,
        duration_hours: 4,
        category: 'Family',
        availability: 35,
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
        latitude: 15.2993,
        longitude: 74.1240
      }
    ];

    const { error: tourError } = await supabase.from('tours').insert(toursToInsert);
    if (tourError) throw tourError;
    console.log('✅ Seeded tours across all 10 experience categories');

    console.log('\n===========================================');
    console.log('🎉 Yatra Setu Seeding Complete Successfully!');
    console.log('===========================================');
    console.log('Demo Traveler Account:');
    console.log('Email: traveler@yatrasetu.com');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    console.log('Demo Business Account:');
    console.log('Email: partner@yatrasetu.com');
    console.log('Password: password123');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
