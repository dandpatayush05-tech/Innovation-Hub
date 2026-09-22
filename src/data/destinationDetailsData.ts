export interface DestinationFood {
  id: string;
  name: string;
  category: 'Street Food' | 'Main Course' | 'Dessert & Sweet' | 'Beverage' | 'Snack';
  description: string;
  imageUrl: string;
  famousSpot: string;
  priceRange: string;
  vegNonVeg: 'veg' | 'non-veg';
}

export interface DestinationAttraction {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  timings: string;
  entryFee: string;
  bestTimeToVisit: string;
  highlight: string;
}

export interface TransitOption {
  mode: 'flight' | 'train' | 'bus' | 'cab';
  title: string;
  subTitle: string;
  description: string;
  duration: string;
  approxFare: string;
  routes: string[];
  bookingLink: string;
  frequency: string;
  tips: string;
}

export interface ComprehensiveDestinationDetail {
  id: string;
  slug: string;
  name: string;
  state: string;
  country: string;
  tagline: string;
  overviewDescription: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  galleryImages: { url: string; caption: string; tag: string }[];
  historyAndArtifacts: {
    period: string;
    title: string;
    narrative: string;
    keyArtifacts: string[];
    unescoStatus?: string;
  };
  famousFoods: DestinationFood[];
  topAttractions: DestinationAttraction[];
  transitGuide: {
    nearestAirport: string;
    nearestRailwayStation: string;
    majorHighways: string;
    options: TransitOption[];
  };
  linkedBumperPackageIds: string[];
  bestTime: {
    peakSeason: string;
    offSeason: string;
    weatherNotes: string;
    idealDays: string;
  };
  budgetEstimates: {
    budgetPerDay: number;
    comfortPerDay: number;
    luxuryPerDay: number;
  };
}

export const COMPREHENSIVE_DESTINATIONS_DATA: Record<string, ComprehensiveDestinationDetail> = {
  // 1. VARANASI
  'dest-varanasi': {
    id: 'dest-varanasi',
    slug: 'varanasi',
    name: 'Varanasi (Kashi)',
    state: 'Uttar Pradesh',
    country: 'India',
    tagline: 'The Eternal City of Light & Spirituality on the Banks of Sacred Ganga',
    overviewDescription: 'Varanasi, also revered as Kashi and Benares, is recognized as one of the oldest continuously inhabited cities in the world. Perched on the crescent-shaped banks of the sacred Ganges River, it represents the philosophical and spiritual heartbeat of India, echoing with evening brass bell aartis, ancient Vedic chanting, and timeless silk-weaving traditions.',
    latitude: 25.3176,
    longitude: 82.9739,
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1600&auto=format&fit=crop',
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1000&auto=format&fit=crop', caption: 'Mesmerizing evening Ganga Aarti at Dashashwamedh Ghat', tag: 'Spiritual' },
      { url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1000&auto=format&fit=crop', caption: 'Sunrise rowing boat cruise reflecting golden morning light over holy ghats', tag: 'Scenic' },
      { url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1000&auto=format&fit=crop', caption: 'Historic Sarnath Stupa where Lord Buddha delivered his first sermon', tag: 'Heritage' },
      { url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?w=1000&auto=format&fit=crop', caption: 'Narrow heritage lanes of Varanasi filled with vibrant silk sarees', tag: 'Culture' }
    ],
    historyAndArtifacts: {
      period: '1200 BCE – Present (Over 3,000 Years of Heritage)',
      title: 'Cradle of Hinduism, Buddhism & Ancient Vedic Sciences',
      narrative: 'According to Hindu mythology, Varanasi was founded by Lord Shiva. Throughout millennia, it has stood as a beacon of classical music, astronomy, Sanskrit scholarship, and ayurveda. At nearby Sarnath in 528 BCE, Gautama Buddha turned the Wheel of Dharma by delivering his first sermon. The city survived multiple dynasties—from the Mauryans and Guptas to the Maratha revivalists like Queen Ahilyabai Holkar, who rebuilt the golden Kashi Vishwanath Temple in 1780.',
      keyArtifacts: [
        'Ashoka Lion Capital (3rd Century BCE) — The National Emblem of India preserved in Sarnath Museum',
        'Kashi Vishwanath Jyotirlinga & 800 kg Gold Plated Temple Spire',
        'Centuries-old Handloom Banarasi Silk Brocades & Zari weaves',
        'Rare Palm-leaf Sanskrit Manuscripts in Sampurnanand Sanskrit University'
      ],
      unescoStatus: 'UNESCO Creative City for Music & Tentative World Heritage Site for Riverfront Ghats'
    },
    famousFoods: [
      {
        id: 'var-f1',
        name: 'Banarasi Malaiyo',
        category: 'Dessert & Sweet',
        description: 'A delicate, cloud-like winter dessert made of flavored frothed milk dew, saffron, pistachios, and silver leaf.',
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop',
        famousSpot: 'Shreeji Sweets, Thatheri Bazaar',
        priceRange: '₹50 - ₹80 per cup',
        vegNonVeg: 'veg'
      },
      {
        id: 'var-f2',
        name: 'Kachori Sabzi & Jalebi',
        category: 'Street Food',
        description: 'Crispy lentil-stuffed puffed breads served with spicy hing-infused potato curry and piping hot crispy jalebis.',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
        famousSpot: 'Ram Bhandar, Thatheri Gali & Chachi Ki Dukan',
        priceRange: '₹40 - ₹70 per plate',
        vegNonVeg: 'veg'
      },
      {
        id: 'var-f3',
        name: 'Banarasi Meetha Paan',
        category: 'Dessert & Sweet',
        description: 'Legendary betel leaf stuffed with fragrant gulkand, sweetened fennel, dried cherries, and saffron essence.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
        famousSpot: 'Keshav Tambool Bhandar, Ravindrapuri',
        priceRange: '₹30 - ₹100 per paan',
        vegNonVeg: 'veg'
      },
      {
        id: 'var-f4',
        name: 'Tamatar Chaat & Palak Chaat',
        category: 'Snack',
        description: 'Varanasi special warm spicy mashed tomato preparation blended with dry fruits, spices, and topped with crisp namakpare.',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop',
        famousSpot: 'Kashi Chaat Bhandar, Godowlia Chowk',
        priceRange: '₹50 - ₹90 per plate',
        vegNonVeg: 'veg'
      }
    ],
    topAttractions: [
      {
        id: 'var-att-1',
        name: 'Kashi Vishwanath Golden Temple Corridor',
        tagline: 'One of the 12 holiest Jyotirlinga shrines of Lord Shiva',
        description: 'The monumental corridor directly connects the ancient temple spire to the Ganga River. Features grand sandstone gates, museum, and high-security darshan pavilions.',
        imageUrl: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&auto=format&fit=crop',
        timings: '03:00 AM – 11:00 PM (Daily)',
        entryFee: 'Free (Sugam VIP Darshan at ₹300)',
        bestTimeToVisit: 'Early morning during Mangala Aarti (03:00 AM - 04:00 AM)',
        highlight: 'Gold-plated dome donated by Maharaja Ranjit Singh in 1835'
      },
      {
        id: 'var-att-2',
        name: 'Dashashwamedh & Assi River Ghats',
        tagline: 'The vibrant spiritual amphitheater of the holy Ganges',
        description: 'A chain of 84 ancient stone ghats where millions bathe, meditate, and witness the grand synchronized brass lamp aarti each evening.',
        imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
        timings: 'Open 24 Hours (Aarti starts at 06:45 PM)',
        entryFee: 'Free (Boat rides: ₹150 - ₹500/hr)',
        bestTimeToVisit: 'Evening sunset for Aarti & Sunrise for Yoga and Boat Tours',
        highlight: 'Ganga Aarti ceremony performed by priests in red and golden robes'
      },
      {
        id: 'var-att-3',
        name: 'Sarnath Buddhist Sacred Grounds',
        tagline: 'Where Lord Buddha preached his first discourse',
        description: 'Explore the towering 5th-century Dhamek Stupa, remains of ancient monasteries, the Bodhi tree sapling, and the archaeological museum.',
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop',
        timings: '09:00 AM – 05:00 PM (Friday Closed)',
        entryFee: '₹25 for Indians, ₹300 for Foreigners',
        bestTimeToVisit: 'Morning hours for serene meditation and museum tour',
        highlight: 'Original Ashoka Pillar Lion Capital and 1500-year-old stone carvings'
      }
    ],
    transitGuide: {
      nearestAirport: 'Lal Bahadur Shastri International Airport (VNS) — 24 km from city center',
      nearestRailwayStation: 'Varanasi Junction (BSB) / Pt. Deen Dayal Upadhyaya Jn (DDU) — 4 km to 14 km',
      majorHighways: 'NH 19 (Golden Quadrilateral) and Purvanchal Expressway',
      options: [
        {
          mode: 'flight',
          title: 'Direct Non-Stop Flights',
          subTitle: 'From Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata',
          description: 'Daily non-stop flights operate via IndiGo, Air India, and SpiceJet. Flight time from Delhi is 1h 20m and from Mumbai is 2h 10m.',
          duration: '1h 20m – 2h 15m',
          approxFare: '₹3,500 – ₹7,200',
          routes: ['Delhi (DEL) → Varanasi (VNS)', 'Mumbai (BOM) → Varanasi (VNS)', 'Bengaluru (BLR) → Varanasi (VNS)'],
          bookingLink: '/dashboard/flights?to=Varanasi',
          frequency: 'Over 25 direct flights daily',
          tips: 'Pre-paid AC airport taxis take ~45 minutes to Godowlia / Ghat area.'
        },
        {
          mode: 'train',
          title: 'Vande Bharat & Rajdhani Express Trains',
          subTitle: 'Fast semi-high-speed express rail connectivity',
          description: 'The flagship New Delhi – Varanasi Vande Bharat Express covers 760 km in just 8 hours with world-class onboard catering and AC Chair Car / Executive seating.',
          duration: '8h 00m (Vande Bharat) / 11h (Rajdhani)',
          approxFare: '₹1,450 – ₹3,200',
          routes: ['NDLS → BSB (Train 22436 Vande Bharat)', 'HWH → BSB (Kalka Mail)', 'CSTM → BSB (Mahanagari Express)'],
          bookingLink: '/packages/varanasi-divine-ganga-heritage',
          frequency: 'Daily morning & evening superfast departures',
          tips: 'Book Lower or Window seats 30 days in advance for peak festive seasons.'
        },
        {
          mode: 'bus',
          title: 'Intercity AC Sleeper Luxury Coaches',
          subTitle: 'Overnight bus routes from Lucknow, Prayagraj, Patna, Gorakhpur',
          description: 'Modern Volvo Multi-Axle and BharatBenz AC Sleeper buses with reclining berths, personal charging points, and live tracking.',
          duration: '4h (Prayagraj) / 6h (Lucknow) / 6h (Patna)',
          approxFare: '₹550 – ₹1,200',
          routes: ['Lucknow → Varanasi', 'Prayagraj → Varanasi', 'Patna → Varanasi', 'Gorakhpur → Varanasi'],
          bookingLink: '/dashboard/buses?to=Varanasi',
          frequency: 'Every 30 minutes from major regional hubs',
          tips: 'Pick Cantt Bus Stand or Lahartara boarding points for quick city access.'
        }
      ]
    },
    linkedBumperPackageIds: ['pkg-varanasi-spiritual'],
    bestTime: {
      peakSeason: 'October to March (Pleasant winter weather with temps 10°C – 25°C)',
      offSeason: 'May to June (Peak summer heat up to 42°C)',
      weatherNotes: 'Dev Deepawali in November sees millions of earthen lamps lighting up all 84 ghats.',
      idealDays: '3 to 4 Days'
    },
    budgetEstimates: {
      budgetPerDay: 1800,
      comfortPerDay: 4200,
      luxuryPerDay: 11000
    }
  },

  // 2. GOA
  'dest-goa': {
    id: 'dest-goa',
    slug: 'goa',
    name: 'Goa (Beaches & Heritage)',
    state: 'Goa',
    country: 'India',
    tagline: 'Sun-Kissed Golden Sands, Portuguese Architecture, and Tranquil Coastal Vibes',
    overviewDescription: 'Goa is India’s premier coastal paradise, celebrated worldwide for its blend of Indian and Portuguese cultures, UNESCO-listed Baroque cathedrals, pristine golden coastlines, vibrant beachfront cafes, thrilling water sports, and tranquil river backwaters.',
    latitude: 15.2993,
    longitude: 74.1240,
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop',
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop', caption: 'Pristine Palolem Beach crescent with leaning coconut palms', tag: 'Beach' },
      { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop', caption: 'Historic Fontainhas Latin Quarter with pastel-painted Portuguese villas', tag: 'Heritage' },
      { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop', caption: 'Thrilling jet-ski and parasailing over Arabian Sea waters', tag: 'Adventure' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop', caption: 'Four-tiered roaring Dudhsagar Waterfall amidst lush Western Ghats', tag: 'Nature' }
    ],
    historyAndArtifacts: {
      period: '1510 – 1961 (450 Years of Portuguese & Konkan Synergy)',
      title: 'Rome of the East — Baroque Cathedrals & Indo-Portuguese Forts',
      narrative: 'Conquered by Afonso de Albuquerque in 1510, Goa served as the capital of the Portuguese Empire in the East for over 450 years before joining India in 1961. The heritage is preserved in the Basilica of Bom Jesus, which houses the mortal relics of St. Francis Xavier, and the massive sea-facing Aguada and Chapora Forts.',
      keyArtifacts: [
        'Relics of St. Francis Xavier inside Basilica of Bom Jesus (1605 CE)',
        '17th-Century Lighthouse and Freshwater Moat at Fort Aguada',
        'Azulejos Hand-painted Glazed Ceramic Tile Art in Panaji',
        'Ancient Kadamba Dynasty Stone Inscriptions in Goa State Museum'
      ],
      unescoStatus: 'UNESCO World Heritage Site: Churches and Convents of Goa (1986)'
    },
    famousFoods: [
      {
        id: 'goa-f1',
        name: 'Goan Prawn Balchão & Fish Curry Rice',
        category: 'Main Course',
        description: 'Fresh king prawns and kingfish cooked in fiery red chili-vinegar paste, coconut milk, and fragrant kokum fruit.',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop',
        famousSpot: 'Fisherman’s Wharf, Panaji & Ritz Classic',
        priceRange: '₹280 - ₹480 per dish',
        vegNonVeg: 'non-veg'
      },
      {
        id: 'goa-f2',
        name: 'Traditional Goan Bebinca',
        category: 'Dessert & Sweet',
        description: 'The queen of Goan desserts: a traditional 7 to 16-layer baked pudding made with coconut milk, egg yolks, sugar, and nutmeg.',
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop',
        famousSpot: 'Confeitaria 31 De Janeiro, Fontainhas',
        priceRange: '₹150 - ₹250 per slice',
        vegNonVeg: 'veg'
      },
      {
        id: 'goa-f3',
        name: 'Goan Poi with Chorizo Sausages / Mushroom Xacuti',
        category: 'Snack',
        description: 'Crusty Goan wholewheat bread pocket stuffed with spicy pork chorizo sausage or aromatic coconut-coriander mushroom xacuti.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
        famousSpot: 'Vinayak Family Restaurant, Assagao',
        priceRange: '₹120 - ₹260',
        vegNonVeg: 'non-veg'
      }
    ],
    topAttractions: [
      {
        id: 'goa-att-1',
        name: 'Basilica of Bom Jesus & Se Cathedral',
        tagline: 'UNESCO Baroque Masterpiece holding sacred silver caskets',
        description: 'Built between 1594 and 1605, this red laterite church is a premier example of Jesuit architecture with carved marble pillars and gilded altars.',
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop',
        timings: '09:00 AM – 06:30 PM (Daily)',
        entryFee: 'Free Admission',
        bestTimeToVisit: 'Morning 09:30 AM before tour bus crowds',
        highlight: 'Silver casket containing the relics of St. Francis Xavier'
      },
      {
        id: 'goa-att-2',
        name: 'Fort Aguada & Sinquerim Coastal Battery',
        tagline: '17th-century Portuguese fortress overlooking Arabian Sea',
        description: 'Massive ramparts with a historic 4-storey freshwater lighthouse that once replenished passing European merchant vessels.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
        timings: '09:30 AM – 06:00 PM',
        entryFee: '₹25 for Indians, ₹300 for Foreigners',
        bestTimeToVisit: 'Sunset 05:00 PM – 06:30 PM for panoramic ocean vistas',
        highlight: 'Upper fort ramparts with sweeping 360-degree ocean view'
      },
      {
        id: 'goa-att-3',
        name: 'Dudhsagar Cascading Waterfalls',
        tagline: 'A Sea of Milk plummeting 310 meters through tropical jungles',
        description: 'Four-tiered waterfall situated on the Mandovi River. Reachable via an exhilarating 4x4 jungle jeep safari through Bhagwan Mahavir Wildlife Sanctuary.',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
        timings: '08:30 AM – 04:30 PM (October to May)',
        entryFee: '₹50 entry + ₹3,500 per jeep (shared up to 7 pax)',
        bestTimeToVisit: 'Post-monsoon (October to January) for maximum water volume',
        highlight: 'Scenic train bridge cutting directly across the waterfall spray'
      }
    ],
    transitGuide: {
      nearestAirport: 'Manohar International Airport, Mopa (GOX) / Dabolim Airport (GOI)',
      nearestRailwayStation: 'Madgaon Junction (MAO) / Thivim (THVM) / Karmali (KRMI)',
      majorHighways: 'NH 66 (Mumbai – Goa Highway) & NH 748',
      options: [
        {
          mode: 'flight',
          title: 'Direct Coastal Flights to Mopa / Dabolim',
          subTitle: 'Frequent non-stop connections across all metro airports',
          description: 'Fly directly into North Goa (Mopa GOX) for beach shacks or South Goa (Dabolim GOI) for luxury resorts.',
          duration: '1h 10m (Mumbai) / 2h 20m (Delhi)',
          approxFare: '₹3,200 – ₹6,800',
          routes: ['Mumbai (BOM) → Goa (GOX/GOI)', 'Delhi (DEL) → Goa (GOX/GOI)', 'Bangalore (BLR) → Goa (GOX)'],
          bookingLink: '/dashboard/flights?to=Goa',
          frequency: 'Over 60 daily flights',
          tips: 'Book Mopa Airport for Calangute, Baga, Morjim; Book Dabolim for Panaji, Colva, Palolem.'
        },
        {
          mode: 'train',
          title: 'Konkan Railway Vande Bharat & Tejas Express',
          subTitle: 'World-famous scenic coastal rail route through tunnels and viaducts',
          description: 'Experience the breathtaking Konkan Railway route featuring waterfalls, lush Western Ghats mountains, and Arabian Sea views.',
          duration: '7h 45m (Mumbai CSMT to Madgaon Vande Bharat)',
          approxFare: '₹1,600 – ₹3,400',
          routes: ['CSMT → Madgaon (Vande Bharat 22229)', 'MAQ → MAO (Vande Bharat 20646)', 'NDLS → MAO (Goa Express)'],
          bookingLink: '/packages/goa-sun-sand-heritage-escape',
          frequency: 'Daily express trains',
          tips: 'Choose right-side window seats traveling from Mumbai to Goa for ocean glimpses.'
        },
        {
          mode: 'bus',
          title: 'Luxury Sleeper Volvo Buses',
          subTitle: 'Overnight comfortable sleeper coaches from Mumbai, Pune, Bangalore',
          description: 'Direct AC multi-axle sleeper buses with individual USB charging, reading lights, and blankets.',
          duration: '12h (Mumbai) / 10h (Pune) / 12h (Bangalore)',
          approxFare: '₹900 – ₹1,800',
          routes: ['Mumbai → Panaji / Mapusa', 'Pune → Panaji', 'Bangalore → Panaji / Margao'],
          bookingLink: '/dashboard/buses?to=Goa',
          frequency: 'Departures every evening from 06:00 PM to 10:00 PM',
          tips: 'Pre-book pre-paid self-drive car or scooter rental at drop point for easy local transit.'
        }
      ]
    },
    linkedBumperPackageIds: ['pkg-goa-sun-sand'],
    bestTime: {
      peakSeason: 'November to February (Pleasant sunshine with cool 20°C – 30°C coastal breeze)',
      offSeason: 'June to August (Monsoon downpours with lush emerald green nature)',
      weatherNotes: 'December Christmas & New Year celebrations transform Goa with beach carnivals and music festivals.',
      idealDays: '4 to 6 Days'
    },
    budgetEstimates: {
      budgetPerDay: 2200,
      comfortPerDay: 5500,
      luxuryPerDay: 15000
    }
  },

  // 3. MANALI
  'dest-manali': {
    id: 'dest-manali',
    slug: 'manali',
    name: 'Manali & Solang Valley',
    state: 'Himachal Pradesh',
    country: 'India',
    tagline: 'High-Altitude Himalayan Haven with Snow Peaks, Rohtang Pass & Pine Valleys',
    overviewDescription: 'Nestled at an elevation of 2,050 meters along the Beas River valley, Manali is India’s favorite mountain adventure destination. Surrounded by towering pine forests, snow-clad peaks, and thrilling adventure hubs like Solang Valley and Atal Tunnel, it offers an idyllic escape for honeymooners, adventure enthusiasts, and mountain lovers alike.',
    latitude: 32.2432,
    longitude: 77.1892,
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop',
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop', caption: 'Snow-covered mountain vistas in Solang Valley', tag: 'Snow' },
      { url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1000&auto=format&fit=crop', caption: 'Iconic wooden multi-tier Hadimba Devi Temple amid cedar groves', tag: 'Heritage' },
      { url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop', caption: 'Scenic Atal Tunnel cutting through Pir Panjal mountain range into Lahaul', tag: 'Engineering' },
      { url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1000&auto=format&fit=crop', caption: 'Old Manali quaint stone cottages and vibrant riverside cafes', tag: 'Culture' }
    ],
    historyAndArtifacts: {
      period: 'Ancient Vedic Mythological Valley named after Sage Manu',
      title: 'Valley of the Gods & Kathkuni Himalayan Architecture',
      narrative: 'Manali derives its name from "Manu-Alaya" (the abode of Manu, the ancient lawgiver who stepped off his ark here after the great deluge). The valley showcases indigenous Kathkuni architectural mastery—earthquake-resistant interlocked timber-and-stone techniques without mortar, seen in the 1553 CE Hadimba Temple and Naggar Castle.',
      keyArtifacts: [
        '16th-Century Intricately Carved Deodar Wood Façade of Hadimba Temple',
        'Nicholas Roerich Russian Art Gallery & Memorial Estate in Naggar',
        'Kathkuni Wood-Stone Heritage Palace at Naggar Castle (1460 CE)',
        'Traditional Handwoven Kullu Shawls and Chamba Rumals'
      ],
      unescoStatus: 'Gateway to Great Himalayan National Park (UNESCO World Heritage Site)'
    },
    famousFoods: [
      {
        id: 'man-f1',
        name: 'Himachali Siddu with Ghee',
        category: 'Main Course',
        description: 'Steamed fermented wheat bun stuffed with seasoned walnuts, poppy seeds, and spices, drenched in hot desi ghee.',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
        famousSpot: 'Old Manali Dhabas & Cafe 1947',
        priceRange: '₹120 - ₹180 per piece',
        vegNonVeg: 'veg'
      },
      {
        id: 'man-f2',
        name: 'Fresh Tirthan River Pan-Fried Trout',
        category: 'Main Course',
        description: 'Freshly caught Himalayan rainbow trout marinated in lemon, garlic, and wild mountain herbs, pan-fried to crisp perfection.',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop',
        famousSpot: 'Johnson’s Cafe & Bar, Circuit House Road',
        priceRange: '₹450 - ₹650',
        vegNonVeg: 'non-veg'
      },
      {
        id: 'man-f3',
        name: 'Himachali Dham Thali & Babru',
        category: 'Main Course',
        description: 'Traditional feast of Madra (chickpeas in spiced yogurt), Chana Khatta, Sepu Vadi, and black gram stuffed breads.',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop',
        famousSpot: 'Heritage Restaurants on Mall Road',
        priceRange: '₹220 - ₹380',
        vegNonVeg: 'veg'
      }
    ],
    topAttractions: [
      {
        id: 'man-att-1',
        name: 'Solang Valley & Rohtang Snow Pass',
        tagline: 'Adventure Mecca for skiing, snowmobile, and paragliding',
        description: 'A sprawling alpine valley 14 km from Manali offering year-round adventure sports: paragliding flights, quad biking, and skiing in winter.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop',
        timings: '09:00 AM – 06:00 PM',
        entryFee: 'Free (Activities: ₹500 - ₹3,200)',
        bestTimeToVisit: 'December to March for heavy snow; May to June for paragliding',
        highlight: 'Tandem paragliding with panoramic views of snow-clad glaciers'
      },
      {
        id: 'man-att-2',
        name: 'Hadimba Devi Temple & Van Vihar',
        tagline: 'Ancient 4-tier wooden pagoda temple nestled in cedar woods',
        description: 'Constructed by Maharaja Bahadur Singh in 1553, this pagoda-style wooden shrine is set amidst towering, centuries-old deodar trees.',
        imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop',
        timings: '08:00 AM – 06:00 PM',
        entryFee: 'Free Admission',
        bestTimeToVisit: 'Morning 08:30 AM to enjoy tranquil forest sounds',
        highlight: 'Intricately carved wooden lintels depicting Hindu deities and mythological animals'
      },
      {
        id: 'man-att-3',
        name: 'Atal Tunnel & Sissu Valley Drive',
        tagline: 'World’s longest highway tunnel above 10,000 feet (9.02 km)',
        description: 'An engineering wonder connecting Manali to the moonscapes of Lahaul Valley in just 15 minutes, featuring frozen waterfalls in Sissu.',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
        timings: 'Open Daily (Subject to snow clearance)',
        entryFee: 'Free',
        bestTimeToVisit: 'Late morning for sunny views across Lahaul mountain ranges',
        highlight: 'Immediate dramatic contrast from lush green Manali to stark snowcapped Lahaul'
      }
    ],
    transitGuide: {
      nearestAirport: 'Kullu-Manali Airport, Bhuntar (KUU) — 50 km from Manali',
      nearestRailwayStation: 'Chandigarh Junction (CDG) — 310 km / Kiratpur Sahib — 240 km',
      majorHighways: 'NH 3 (Kiratpur – Manali Four-Lane Expressway) & NH 21',
      options: [
        {
          mode: 'bus',
          title: 'Volvo AC Multi-Axle Luxury Sleeper',
          subTitle: 'The most popular, comfortable overnight journey from Delhi & Chandigarh',
          description: 'HPTDC and premium private Volvo coaches depart Delhi ISBT Kashmiri Gate every evening, reaching Manali via the new 4-lane Himalayan expressway in 10-12 hours.',
          duration: '10h 30m (from Delhi) / 6h 30m (from Chandigarh)',
          approxFare: '₹1,100 – ₹1,900',
          routes: ['Delhi (ISBT) → Manali Private Stand', 'Chandigarh (Sector 43) → Manali', 'Amritsar → Manali'],
          bookingLink: '/dashboard/buses?to=Manali',
          frequency: 'Over 40 Volvo buses every evening',
          tips: 'Pick semi-sleeper or sleeper berths on lower level for smoother mountain curves.'
        },
        {
          mode: 'flight',
          title: 'Direct Mountain Flights to Bhuntar (KUU)',
          subTitle: 'Fast air connection from Delhi & Chandigarh',
          description: 'Alliance Air operates daily ATR-72 flights into Bhuntar Airport, offering breathtaking aerial views of the snow-clad Dhauladhar range.',
          duration: '1h 15m (from Delhi)',
          approxFare: '₹5,500 – ₹12,000',
          routes: ['Delhi (DEL) → Kullu-Manali (KUU)', 'Chandigarh (IXC) → Kullu (KUU)'],
          bookingLink: '/dashboard/flights?to=Manali',
          frequency: 'Daily scheduled morning flights',
          tips: 'Pre-book prepaid taxi from Bhuntar to Manali (1.5 hours scenic drive along Beas River).'
        },
        {
          mode: 'cab',
          title: 'Private AC Cab via New Four-Lane Expressway',
          subTitle: 'Scenic self-paced road trip from Chandigarh or Delhi',
          description: 'Drive through newly constructed scenic tunnels on the Kiratpur-Manali highway, cutting travel time by over 4 hours.',
          duration: '6h 30m (from Chandigarh) / 10h (from Delhi)',
          approxFare: '₹4,500 – ₹8,500 (Full Cab)',
          routes: ['Chandigarh → Bilaspur → Mandi → Kullu → Manali'],
          bookingLink: '/dashboard/auto',
          frequency: 'On-demand 24/7 with door-to-door pickup',
          tips: 'Take scenic chai stops near Pandoh Dam and Hanogi Mata Temple.'
        }
      ]
    },
    linkedBumperPackageIds: ['pkg-manali-snow-peaks'],
    bestTime: {
      peakSeason: 'December to February (Snow season) & May to June (Summer escape)',
      offSeason: 'July to August (Heavy monsoon rain with occasional landslides)',
      weatherNotes: 'Snowfall typically begins in late December with temperatures dropping to -5°C.',
      idealDays: '4 to 5 Days'
    },
    budgetEstimates: {
      budgetPerDay: 2000,
      comfortPerDay: 4800,
      luxuryPerDay: 13500
    }
  },

  // 4. JAIPUR
  'dest-jaipur': {
    id: 'dest-jaipur',
    slug: 'jaipur',
    name: 'Jaipur (The Pink City)',
    state: 'Rajasthan',
    country: 'India',
    tagline: 'Imperial Fortresses, Pink Terracotta Palaces, and Rich Royal Rajasthani Culture',
    overviewDescription: 'Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur is India’s first planned heritage city and the capital of Rajasthan. Renowned for its distinctive pink terracotta walls, grand hilltop forts, astronomical stone observatories, and vibrant gemstone bazaars, it is an indispensable part of the world-famous Golden Triangle.',
    latitude: 26.9124,
    longitude: 75.7873,
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&auto=format&fit=crop',
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop', caption: 'Massive Amer Fort ramparts overlooking Maota Lake', tag: 'Forts' },
      { url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1000&auto=format&fit=crop', caption: 'Honeycomb façade of Hawa Mahal (Palace of Winds)', tag: 'Architecture' },
      { url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&auto=format&fit=crop', caption: 'Jal Mahal floating mysteriously on the waters of Man Sagar Lake', tag: 'Scenic' }
    ],
    historyAndArtifacts: {
      period: '1727 CE – Present (300 Years of Kachwaha Rajput Dynasty)',
      title: 'Vastu Shastra Urban Planning & Royal Rajput Grandeur',
      narrative: 'Designed by Bengali architect Vidyadhar Bhattacharya using ancient principles of Vastu Shastra and Shilpa Shastra, Jaipur was painted in terracotta pink in 1876 by Maharaja Sawai Ram Singh to welcome Prince Albert of Britain. The city is home to Jantar Mantar, the world’s largest stone astronomical sundial.',
      keyArtifacts: [
        'World’s Largest Stone Sundial (Vrihat Samrat Yantra) at Jantar Mantar',
        '953 Intricately Carved Jharokha Windows of Hawa Mahal',
        'Giant Silver Urns (Gangajali) recorded in Guinness World Records at City Palace',
        'Sheesh Mahal (Palace of Mirrors) with thousand convex mirror mosaics at Amer Fort'
      ],
      unescoStatus: 'UNESCO World Heritage City (2019) & Jantar Mantar (2010)'
    },
    famousFoods: [
      {
        id: 'jpr-f1',
        name: 'Authentic Rajasthani Dal Baati Churma',
        category: 'Main Course',
        description: 'Hard-baked wheat balls dipped in pure desi ghee, served with five-lentil curry, garlic chutney, and sweet crushed churma.',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
        famousSpot: 'Laxmi Mishthan Bhandar (LMB) & Chokhi Dhani',
        priceRange: '₹250 - ₹500 per royal thali',
        vegNonVeg: 'veg'
      },
      {
        id: 'jpr-f2',
        name: 'Jaipuri Pyaaz Kachori & Mirchi Vada',
        category: 'Snack',
        description: 'Flaky deep-fried pastry stuffed with spiced caramelised onions, paired with sweet tamarind and spicy mint chutneys.',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop',
        famousSpot: 'Rawat Mishthan Bhandar, Station Road',
        priceRange: '₹40 - ₹80 per piece',
        vegNonVeg: 'veg'
      },
      {
        id: 'jpr-f3',
        name: 'Paneer Ghewar & Malpua',
        category: 'Dessert & Sweet',
        description: 'Disc-shaped honeycomb sweet soaked in saffron sugar syrup and topped with thick creamy rabdi and crushed dry fruits.',
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop',
        famousSpot: 'LMB, Johari Bazaar & Sambhar Fini',
        priceRange: '₹180 - ₹350 per piece',
        vegNonVeg: 'veg'
      }
    ],
    topAttractions: [
      {
        id: 'jpr-att-1',
        name: 'Amer Fort & Sheesh Mahal',
        tagline: 'Crest of Rajput-Mughal art atop Cheel Ka Teela hills',
        description: 'Massive fort constructed from yellow and pink sandstone, featuring the famous Mirror Palace where a single candle illuminates the entire hall.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop',
        timings: '08:00 AM – 05:30 PM (Evening Light Show at 07:00 PM)',
        entryFee: '₹100 for Indians, ₹500 for Foreigners',
        bestTimeToVisit: 'Morning 08:30 AM via elephant/jeep ride',
        highlight: 'Sheesh Mahal with thousands of imported Belgian mirror inlays'
      },
      {
        id: 'jpr-att-2',
        name: 'Hawa Mahal (Palace of Winds)',
        tagline: 'Crown-shaped 5-storey pink sandstone honeycomb façade',
        description: 'Built in 1799 by Maharaja Sawai Pratap Singh with 953 windows designed to allow royal women to view street festivals unnoticed while cooling breezes blew through.',
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop',
        timings: '09:00 AM – 05:00 PM',
        entryFee: '₹50 for Indians, ₹200 for Foreigners',
        bestTimeToVisit: 'Early morning sunrise from the opposite rooftop cafes',
        highlight: 'Geometric honeycomb ventilation system designed like Lord Krishna’s crown'
      },
      {
        id: 'jpr-att-3',
        name: 'City Palace & Jantar Mantar',
        tagline: 'Royal residence of the Maharaja & UNESCO stone observatory',
        description: 'A lavish complex of courtyards, Peacock Gates, royal armory museums, and the giant precision sundials of Jai Singh II.',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop',
        timings: '09:30 AM – 05:00 PM',
        entryFee: '₹200 (Composite Museum Pass available)',
        bestTimeToVisit: 'Midday 11:30 AM to observe precise solar sundial shadow movements',
        highlight: 'Pritam Niwas Chowk with 4 seasonal peacock painted doorways'
      }
    ],
    transitGuide: {
      nearestAirport: 'Jaipur International Airport, Sanganer (JAI) — 12 km from city center',
      nearestRailwayStation: 'Jaipur Junction (JP) / Gandhinagar Jaipur (GADJ) — in city center',
      majorHighways: 'NH 48 (Delhi – Jaipur Expressway) & Delhi-Mumbai Expressway',
      options: [
        {
          mode: 'train',
          title: 'Vande Bharat & Shatabdi Express',
          subTitle: 'High-speed comfortable connection from Delhi & Ahmedabad',
          description: 'Delhi – Jaipur Vande Bharat Express reaches in just 3h 45m with premium air-conditioned comfort and gourmet breakfast.',
          duration: '3h 45m (from Delhi) / 6h (from Ahmedabad)',
          approxFare: '₹850 – ₹1,800',
          routes: ['NDLS → JP (Vande Bharat 20978)', 'DEC → JP (Double Decker 12986)', 'BOM → JP (Jaipur Duronto)'],
          bookingLink: '/packages/jaipur-udaipur-royal-rajasthan',
          frequency: 'Over 20 daily express trains',
          tips: 'Jaipur Junction is centrally located near all major havelis and metro lines.'
        },
        {
          mode: 'flight',
          title: 'Direct Metro Flights to Jaipur (JAI)',
          subTitle: 'Non-stop flights connecting all Indian metropolitan hubs',
          description: 'Frequent daily services from Delhi, Mumbai, Hyderabad, Bengaluru, Kolkata, and Chennai.',
          duration: '50m (Delhi) / 1h 45m (Mumbai)',
          approxFare: '₹2,800 – ₹5,400',
          routes: ['Delhi (DEL) → Jaipur (JAI)', 'Mumbai (BOM) → Jaipur (JAI)', 'Bangalore (BLR) → Jaipur (JAI)'],
          bookingLink: '/dashboard/flights?to=Jaipur',
          frequency: '35+ daily flights',
          tips: 'Pre-paid AC taxis take 25 minutes from airport to the Walled Pink City.'
        },
        {
          mode: 'cab',
          title: 'Delhi – Jaipur Expressway Road Trip',
          subTitle: 'New 8-lane expressway connecting Delhi and Jaipur in under 3.5 hours',
          description: 'Smooth, high-speed road access via the newly opened NE-4 Delhi-Mumbai Expressway stretch.',
          duration: '3h 30m (from Delhi NCR)',
          approxFare: '₹2,800 – ₹4,500 (Full Cab)',
          routes: ['Delhi/Gurugram → Sohna → Dausa → Jaipur'],
          bookingLink: '/dashboard/auto',
          frequency: 'Instant on-demand bookings',
          tips: 'World-class rest stops with food courts every 40 km along NE-4.'
        }
      ]
    },
    linkedBumperPackageIds: ['pkg-jaipur-royal-rajasthan'],
    bestTime: {
      peakSeason: 'October to March (Crisp sunny winter days 15°C – 25°C)',
      offSeason: 'April to June (Intense desert summer heat up to 44°C)',
      weatherNotes: 'January brings the world-renowned Jaipur Literature Festival and International Kite Festival.',
      idealDays: '3 to 4 Days'
    },
    budgetEstimates: {
      budgetPerDay: 2000,
      comfortPerDay: 5000,
      luxuryPerDay: 16000
    }
  }
};

export function getComprehensiveDestination(idOrSlugOrName: string): ComprehensiveDestinationDetail | undefined {
  if (!idOrSlugOrName) return undefined;
  const query = idOrSlugOrName.toLowerCase().trim();

  // 1. Direct ID / Key match
  if (COMPREHENSIVE_DESTINATIONS_DATA[query]) {
    return COMPREHENSIVE_DESTINATIONS_DATA[query];
  }

  // 2. Slug / ID match in values
  const values = Object.values(COMPREHENSIVE_DESTINATIONS_DATA);
  const matched = values.find(
    dest =>
      dest.id.toLowerCase() === query ||
      dest.slug.toLowerCase() === query ||
      dest.name.toLowerCase() === query ||
      query.includes(dest.name.toLowerCase()) ||
      dest.name.toLowerCase().includes(query) ||
      query.includes(dest.slug.toLowerCase()) ||
      dest.slug.toLowerCase().includes(query)
  );

  if (matched) return matched;

  // 3. Fallback to first available if totally unknown
  return values[0];
}

