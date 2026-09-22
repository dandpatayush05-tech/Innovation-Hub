import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DestinationSeed {
  name: string;
  country: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  tags: string[];
}

interface AirportSeed {
  iata_code: string;
  icao_code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  terminal_info: any;
  facilities: any;
  is_nearest_hub: boolean;
  hub_type: 'co-located' | 'nearest_practical';
  connectivity_notes: string;
}

interface RailSeed {
  station_code: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  is_nearest_hub: boolean;
  hub_type: 'co-located' | 'nearest_practical';
  connectivity_notes: string;
}

interface BusSeed {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  is_nearest_hub: boolean;
  hub_type: 'co-located' | 'nearest_practical';
  connectivity_notes: string;
}

interface HubMapping {
  destinationName: string;
  destinationData: DestinationSeed;
  airport: AirportSeed;
  rail: RailSeed;
  bus: BusSeed;
  connectivity_summary: any;
}

const HUB_DATA: HubMapping[] = [
  // 1. Jaipur
  {
    destinationName: 'Jaipur',
    destinationData: {
      name: 'Jaipur',
      country: 'India',
      description: 'The Pink City of Rajasthan, renowned for magnificent hill forts, royal palaces, vibrant bazaars, and heritage architecture.',
      image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
      latitude: 26.9124,
      longitude: 75.7873,
      tags: ['heritage', 'forts', 'culture', 'palaces', 'shopping']
    },
    airport: {
      iata_code: 'JAI',
      icao_code: 'VIJP',
      name: 'Jaipur International Airport (Sanganer)',
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      latitude: 26.8242,
      longitude: 75.8122,
      terminal_info: {
        terminals: ['Terminal 1 (International)', 'Terminal 2 (Domestic)'],
        annual_capacity: '5 Million passengers'
      },
      facilities: {
        wifi: true,
        lounges: ['Primus Lounge', 'Club One Class Lounge'],
        prepaid_taxi: true,
        car_rentals: true,
        currency_exchange: true
      },
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Direct co-located international airport ~12km south of Jaipur city center in Sanganer.'
    },
    rail: {
      station_code: 'JP',
      name: 'Jaipur Junction Railway Station',
      city: 'Jaipur',
      latitude: 26.9201,
      longitude: 75.7878,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Major divisional headquarters station with direct Vande Bharat, Shatabdi, and Superfast express trains to Delhi, Mumbai, Ahmedabad, and Kolkata.'
    },
    bus: {
      name: 'Jaipur Central Bus Stand (Sindhi Camp ISBT)',
      city: 'Jaipur',
      latitude: 26.9248,
      longitude: 75.7997,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Central inter-state terminal hosting RSRTC Goldline, Volvo, and express departures across Rajasthan, Delhi, Haryana, and Gujarat.'
    },
    connectivity_summary: {
      direct_airport: true,
      direct_rail: true,
      direct_road: true,
      nearest_airport_distance_km: 12,
      nearest_rail_distance_km: 2,
      nearest_bus_distance_km: 1
    }
  },

  // 2. Varanasi
  {
    destinationName: 'Varanasi',
    destinationData: {
      name: 'Varanasi',
      country: 'India',
      description: 'The spiritual capital of India along the sacred ghats of the Ganges with ancient rituals, timeless silk weaving, and evening Ganga Aarti.',
      image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
      latitude: 25.3176,
      longitude: 82.9739,
      tags: ['spiritual', 'ghats', 'ancient', 'ganga', 'heritage', 'temples']
    },
    airport: {
      iata_code: 'VNS',
      icao_code: 'VEBN',
      name: 'Lal Bahadur Shastri International Airport (Babatpur)',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India',
      latitude: 25.4524,
      longitude: 82.8593,
      terminal_info: {
        terminals: ['Integrated Passenger Terminal (Domestic & International)'],
        aerobridges: 4
      },
      facilities: {
        wifi: true,
        lounges: ['Take Off Bar & Lounge'],
        prepaid_taxi: true,
        currency_exchange: true,
        child_care: true
      },
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Direct co-located airport in Babatpur, ~26km northwest of Varanasi city center connected via 4-lane highway.'
    },
    rail: {
      station_code: 'BSB',
      name: 'Varanasi Junction (Varanasi Cantt) & Pt. Deen Dayal Upadhyaya (DDU)',
      city: 'Varanasi',
      latitude: 25.3283,
      longitude: 82.9866,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Dual railhead hub: Varanasi Junction (BSB) in city center, plus Pt. Deen Dayal Upadhyaya Junction (DDU, 16km) for Grand Trunk high-speed trains.'
    },
    bus: {
      name: 'Varanasi Cantt Bus Station (Chaudhary Charan Singh Bus Stand)',
      city: 'Varanasi',
      latitude: 25.3308,
      longitude: 82.9847,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'UPSRTC central terminal opposite Varanasi Cantt Railway Station connecting Lucknow, Prayagraj, Ayodhya, Patna, and Gorakhpur.'
    },
    connectivity_summary: {
      direct_airport: true,
      direct_rail: true,
      direct_road: true,
      nearest_airport_distance_km: 26,
      nearest_rail_distance_km: 3,
      nearest_bus_distance_km: 3
    }
  },

  // 3. Manali
  {
    destinationName: 'Manali',
    destinationData: {
      name: 'Manali',
      country: 'India',
      description: 'Himalayan resort valley renowned for pine forests, Solang Valley winter sports, Rohtang snow pass, and Beas river adventure trails.',
      image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop',
      latitude: 32.2432,
      longitude: 77.1892,
      tags: ['mountains', 'snow', 'adventure', 'himalayas', 'trekking', 'nature']
    },
    airport: {
      iata_code: 'KUU',
      icao_code: 'VIBR',
      name: 'Kullu-Manali Airport (Bhuntar)',
      city: 'Bhuntar / Kullu',
      state: 'Himachal Pradesh',
      country: 'India',
      latitude: 31.8767,
      longitude: 77.1542,
      terminal_info: {
        terminals: ['Domestic Mountain Terminal'],
        aircraft_compatibility: ['ATR-72', 'Alliance Air Dornier']
      },
      facilities: {
        prepaid_taxi: true,
        tourist_information_desk: true,
        cafe: true
      },
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'Nearest practical airport, not co-located (~50km south of Manali via NH3, approx 1.5 - 2 hours mountain road). Operations subject to weather.'
    },
    rail: {
      station_code: 'CDG',
      name: 'Chandigarh Junction / Kalka (Nearest Major Railheads)',
      city: 'Chandigarh / Kalka',
      latitude: 30.7051,
      longitude: 76.8214,
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'No direct rail to Manali. Nearest broad-gauge railheads are Chandigarh (CDG, ~310km) or Kalka (KLK, ~285km) with onward scenic hill road transfer (8-9 hours).'
    },
    bus: {
      name: 'Manali Private & HRTC Volvo Bus Stand (Bhuntar-Manali Highway)',
      city: 'Manali',
      latitude: 32.2396,
      longitude: 77.1887,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Primary gateway terminal for overnight super-luxury Volvo and Scania buses from Delhi (ISBT Kashmiri Gate) and Chandigarh Sector 43.'
    },
    connectivity_summary: {
      direct_airport: false,
      direct_rail: false,
      direct_road: true,
      airport_hub_type: 'nearest_practical',
      rail_hub_type: 'nearest_practical',
      nearest_airport_distance_km: 50,
      nearest_rail_distance_km: 310,
      nearest_bus_distance_km: 1
    }
  },

  // 4. Leh-Ladakh
  {
    destinationName: 'Leh-Ladakh',
    destinationData: {
      name: 'Leh-Ladakh',
      country: 'India',
      description: 'High-altitude moonscape desert in the Trans-Himalayas, home to ancient Buddhist gompas, Pangong Tso azure lake, and Khardung La pass.',
      image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop',
      latitude: 34.1526,
      longitude: 77.5771,
      tags: ['ladakh', 'himalayas', 'buddhism', 'monastery', 'lakes', 'biking']
    },
    airport: {
      iata_code: 'IXL',
      icao_code: 'VILH',
      name: 'Kushok Bakula Rimpochee Airport',
      city: 'Leh',
      state: 'Ladakh',
      country: 'India',
      latitude: 34.1359,
      longitude: 77.5465,
      terminal_info: {
        terminals: ['High-Altitude Passenger Terminal (3,256m ASL)'],
        military_civilian_enclave: true
      },
      facilities: {
        oxygen_assistance: true,
        medical_room: true,
        prepaid_taxi: true,
        acclimatization_guidance_desk: true
      },
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'Nearest practical airport, high-altitude airport (3,256m). Daily morning flights from Delhi, Mumbai, Jammu. Mandatory 24-48 hr rest acclimatization recommended upon arrival.'
    },
    rail: {
      station_code: 'JAT',
      name: 'Jammu Tawi / Udhampur (Nearest Railheads to Ladakh)',
      city: 'Jammu',
      latitude: 32.7061,
      longitude: 74.8804,
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'No direct rail to Leh. Nearest functional broad-gauge stations are Jammu Tawi (JAT, ~700km via Srinagar) or Chandigarh (~750km via Manali, seasonal Jun-Oct).'
    },
    bus: {
      name: 'Leh New Bus Stand (JKSRTC / HPTDC Terminal)',
      city: 'Leh',
      latitude: 34.1481,
      longitude: 77.5756,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Central dispatch yard for local Ladakh minibuses to Nubra and Pangong, as well as long-distance mountain cruisers to Srinagar and Manali.'
    },
    connectivity_summary: {
      direct_airport: true,
      direct_rail: false,
      direct_road: true,
      airport_hub_type: 'nearest_practical',
      rail_hub_type: 'nearest_practical',
      nearest_airport_distance_km: 5,
      nearest_rail_distance_km: 700,
      nearest_bus_distance_km: 2
    }
  },

  // 5. Munnar
  {
    destinationName: 'Munnar',
    destinationData: {
      name: 'Munnar',
      country: 'India',
      description: 'Idyllic misty hill station nestled in the Western Ghats surrounded by undulating tea plantations, Anamudi peak, and cascading waterfalls.',
      image_url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop',
      latitude: 10.0889,
      longitude: 77.0595,
      tags: ['hills', 'tea-gardens', 'western-ghats', 'nature', 'waterfalls', 'wildlife']
    },
    airport: {
      iata_code: 'COK',
      icao_code: 'VOCI',
      name: 'Cochin International Airport (Nedumbassery - Munnar Gateway)',
      city: 'Nedumbassery / Kochi',
      state: 'Kerala',
      country: 'India',
      latitude: 10.1518,
      longitude: 76.3930,
      terminal_info: {
        terminals: ['Terminal 1 (Domestic)', 'Terminal 3 (International)'],
        world_solar_pioneer: true
      },
      facilities: {
        wifi: true,
        lounges: ['Earth Lounge'],
        prepaid_taxi: true,
        car_rentals: true,
        kerala_tourism_desk: true
      },
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'Nearest practical airport, not co-located (~110km from Munnar via scenic mountain NH85, approx 3.5 to 4 hours driving time).'
    },
    rail: {
      station_code: 'AWY',
      name: 'Aluva (Alwaye) & Ernakulam Junction (ERS)',
      city: 'Aluva / Kochi',
      latitude: 10.1086,
      longitude: 76.3533,
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'No direct rail to Munnar hills. Nearest major railway hubs are Aluva (AWY, ~110km) and Ernakulam Junction (ERS, ~130km) with direct road transport onward.'
    },
    bus: {
      name: 'Munnar KSRTC Bus Stand (Old Munnar / Central)',
      city: 'Munnar',
      latitude: 10.0765,
      longitude: 77.0601,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'State transport station with regular mountain bus services connecting Kochi, Aluva, Kottayam, Madurai, and Coimbatore.'
    },
    connectivity_summary: {
      direct_airport: false,
      direct_rail: false,
      direct_road: true,
      airport_hub_type: 'nearest_practical',
      rail_hub_type: 'nearest_practical',
      nearest_airport_distance_km: 110,
      nearest_rail_distance_km: 110,
      nearest_bus_distance_km: 1
    }
  },

  // 6. Alleppey (Alappuzha)
  {
    destinationName: 'Alleppey',
    destinationData: {
      name: 'Alleppey',
      country: 'India',
      description: 'The Venice of the East, famed for serene palm-fringed backwater lagoons, traditional houseboat cruises, and golden Arabian sea beaches.',
      image_url: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&auto=format&fit=crop',
      latitude: 9.4981,
      longitude: 76.3388,
      tags: ['backwaters', 'houseboat', 'beaches', 'kerala', 'ayurveda', 'coastal']
    },
    airport: {
      iata_code: 'COK',
      icao_code: 'VOCI',
      name: 'Cochin International Airport (Nedumbassery - Alleppey Gateway)',
      city: 'Nedumbassery / Kochi',
      state: 'Kerala',
      country: 'India',
      latitude: 10.1518,
      longitude: 76.3930,
      terminal_info: {
        terminals: ['Terminal 1 (Domestic)', 'Terminal 3 (International)'],
        distance_to_alleppey: '85 km'
      },
      facilities: {
        prepaid_taxi: true,
        uber_ola_kiosks: true,
        tourism_information: true
      },
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'Nearest practical airport, not co-located (~85km north of Alleppey via NH66, approx 2 to 2.5 hours by taxi/highway bus).'
    },
    rail: {
      station_code: 'ALLP',
      name: 'Alappuzha (Alleppey) Railway Station',
      city: 'Alappuzha',
      latitude: 9.4899,
      longitude: 76.3235,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Direct co-located seaside railway station on Ernakulam-Kayamkulam coastal line with daily express trains to Chennai, Bangalore, and Mumbai.'
    },
    bus: {
      name: 'Alappuzha KSRTC Bus Station (Boat Jetty Road)',
      city: 'Alappuzha',
      latitude: 9.4983,
      longitude: 76.3411,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'KSRTC bus station situated adjacent to the backwater boat jetty, enabling direct transfers between intercity buses and tourist houseboats.'
    },
    connectivity_summary: {
      direct_airport: false,
      direct_rail: true,
      direct_road: true,
      airport_hub_type: 'nearest_practical',
      nearest_airport_distance_km: 85,
      nearest_rail_distance_km: 2,
      nearest_bus_distance_km: 1
    }
  },

  // 7. Agra
  {
    destinationName: 'Agra',
    destinationData: {
      name: 'Agra',
      country: 'India',
      description: 'City of the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri, showcasing the pinnacle of Mughal architectural and cultural grandeur.',
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop',
      latitude: 27.1767,
      longitude: 78.0081,
      tags: ['unesco', 'heritage', 'monuments', 'taj-mahal', 'mughal', 'history']
    },
    airport: {
      iata_code: 'AGR',
      icao_code: 'VIAG',
      name: 'Agra Airport (Kheria Air Force Station)',
      city: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India',
      latitude: 27.1558,
      longitude: 77.9609,
      terminal_info: {
        terminals: ['Civil Enclave Passenger Terminal'],
        defense_civilian_shared: true
      },
      facilities: {
        prepaid_cab: true,
        tourist_guidance: true,
        high_security: true
      },
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Co-located domestic airport and IAF military airbase ~5km from Agra city center with scheduled regional flights.'
    },
    rail: {
      station_code: 'AGC',
      name: 'Agra Cantt & Agra Fort Railway Stations',
      city: 'Agra',
      latitude: 27.1587,
      longitude: 77.9892,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Prime railway junction on Delhi-Mumbai trunk route. Serviced by high-speed Gatimaan Express and Vande Bharat (1h 40m from New Delhi).'
    },
    bus: {
      name: 'ISBT Agra (Transport Nagar / Idgah Bus Stand)',
      city: 'Agra',
      latitude: 27.2081,
      longitude: 77.9625,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Modern multi-bay ISBT terminal right on Yamuna Expressway and NH19, operating AC Volvo buses to Delhi, Jaipur, Lucknow, and Mathura.'
    },
    connectivity_summary: {
      direct_airport: true,
      direct_rail: true,
      direct_road: true,
      nearest_airport_distance_km: 7,
      nearest_rail_distance_km: 3,
      nearest_bus_distance_km: 5
    }
  },

  // 8. Rishikesh
  {
    destinationName: 'Rishikesh',
    destinationData: {
      name: 'Rishikesh',
      country: 'India',
      description: 'The Yoga Capital of the World on the foothills of the Himalayas, famed for Lakshman Jhula, Ganges white-water rafting, and ashrams.',
      image_url: 'https://images.unsplash.com/photo-1599818818451-248c8bcf0407?w=800&auto=format&fit=crop',
      latitude: 30.0869,
      longitude: 78.2676,
      tags: ['yoga', 'spiritual', 'rafting', 'ganga', 'ashrams', 'adventure']
    },
    airport: {
      iata_code: 'DED',
      icao_code: 'VIDN',
      name: 'Dehradun Jolly Grant Airport',
      city: 'Dehradun / Rishikesh',
      state: 'Uttarakhand',
      country: 'India',
      latitude: 30.1897,
      longitude: 78.1803,
      terminal_info: {
        terminals: ['New Integrated Domestic Terminal'],
        annual_capacity: '2.4 Million passengers'
      },
      facilities: {
        wifi: true,
        prepaid_taxi: true,
        food_court: true,
        atm: true
      },
      is_nearest_hub: true,
      hub_type: 'nearest_practical',
      connectivity_notes: 'Nearest practical airport, not co-located (~21km northwest of Rishikesh via Dehradun-Rishikesh Highway, approx 35-45 mins by taxi).'
    },
    rail: {
      station_code: 'YNRK',
      name: 'Yog Nagari Rishikesh (YNRK) & Haridwar Junction (HW)',
      city: 'Rishikesh / Haridwar',
      latitude: 30.0984,
      longitude: 78.2912,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Modern Yog Nagari Rishikesh (YNRK) terminal station serves the Char Dham railway project, supplemented by major junction Haridwar (HW, 25km).'
    },
    bus: {
      name: 'Rishikesh UTC & Sanyukt Yatra Bus Stand (Natraj Chowk / Haridwar Road)',
      city: 'Rishikesh',
      latitude: 30.1032,
      longitude: 78.2884,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'UTC and private Volvo bus terminal operating non-stop services to Delhi ISBT Kashmiri Gate, Dehradun, and onward mountain routes.'
    },
    connectivity_summary: {
      direct_airport: false,
      direct_rail: true,
      direct_road: true,
      airport_hub_type: 'nearest_practical',
      nearest_airport_distance_km: 21,
      nearest_rail_distance_km: 2,
      nearest_bus_distance_km: 1
    }
  },

  // 9. Udaipur
  {
    destinationName: 'Udaipur',
    destinationData: {
      name: 'Udaipur',
      country: 'India',
      description: 'The City of Lakes and Venice of the East, famed for Lake Pichola, City Palace, Jag Mandir, romantic sunsets, and Rajputana heritage.',
      image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop',
      latitude: 24.5854,
      longitude: 73.7125,
      tags: ['lakes', 'romance', 'palaces', 'culture', 'heritage', 'luxury']
    },
    airport: {
      iata_code: 'UDR',
      icao_code: 'VAUD',
      name: 'Maharana Pratap Airport (Dabok)',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      latitude: 24.6177,
      longitude: 73.8961,
      terminal_info: {
        terminals: ['Integrated Domestic Passenger Terminal'],
        aerobridges: 2
      },
      facilities: {
        handicrafts_store: true,
        prepaid_cab: true,
        restaurant: true,
        vip_lounge: true
      },
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Co-located domestic airport in Dabok, ~22km east of Udaipur city center with daily direct flights from Delhi, Mumbai, Jaipur, and Bangalore.'
    },
    rail: {
      station_code: 'UDZ',
      name: 'Udaipur City Railway Station',
      city: 'Udaipur',
      latitude: 24.5701,
      longitude: 73.6978,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'Terminus station for daily superfast and luxury tourist trains including Mewar Express, Chetak Express, and Vande Bharat to Jaipur/Delhi.'
    },
    bus: {
      name: 'Udaipur Central Bus Stand (Udiapole ISBT)',
      city: 'Udaipur',
      latitude: 24.5772,
      longitude: 73.7001,
      is_nearest_hub: false,
      hub_type: 'co-located',
      connectivity_notes: 'RSRTC central depot situated at Udiapole with extensive day and sleeper Volvo connectivity to Ahmedabad, Jaipur, Jodhpur, and Mumbai.'
    },
    connectivity_summary: {
      direct_airport: true,
      direct_rail: true,
      direct_road: true,
      nearest_airport_distance_km: 22,
      nearest_rail_distance_km: 2,
      nearest_bus_distance_km: 1
    }
  }
];

async function seedTransportHubs() {
  console.log('=== Seeding Transport Hubs & Connectivity (9 Destinations) ===\n');

  // Step 1: Ensure each destination exists and get its UUID
  const destinationMap = new Map<string, string>();

  for (const hub of HUB_DATA) {
    // Check if destination exists by name
    const { data: existing } = await supabase
      .from('destinations')
      .select('id, name')
      .or(`name.ilike.%${hub.destinationName}%,name.eq.${hub.destinationData.name}`)
      .limit(1);

    let destinationId: string;

    if (existing && existing.length > 0) {
      destinationId = existing[0].id;
      // Update destination details
      await supabase
        .from('destinations')
        .update({
          name: hub.destinationData.name,
          country: hub.destinationData.country,
          description: hub.destinationData.description,
          image_url: hub.destinationData.image_url,
          latitude: hub.destinationData.latitude,
          longitude: hub.destinationData.longitude,
          tags: hub.destinationData.tags,
          connectivity_notes: hub.connectivity_summary
        })
        .eq('id', destinationId);
      console.log(`[Destination] Updated existing: ${hub.destinationName} (${destinationId})`);
    } else {
      // Insert new destination
      const { data: inserted, error: insErr } = await supabase
        .from('destinations')
        .insert({
          ...hub.destinationData,
          connectivity_notes: hub.connectivity_summary
        })
        .select('id')
        .single();

      if (insErr || !inserted) {
        throw new Error(`Failed to insert destination ${hub.destinationName}: ${insErr?.message}`);
      }
      destinationId = inserted.id;
      console.log(`[Destination] Created new: ${hub.destinationName} (${destinationId})`);
    }

    destinationMap.set(hub.destinationName, destinationId);
  }

  // Step 2: Clear existing hub table rows to ensure idempotent clean seed
  console.log('\nCleaning existing hub table entries...');
  await supabase.from('airports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('railway_stations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bus_stations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Step 3: Insert Airports, Railway Stations, Bus Stations & Link back to Destinations
  console.log('\nInserting Transport Hubs for 9 destinations...');

  for (const hub of HUB_DATA) {
    const destId = destinationMap.get(hub.destinationName);
    if (!destId) continue;

    // 1. Insert Airport
    const { data: airportRow, error: airErr } = await supabase
      .from('airports')
      .insert({
        ...hub.airport,
        destination_id: destId
      })
      .select('id')
      .single();

    if (airErr) console.error(`Error inserting airport for ${hub.destinationName}:`, airErr.message);

    // 2. Insert Railway Station
    const { data: railRow, error: railErr } = await supabase
      .from('railway_stations')
      .insert({
        ...hub.rail,
        destination_id: destId
      })
      .select('id')
      .single();

    if (railErr) console.error(`Error inserting railway station for ${hub.destinationName}:`, railErr.message);

    // 3. Insert Bus Station
    const { data: busRow, error: busErr } = await supabase
      .from('bus_stations')
      .insert({
        ...hub.bus,
        destination_id: destId
      })
      .select('id')
      .single();

    if (busErr) console.error(`Error inserting bus station for ${hub.destinationName}:`, busErr.message);

    // 4. Link nearest IDs in destinations table
    if (airportRow?.id && railRow?.id && busRow?.id) {
      await supabase
        .from('destinations')
        .update({
          nearest_airport_id: airportRow.id,
          nearest_railway_station_id: railRow.id,
          nearest_bus_station_id: busRow.id,
          connectivity_notes: hub.connectivity_summary
        })
        .eq('id', destId);
    }

    console.log(`✓ Seeded & linked hubs for: ${hub.destinationName} [Airport: ${hub.airport.iata_code}, Rail: ${hub.rail.station_code}, Bus: ${hub.bus.city}]`);
  }

  // Step 4: Verify and Print Final Row Counts
  console.log('\n=== Verification: Final Row Counts ===');
  const { count: airCount } = await supabase.from('airports').select('*', { count: 'exact', head: true });
  const { count: railCount } = await supabase.from('railway_stations').select('*', { count: 'exact', head: true });
  const { count: busCount } = await supabase.from('bus_stations').select('*', { count: 'exact', head: true });
  const { count: destCount } = await supabase.from('destinations').select('*', { count: 'exact', head: true });

  console.log(`- Destinations: ${destCount}`);
  console.log(`- Airports: ${airCount}`);
  console.log(`- Railway Stations: ${railCount}`);
  console.log(`- Bus Stations: ${busCount}`);

  // Fetch sample to verify "nearest_practical" flags
  const { data: practicalAirports } = await supabase
    .from('airports')
    .select('iata_code, name, city, hub_type, connectivity_notes')
    .eq('hub_type', 'nearest_practical');

  console.log('\n=== Nearest Practical (Non-Colocated) Airports Verified: ===');
  practicalAirports?.forEach(a => {
    console.log(`• [${a.iata_code}] ${a.name} (${a.city}) -> ${a.hub_type} | Notes: ${a.connectivity_notes}`);
  });
}

seedTransportHubs()
  .then(() => {
    console.log('\nTransport Hub seeding completed successfully.');
    setTimeout(() => process.exit(0), 200);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    setTimeout(() => process.exit(1), 200);
  });
