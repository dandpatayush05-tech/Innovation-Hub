import { ApiError } from '../../utils/ApiError';

interface WeatherCacheEntry {
  data: any;
  expiresAt: number;
}

const weatherCache = new Map<string, WeatherCacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const getWeatherForDestination = async (latitude: number, longitude: number) => {
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(response.status === 429 ? 429 : 502, `Weather API failed with status ${response.status}`, 'BAD_GATEWAY');
    }
    const data = await response.json();
    
    if (!data.current_weather) {
      throw new ApiError(502, 'Weather API returned malformed data', 'BAD_GATEWAY');
    }

    const { temperature, windspeed, weathercode } = data.current_weather;
    
    const forecast = data.daily?.time.map((time: string, index: number) => ({
      date: time,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      condition: mapWeatherCode(data.daily.weathercode[index])
    })) || [];

    const weatherData = {
      current: {
        temperature,
        windspeed,
        condition: mapWeatherCode(weathercode)
      },
      forecast
    };

    weatherCache.set(cacheKey, {
      data: weatherData,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return weatherData;
  } catch (error: any) {
    console.error('Failed to fetch weather:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'Failed to fetch weather from external provider', 'BAD_GATEWAY');
  }
};

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const mapWeatherCode = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing Rain';
  if (code >= 71 && code <= 75) return 'Snow fall';
  if (code === 77) return 'Snow grains';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code >= 96 && code <= 99) return 'Thunderstorm with hail';
  return 'Unknown';
};
