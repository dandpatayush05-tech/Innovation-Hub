import { supabase } from '../config/supabase';
import { getDrivingDistance, getFlyingDistance } from './distanceService';
import { TransportSearchParams, TransportOption, TransportProvider, Coordinate } from './transport/types';
import { FlightTransportProvider, BusTransportProvider, AutoTransportProvider } from './transport/providers';

interface TransportModeConfig {
  mode: 'flight' | 'bus' | 'auto';
  base_fare: number;
  rate_per_km: number;
  comfort_score: number;
  min_distance_km: number;
  max_distance_km: number;
}

const providers: TransportProvider[] = [
  new FlightTransportProvider(),
  new BusTransportProvider(),
  new AutoTransportProvider()
];

const DEFAULT_MODE_CONFIGS: TransportModeConfig[] = [
  { mode: 'flight', base_fare: 1500, rate_per_km: 4.5, comfort_score: 4.5, min_distance_km: 200, max_distance_km: 5000 },
  { mode: 'bus', base_fare: 250, rate_per_km: 1.8, comfort_score: 3.5, min_distance_km: 20, max_distance_km: 1500 },
  { mode: 'auto', base_fare: 50, rate_per_km: 12.0, comfort_score: 3.0, min_distance_km: 1, max_distance_km: 80 }
];

export const executeTransportSearch = async (from: Coordinate, to: Coordinate, date: string, passengers: number, sortBy: 'price' | 'comfort') => {
  // 1. Fetch Transport Mode configurations with graceful fallback
  const { data: modes } = await supabase.from('transport_modes').select('*');
  const modeConfigs = (modes && modes.length > 0) ? (modes as TransportModeConfig[]) : DEFAULT_MODE_CONFIGS;

  // 2. Calculate Distances
  const drivingPromise = getDrivingDistance(from, to);
  const flyingDistance = getFlyingDistance(from, to);
  
  const drivingDistance = await drivingPromise;

  const distances = {
    flight: flyingDistance,
    bus: drivingDistance,
    auto: drivingDistance
  };

  // 3. Gather Options
  const allOptions: TransportOption[] = [];

  for (const provider of providers) {
    const modeConfig = modeConfigs.find(m => m.mode === provider.mode);
    if (!modeConfig) continue;

    const distanceData = distances[provider.mode];
    
    // Eligibility Filter
    if (distanceData.distanceKm < modeConfig.min_distance_km || distanceData.distanceKm > modeConfig.max_distance_km) {
      continue;
    }

    // Prepare search params
    const searchParams: TransportSearchParams = {
      from,
      to,
      distanceKm: distanceData.distanceKm,
      durationMin: distanceData.durationMin,
      date,
      passengers
    };

    const options = await provider.getOptions(searchParams);

    // Dynamic Fare Calculation & Decoration
    for (const opt of options) {
      const calculatedFare = modeConfig.base_fare + (distanceData.distanceKm * modeConfig.rate_per_km);
      
      opt.fare = Number((calculatedFare * passengers).toFixed(2));
      opt.comfortScore = modeConfig.comfort_score;
      allOptions.push(opt);
    }
  }

  // 4. Sort Options
  if (sortBy === 'price') {
    allOptions.sort((a, b) => a.fare - b.fare);
  } else {
    allOptions.sort((a, b) => b.comfortScore - a.comfortScore || a.fare - b.fare);
  }

  return {
    distances,
    options: allOptions
  };
};
