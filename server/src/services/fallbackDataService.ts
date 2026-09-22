/**
 * Fallback Travel Catalog Data Service
 * Provides comprehensive, realistic MakeMyTrip-style travel data for Indian destinations,
 * flights, hotels, buses, tours, and cabs when the primary database is unseeded or temporarily offline.
 */

export interface FallbackDestination {
  id: string;
  name: string;
  state: string;
  description: string;
  category: string;
  image_url: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  latitude: number;
  longitude: number;
  best_time_to_visit: string;
  popular_attractions: string[];
}

export interface FallbackFlight {
  id: string;
  flight_number: string;
  airline: string;
  airline_logo?: string;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  price: number;
  cabin_class: 'economy' | 'premium_economy' | 'business';
  fare_type: 'Saver' | 'Flexi' | 'Super Value';
  baggage: string;
  stops: number;
  seats_available: number;
  is_refundable: boolean;
}

export interface FallbackHotel {
  id: string;
  name: string;
  city: string;
  address: string;
  category: string;
  rating: number;
  review_count: number;
  price_per_night: number;
  images: string[];
  amenities: string[];
  description: string;
  latitude: number;
  longitude: number;
  rooms: Array<{
    id: string;
    name: string;
    price: number;
    capacity: number;
    bed_type: string;
    features: string[];
  }>;
}

export interface FallbackBus {
  id: string;
  bus_operator: string;
  bus_type: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  duration_hours: number;
  fare: number;
  rating: number;
  seats_available: number;
  amenities: string[];
  boarding_points: string[];
  dropping_points: string[];
}

export interface FallbackTour {
  id: string;
  name: string;
  category: string;
  destination: string;
  locationName: string;
  duration_hours: number;
  price: number;
  rating: number;
  review_count: number;
  image_url: string;
  description: string;
  highlights: string[];
  included: string[];
  instant_confirmation: boolean;
}

export const FALLBACK_DESTINATIONS: FallbackDestination[] = [
  {
    id: 'dest-varanasi-01',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    description: 'The spiritual capital of India on the banks of holy Ganges, home to timeless ghats and mystical evening aartis.',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
    rating: 4.9,
    review_count: 1420,
    is_featured: true,
    latitude: 25.3176,
    longitude: 82.9739,
    best_time_to_visit: 'October to March',
    popular_attractions: ['Dashashwamedh Ghat', 'Kashi Vishwanath Temple', 'Assi Ghat', 'Sarnath']
  },
  {
    id: 'dest-jaipur-02',
    name: 'Jaipur',
    state: 'Rajasthan',
    description: 'The legendary Pink City with opulent hilltop forts, royal palaces, and vibrant craft bazaars.',
    category: 'Cultural',
    image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
    rating: 4.8,
    review_count: 2180,
    is_featured: true,
    latitude: 26.9124,
    longitude: 75.7873,
    best_time_to_visit: 'November to February',
    popular_attractions: ['Amer Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar']
  },
  {
    id: 'dest-andaman-03',
    name: 'Havelock Island',
    state: 'Andaman & Nicobar',
    description: 'Pristine turquoise waters, coral reefs, and Asia’s famous Radhanagar white sand beach.',
    category: 'Beach',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
    rating: 5.0,
    review_count: 980,
    is_featured: true,
    latitude: 11.9761,
    longitude: 92.9876,
    best_time_to_visit: 'October to May',
    popular_attractions: ['Radhanagar Beach', 'Elephant Beach', 'Kalapathar Beach', 'Scuba Reefs']
  },
  {
    id: 'dest-rishikesh-04',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    description: 'The world capital of Yoga nestled in the Himalayan foothills, renowned for rafting, ashrams, and serenity.',
    category: 'Adventure',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop',
    rating: 4.9,
    review_count: 1350,
    is_featured: true,
    latitude: 30.0869,
    longitude: 78.2676,
    best_time_to_visit: 'September to April',
    popular_attractions: ['Laxman Jhula', 'Triveni Ghat', 'Beatles Ashram', 'Shivpuri Rafting']
  },
  {
    id: 'dest-goa-05',
    name: 'Goa',
    state: 'Goa',
    description: 'Sun-drenched beaches, Portuguese colonial architecture, vibrant shacks, and exhilarating water sports.',
    category: 'Beach',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop',
    rating: 4.8,
    review_count: 3200,
    is_featured: true,
    latitude: 15.2993,
    longitude: 74.1240,
    best_time_to_visit: 'November to March',
    popular_attractions: ['Baga Beach', 'Fort Aguada', 'Dudhsagar Falls', 'Anjuna Flea Market']
  }
];

export const FALLBACK_FLIGHTS: FallbackFlight[] = [
  {
    id: 'fl-6e-2041',
    flight_number: '6E-2041',
    airline: 'IndiGo',
    airline_logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop',
    from_airport: 'DEL',
    to_airport: 'BOM',
    from_city: 'Delhi',
    to_city: 'Mumbai',
    departure_time: '06:00',
    arrival_time: '08:15',
    duration_minutes: 135,
    price: 4299,
    cabin_class: 'economy',
    fare_type: 'Saver',
    baggage: '15 kg Check-in, 7 kg Cabin',
    stops: 0,
    seats_available: 18,
    is_refundable: true
  },
  {
    id: 'fl-ai-805',
    flight_number: 'AI-805',
    airline: 'Air India',
    airline_logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop',
    from_airport: 'DEL',
    to_airport: 'BOM',
    from_city: 'Delhi',
    to_city: 'Mumbai',
    departure_time: '08:30',
    arrival_time: '10:45',
    duration_minutes: 135,
    price: 4899,
    cabin_class: 'economy',
    fare_type: 'Flexi',
    baggage: '25 kg Check-in, 7 kg Cabin',
    stops: 0,
    seats_available: 12,
    is_refundable: true
  },
  {
    id: 'fl-uk-991',
    flight_number: 'UK-991',
    airline: 'Vistara',
    airline_logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop',
    from_airport: 'DEL',
    to_airport: 'GOI',
    from_city: 'Delhi',
    to_city: 'Goa',
    departure_time: '10:15',
    arrival_time: '12:55',
    duration_minutes: 160,
    price: 5499,
    cabin_class: 'economy',
    fare_type: 'Saver',
    baggage: '15 kg Check-in, 7 kg Cabin',
    stops: 0,
    seats_available: 9,
    is_refundable: true
  },
  {
    id: 'fl-6e-512',
    flight_number: '6E-512',
    airline: 'IndiGo',
    airline_logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop',
    from_airport: 'DEL',
    to_airport: 'VNS',
    from_city: 'Delhi',
    to_city: 'Varanasi',
    departure_time: '07:20',
    arrival_time: '08:45',
    duration_minutes: 85,
    price: 3299,
    cabin_class: 'economy',
    fare_type: 'Saver',
    baggage: '15 kg Check-in, 7 kg Cabin',
    stops: 0,
    seats_available: 24,
    is_refundable: true
  }
];

export const FALLBACK_HOTELS: FallbackHotel[] = [
  {
    id: 'hotel-taj-ganges-01',
    name: 'Taj Ganges Varanasi',
    city: 'Varanasi',
    address: 'Nadesar Palace Grounds, Varanasi, UP 221002',
    category: 'Luxury Heritage',
    rating: 4.9,
    review_count: 850,
    price_per_night: 8500,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop'
    ],
    amenities: ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Spa & Wellness', 'Complimentary Breakfast', 'Airport Transfer'],
    description: 'Set amidst 40 acres of lush verdant gardens, Taj Ganges is a peaceful oasis in holy Kashi.',
    latitude: 25.3341,
    longitude: 82.9868,
    rooms: [
      {
        id: 'room-deluxe-garden',
        name: 'Deluxe Garden View Room',
        price: 8500,
        capacity: 2,
        bed_type: '1 King Bed or 2 Twin Beds',
        features: ['Garden View', 'Bathtub', '350 sq.ft', 'Free Breakfast']
      },
      {
        id: 'room-executive-suite',
        name: 'Executive Palace Suite',
        price: 14500,
        capacity: 3,
        bed_type: '1 Super King Bed',
        features: ['Lounge Area', 'Balcony', '650 sq.ft', 'VIP Lounge Access', 'Butler Service']
      }
    ]
  },
  {
    id: 'hotel-itc-rajputana-02',
    name: 'ITC Rajputana, a Luxury Collection Hotel',
    city: 'Jaipur',
    address: 'Palace Road, Gopalbari, Jaipur, Rajasthan 302006',
    category: 'Heritage Luxury',
    rating: 4.8,
    review_count: 1120,
    price_per_night: 7200,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop'
    ],
    amenities: ['Kaya Kalp Spa', 'Outdoor Pool', 'Fine Dining Restaurants', 'Valet Parking', 'Free Wi-Fi'],
    description: 'Designed around traditional haveli architecture with brick courtyards and royal hospitality.',
    latitude: 26.9196,
    longitude: 75.7925,
    rooms: [
      {
        id: 'room-rajputana-royale',
        name: 'Rajputana Royale Chamber',
        price: 7200,
        capacity: 2,
        bed_type: '1 King Bed',
        features: ['City View', 'Marble Bath', '380 sq.ft', 'Breakfast Included']
      }
    ]
  },
  {
    id: 'hotel-barefoot-havelock-03',
    name: 'Barefoot at Havelock Resort',
    city: 'Havelock Island',
    address: 'Beach No. 7, Radhanagar, Andaman 744211',
    category: 'Eco Beachfront Resort',
    rating: 4.9,
    review_count: 640,
    price_per_night: 9500,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop'
    ],
    amenities: ['Direct Beach Access', 'Ayurvedic Spa', 'Scuba Dive Center', 'Seafood Bar', 'Yoga Shala'],
    description: 'Sustainable eco-cottages tucked inside dense tropical rainforest, just steps from Radhanagar Beach.',
    latitude: 11.9845,
    longitude: 92.9554,
    rooms: [
      {
        id: 'room-andaman-villa',
        name: 'Andaman Villa with Garden View',
        price: 9500,
        capacity: 2,
        bed_type: '1 King Bed',
        features: ['Teak Wood Deck', 'Rain Shower', '450 sq.ft', 'Organic Breakfast']
      }
    ]
  }
];

export const FALLBACK_BUSES: FallbackBus[] = [
  {
    id: 'bus-smartbus-01',
    bus_operator: 'IntrCity SmartBus',
    bus_type: 'BharatBenz A/C Sleeper (2+1)',
    from_city: 'Delhi',
    to_city: 'Jaipur',
    departure_time: '23:00',
    arrival_time: '04:30',
    duration_hours: 5.5,
    fare: 699,
    rating: 4.7,
    seats_available: 14,
    amenities: ['Clean Linen', 'Personal Charging Point', 'Live GPS Tracking', 'Mineral Water'],
    boarding_points: ['ISBT Kashmiri Gate', 'Dhaula Kuan', 'IFFCO Chowk Gurgaon'],
    dropping_points: ['Sindhi Camp Jaipur', '200 Feet Bypass']
  },
  {
    id: 'bus-zingbus-02',
    bus_operator: 'Zingbus Plus',
    bus_type: 'Volvo 9600 Multi-Axle A/C Sleeper',
    from_city: 'Delhi',
    to_city: 'Rishikesh',
    departure_time: '23:30',
    arrival_time: '05:45',
    duration_hours: 6.25,
    fare: 849,
    rating: 4.8,
    seats_available: 8,
    amenities: ['Reading Light', 'Blanket', 'On-time Guarantee', 'Emergency Button'],
    boarding_points: ['Majnu Ka Tilla', 'Anand Vihar ISBT', 'Akshardham'],
    dropping_points: ['Nepali Farm Rishikesh', 'Natraj Chowk']
  }
];

export const FALLBACK_TOURS: FallbackTour[] = [
  {
    id: 'tour-vns-sunrise-01',
    name: 'Varanasi Sunrise Boat Ritual & Ghat Walk',
    category: 'Heritage',
    destination: 'Varanasi',
    locationName: 'Varanasi, Uttar Pradesh',
    duration_hours: 3,
    price: 1499,
    rating: 4.9,
    review_count: 142,
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
    description: 'Witness the mystical early morning rituals along the holy Ganges ghats with an expert cultural historian.',
    highlights: ['Private wooden boat ride', 'Subah-e-Banaras aarti', 'Hot Masala Chai with Malaiyo tasting'],
    included: ['Licensed guide', 'Boat ride fees', 'Temple entries'],
    instant_confirmation: true
  },
  {
    id: 'tour-jpr-cooking-02',
    name: 'Royal Rajasthani Culinary Masterclass',
    category: 'Food Tours',
    destination: 'Jaipur',
    locationName: 'Jaipur, Rajasthan',
    duration_hours: 4,
    price: 2499,
    rating: 4.8,
    review_count: 96,
    image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
    description: 'Learn century-old royal recipes inside a heritage haveli with a master home chef.',
    highlights: ['Traditional Laal Maas or Gatte ki Sabzi preparation', 'Spice market walk', '3-course courtyard dinner'],
    included: ['Recipe booklet', 'All ingredients', 'Heritage haveli dining'],
    instant_confirmation: true
  },
  {
    id: 'tour-and-scuba-03',
    name: 'Scuba Diving & Coral Reef Safari',
    category: 'Adventure',
    destination: 'Havelock Island',
    locationName: 'Havelock Island, Andaman',
    duration_hours: 3,
    price: 3800,
    rating: 5.0,
    review_count: 210,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
    description: 'Discover vibrant marine life and pristine coral formations in crystal clear tropical waters.',
    highlights: ['PADI certified dive instructor', 'Underwater HD video & photos', 'Nemo reef exploration'],
    included: ['Full scuba equipment', 'Boat transfer', 'HD photo packet'],
    instant_confirmation: true
  },
  {
    id: 'tour-rsk-rafting-04',
    name: 'White-Water Rafting & Cliff Jumping',
    category: 'Adventure',
    destination: 'Rishikesh',
    locationName: 'Rishikesh, Uttarakhand',
    duration_hours: 4,
    price: 1850,
    rating: 4.9,
    review_count: 320,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop',
    description: 'Conquer thrilling Grade III & IV rapids on the sacred Ganges river from Marine Drive to NIM Beach.',
    highlights: ['16 km rafting expedition', 'Roller Coaster & Golf Course rapids', 'Body surfing & cliff jump'],
    included: ['Safety gear & lifejackets', 'Professional rafting captain', 'Return shuttle'],
    instant_confirmation: true
  }
];
