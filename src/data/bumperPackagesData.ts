export interface BumperPackage {
  id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string; // e.g., "5 Days / 4 Nights"
  badge: string; // e.g., "Bestseller", "Festive Special"
  discountPercent: number; // e.g., 25
  originalPrice: number;
  discountedPrice: number;
  rating: number;
  reviewsCount: number;
  heroImage: string;
  galleryImages: string[];
  description: string;
  includedModes: ('flight' | 'train' | 'bus' | 'cab')[];
  includedHighlights: string[];
  hotelTiers: {
    tier: 'Budget' | 'Comfort' | 'Luxury';
    name: string;
    description: string;
    pricePerNight: number;
    image: string;
    features: string[];
  }[];
  itineraryDays: {
    day: number;
    title: string;
    description: string;
    transportType?: string;
    hotel?: string;
    activities: string[];
  }[];
  specialCareOptions: {
    id: string;
    title: string;
    description: string;
    freeOfCost: boolean;
  }[];
}

export const BUMPER_PACKAGES: BumperPackage[] = [
  {
    id: 'pkg-varanasi-spiritual',
    slug: 'varanasi-divine-ganga-heritage',
    title: 'Varanasi Divine Ganga & Sacred Temples Combo',
    destination: 'Varanasi',
    duration: '4 Days / 3 Nights',
    badge: 'Spiritual Bestseller',
    discountPercent: 30,
    originalPrice: 19999,
    discountedPrice: 13999,
    rating: 4.9,
    reviewsCount: 342,
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1000&auto=format&fit=crop'
    ],
    description: 'Immerse in the timeless sacred ghats of Varanasi. Includes round-trip Vande Bharat / Flight connectivity, private sunrise boat cruise, VIP access to Kashi Vishwanath temple, and authentic Banarasi silk workshops.',
    includedModes: ['flight', 'train', 'cab'],
    includedHighlights: [
      'VIP Darshan at Kashi Vishwanath Corridor',
      'Private Evening Ganga Aarti Boat Seating on Dashashwamedh Ghat',
      'Excursion to Sarnath Buddhist Monasteries & Ashoka Pillar',
      'Guided Banarasi Heritage Food & Silk Weaving Walk'
    ],
    hotelTiers: [
      {
        tier: 'Budget',
        name: 'Ganga Heritage Inn (3-Star)',
        description: 'Clean comfortable rooms near Assi Ghat with free breakfast and river views.',
        pricePerNight: 2200,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        features: ['Free Wi-Fi', 'Breakfast Included', 'AC Deluxe Room', 'River Terrace']
      },
      {
        tier: 'Comfort',
        name: 'Radisson Varanasi (4-Star)',
        description: 'Contemporary luxury with pool, fine-dining restaurants, and spa.',
        pricePerNight: 4800,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop',
        features: ['Swimming Pool', 'Buffet Breakfast', 'Airport Transfer', 'Luxury Bedding']
      },
      {
        tier: 'Luxury',
        name: 'BrijRama Palace Heritage (5-Star Heritage)',
        description: '18th-century palatial palace perched directly over the sacred Ganges.',
        pricePerNight: 12500,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        features: ['Royal Ghat View', 'Butler Service', 'Classical Music Evenings', 'Gourmet Thali']
      }
    ],
    itineraryDays: [
      { day: 1, title: 'Arrival & Evening Ganga Aarti Boat Cruise', description: 'Airport/station pickup, hotel check-in, sunset boat cruise and front-row Dashashwamedh Ganga Aarti view', activities: ['Ganga Aarti', 'Boat Cruise', 'Check-in'] },
      { day: 2, title: 'Kashi Vishwanath & Sarnath Stupas', description: 'Sunrise boat ride on Assi Ghat, VIP Kashi Vishwanath Corridor darshan, Sarnath Dhamek Stupa & museum tour', activities: ['Temple Darshan', 'Sarnath Stupa', 'Assi Ghat'] },
      { day: 3, title: 'Ancient Silk Weavers & Street Food Trail', description: 'Centuries-old Banarasi silk weaving artisan alleys, Ramnagar Fort, and evening authentic Kachori & Malaiyo tasting', activities: ['Silk Weavers', 'Ramnagar Fort', 'Food Tasting'] },
      { day: 4, title: 'Morning Sacred Ghats & Return Transfer', description: 'Morning temple prayer, souvenir brass & silk shopping, and direct transfer to airport/railway station', activities: ['Souvenir Shopping', 'Departure'] }
    ],
    specialCareOptions: [
      { id: 'sc-1', title: 'Senior Citizen Priority Darshan', description: 'Assisted battery cart & wheel-chair access at Kashi Vishwanath temple corridor', freeOfCost: true },
      { id: 'sc-2', title: 'Women Solo Traveler Safety Guarantee', description: 'Verified lady guide for old city street walks & 24/7 dedicated SOS concierge', freeOfCost: true },
      { id: 'sc-3', title: 'Wheelchair Ramp Vehicle Transfer', description: 'Specially fitted ramp vehicles for station and airport pickups', freeOfCost: true }
    ]
  },
  {
    id: 'pkg-goa-sun-sand',
    slug: 'goa-sun-sand-heritage-escape',
    title: 'Goa Golden Beaches & Portuguese Heritage All-in-One',
    destination: 'Goa',
    duration: '5 Days / 4 Nights',
    badge: 'Beach Favorite',
    discountPercent: 25,
    originalPrice: 24999,
    discountedPrice: 18749,
    rating: 4.8,
    reviewsCount: 512,
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop'
    ],
    description: 'Experience sun-kissed beaches, Latin Quarter Fontainhas heritage walks, sunset luxury catamaran cruise, and spice plantation banquets with round-trip flights and AC transport.',
    includedModes: ['flight', 'bus', 'cab'],
    includedHighlights: [
      'North Goa Calangute, Baga & Anjuna Beach Safari',
      'Fontainhas Latin Quarter Heritage & Architecture Walk',
      'Mandovi River Sunset Catamaran Cruise with Live DJ',
      'Dudhsagar Waterfall Jeep Safari & Spice Plantation Feast'
    ],
    hotelTiers: [
      {
        tier: 'Budget',
        name: 'Candolim Palms Resort (3-Star)',
        description: 'Cosy boutique resort 5 minutes from Candolim Beach.',
        pricePerNight: 2800,
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop',
        features: ['Pool Access', 'Free Breakfast', 'Near Beach', 'Wi-Fi']
      },
      {
        tier: 'Comfort',
        name: 'Novotel Goa Resort & Spa (4-Star)',
        description: 'Upscale tropical retreat with lagoon pool and wellness spa.',
        pricePerNight: 6500,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop',
        features: ['Lagoon Pool', 'Ayurvedic Spa', 'Beach Shuttle', 'Balcony Suite']
      },
      {
        tier: 'Luxury',
        name: 'Taj Exotica Resort & Spa (5-Star Luxury)',
        description: 'Mediterranean-style beachfront palace on pristine Benaulim Beach.',
        pricePerNight: 18000,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop',
        features: ['Private Beach Access', 'Golf Course', 'Sea View Villa', 'Signature Dining']
      }
    ],
    itineraryDays: [
      { day: 1, title: 'Arrival in North Goa', description: 'Flight arrival, transfer to resort, sunset relaxation at Vagator Beach', activities: ['Check-in', 'Beach Stroll', 'Sunset Shack Dinner'] },
      { day: 2, title: 'North Goa Beaches & Water Sports', description: 'Parasailing, jet ski at Calangute & Baga, visit Aguada Fort', activities: ['Water Sports', 'Fort Aguada', 'Night Market'] },
      { day: 3, title: 'Old Goa Heritage & Latin Quarters', description: 'Basilica of Bom Jesus, Se Cathedral & Fontainhas heritage walk', activities: ['UNESCO Churches', 'Portuguese Quarters', 'River Cruise'] },
      { day: 4, title: 'Dudhsagar Waterfalls & Spice Farm', description: 'Thrilling 4x4 jungle jeep safari to Dudhsagar waterfall and Goan buffet lunch', activities: ['Jeep Trek', 'Waterfall Swimming', 'Spice Tasting'] },
      { day: 5, title: 'South Goa Serenity & Departure', description: 'Morning leisure on Palolem beach, souvenir shopping, airport transfer', activities: ['Palolem Beach', 'Airport Drop'] }
    ],
    specialCareOptions: [
      { id: 'sc-4', title: 'Private Beach Accessible Cab', description: 'Step-free low-floor AC vehicles for senior travelers and families with toddlers', freeOfCost: true },
      { id: 'sc-5', title: 'Kid Safe Water Sports Life Jackets', description: 'Certified kid-friendly buoyancy equipment and certified instructors', freeOfCost: true }
    ]
  },
  {
    id: 'pkg-manali-snow-peaks',
    slug: 'manali-himalayan-snow-peaks',
    title: 'Manali & Solang Valley Snow & Adventure Explorer',
    destination: 'Manali',
    duration: '5 Days / 4 Nights',
    badge: 'Mountain Top Pick',
    discountPercent: 20,
    originalPrice: 21999,
    discountedPrice: 17599,
    rating: 4.8,
    reviewsCount: 428,
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop'
    ],
    description: 'Explore the majesty of the Himalayas. Includes luxury Volvo sleeper bus / flight transfers, snow activities at Solang Valley and Atal Tunnel, Old Manali cafe hopping, and Hadimba Temple.',
    includedModes: ['bus', 'cab', 'flight'],
    includedHighlights: [
      'Excursion to Solang Valley Snow Point & Paragliding',
      'Drive through engineering marvel Atal Tunnel to Sissu Valley',
      'Hadimba Temple, Vashisht Hot Springs & Jogini Waterfall Trek',
      'Old Manali Cafe Crawl & Mall Road Shopping'
    ],
    hotelTiers: [
      {
        tier: 'Budget',
        name: 'Himalayan Pine View Cottage (3-Star)',
        description: 'Wooden alpine rooms overlooking snow-capped peaks.',
        pricePerNight: 2400,
        image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&auto=format&fit=crop',
        features: ['Mountain View', 'Room Heater', 'Campfire', 'Free Breakfast']
      },
      {
        tier: 'Comfort',
        name: 'The Himalayan Resort & Spa (4-Star)',
        description: 'Victorian gothic style castle resort with heated pool and orchards.',
        pricePerNight: 5800,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        features: ['Heated Pool', 'Orchard Walks', 'Spa Treatments', 'Fireplace Suites']
      },
      {
        tier: 'Luxury',
        name: 'Span Resort & Spa Riverfront (5-Star Luxury)',
        description: 'Iconic riverside luxury along the gushing Beas River with private heli-pad.',
        pricePerNight: 16000,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        features: ['Riverside Decks', 'Private Butler', 'Helicopter Transfer Option', 'Gourmet Dining']
      }
    ],
    itineraryDays: [
      { day: 1, title: 'Arrival in Manali', description: 'Scenic arrival, hotel check-in, leisure walk on Mall Road', activities: ['Arrival', 'Mall Road', 'Local Cafes'] },
      { day: 2, title: 'Hadimba & Jogini Waterfalls', description: 'Visit historic Hadimba Temple, Vashisht sulphur springs, hike to Jogini Falls', activities: ['Hadimba Temple', 'Waterfall Hike', 'Hot Springs'] },
      { day: 3, title: 'Solang Valley & Atal Tunnel', description: 'Full day adventure: paragliding, zorbing, snow skiing and Sissu Waterfall drive', activities: ['Snow Activities', 'Atal Tunnel', 'Sissu Valley'] },
      { day: 4, title: 'Naggar Castle & Art Gallery', description: 'Visit historic wooden Naggar Castle, Roerich Art Gallery, trout fishing', activities: ['Naggar Castle', 'Heritage Walk', 'Trout Tasting'] },
      { day: 5, title: 'Shopping & Return Departure', description: 'Kullu shawl shopping, return Volvo coach departure', activities: ['Souvenir Shopping', 'Departure'] }
    ],
    specialCareOptions: [
      { id: 'sc-6', title: 'Heated Hotel Rooms & Thermal Blankets', description: 'Guaranteed high-wattage climate heating and oxygen support for elderly travelers', freeOfCost: true },
      { id: 'sc-7', title: 'Safe Snow Gear Rental Assistance', description: 'Sanitized snow boots, suits, and gloves provided on-site', freeOfCost: true }
    ]
  },
  {
    id: 'pkg-jaipur-royal-rajasthan',
    slug: 'jaipur-udaipur-royal-rajasthan',
    title: 'Royal Rajasthan Heritage: Jaipur & Udaipur Grandeur',
    destination: 'Jaipur',
    duration: '6 Days / 5 Nights',
    badge: 'Royal Heritage',
    discountPercent: 35,
    originalPrice: 32999,
    discountedPrice: 21449,
    rating: 4.9,
    reviewsCount: 689,
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1000&auto=format&fit=crop'
    ],
    description: 'Travel like royalty across Rajasthan. Includes Amer Fort elephant/jeep ascent, Hawa Mahal photography, Lake Pichola sunset boat ride, and authentic Rajasthani royal banquets.',
    includedModes: ['flight', 'train', 'cab'],
    includedHighlights: [
      'Amer Fort, Nahargarh Sunset & City Palace VIP Tour',
      'Hawa Mahal Photo Pass & Johari Bazaar Gemstone Trail',
      'Lake Pichola Private Sunset Boat Cruise to Jag Mandir',
      'Authentic Dal Baati Churma & Royal Rajasthani Thali Dining'
    ],
    hotelTiers: [
      {
        tier: 'Budget',
        name: 'Haveli Heritage Inn (3-Star)',
        description: 'Authentic Rajasthani haveli with courtyard dining and folk music.',
        pricePerNight: 2500,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        features: ['Folk Music Nights', 'Courtyard Breakfast', 'Free Wi-Fi', 'AC Rooms']
      },
      {
        tier: 'Comfort',
        name: 'ITC Rajputana Luxury Collection (4-Star)',
        description: 'Palatial architecture inspired by traditional Rajasthani stepwells.',
        pricePerNight: 7200,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop',
        features: ['Royal Dining', 'Swimming Pool', 'Kaya Kalp Spa', 'Heritage Suites']
      },
      {
        tier: 'Luxury',
        name: 'Rambagh Palace / The Leela Palace (5-Star Royal Palace)',
        description: 'The former royal residence of the Maharaja of Jaipur with peacocks in gardens.',
        pricePerNight: 24000,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        features: ['Maharaja Suites', 'Vintage Car Transfer', 'Royal Butler', 'Private Palace Tour']
      }
    ],
    itineraryDays: [
      { day: 1, title: 'Arrival in Pink City Jaipur', description: 'Airport/station pickup, hotel check-in, evening visit to Birla Temple and Chokhi Dhani cultural village', activities: ['Arrival', 'Cultural Village', 'Folk Dance'] },
      { day: 2, title: 'Amer Fort & Jaipur Palaces', description: 'Jeep ride to Amer Fort, photostop at Jal Mahal, visit City Palace & Jantar Mantar observatory', activities: ['Amer Fort', 'City Palace', 'Jantar Mantar'] },
      { day: 3, title: 'Hawa Mahal & Transit to Udaipur', description: 'Morning Hawa Mahal shoot, scenic Vande Bharat / AC express drive to Udaipur (City of Lakes)', activities: ['Hawa Mahal', 'Scenic Transit', 'Udaipur Arrival'] },
      { day: 4, title: 'City Palace & Lake Pichola Boat Cruise', description: 'Explore massive Udaipur City Palace, Saheliyon Ki Bari, and private sunset boat ride on Lake Pichola', activities: ['City Palace', 'Lake Pichola', 'Jag Mandir'] },
      { day: 5, title: 'Monsoon Palace & Artisan Bazaars', description: 'Sajjangarh Monsoon Palace panoramic view, traditional puppet show at Bagore Ki Haveli', activities: ['Monsoon Palace', 'Puppet Show', 'Handicrafts'] },
      { day: 6, title: 'Royal Farewell & Departure', description: 'Morning breakfast with lake views, transfer to Udaipur/Jaipur airport for flight home', activities: ['Souvenir Shopping', 'Departure'] }
    ],
    specialCareOptions: [
      { id: 'sc-8', title: 'Fort Jeep Lift Service for Seniors', description: 'Direct battery-operated elevator and jeep access to avoid steep hill climbing', freeOfCost: true },
      { id: 'sc-9', title: 'Pure Vegetarian / Jain Food Guarantee', description: 'Strict pure vegetarian and customized dietary food options throughout all meals', freeOfCost: true }
    ]
  }
];

export function getBumperPackageByIdOrSlug(idOrSlug: string): BumperPackage | undefined {
  if (!idOrSlug) return undefined;
  const lower = idOrSlug.toLowerCase();
  return BUMPER_PACKAGES.find(p => p.id.toLowerCase() === lower || p.slug.toLowerCase() === lower);
}

export function getBumperPackagesByDestination(destinationName: string): BumperPackage[] {
  if (!destinationName) return [];
  const lower = destinationName.toLowerCase();
  return BUMPER_PACKAGES.filter(p => p.destination.toLowerCase().includes(lower) || lower.includes(p.destination.toLowerCase()));
}

