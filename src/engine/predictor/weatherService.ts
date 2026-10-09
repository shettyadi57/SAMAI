import { WeatherAlertFilter } from './types';

export interface LiveWeatherReport {
  isLive: boolean;
  filter: WeatherAlertFilter;
  temperatureC?: number;
  weatherCode?: number;
  conditionDescription: string;
  source: 'open-meteo' | 'offline-fallback';
  cityName: string;
  timestamp: string;
  error?: string;
}

/**
 * Maps WMO Weather Interpretation Codes to SURAKSH weather alert filters
 * WMO reference: 0 = Clear, 1-3 = Partly cloudy, 45/48 = Fog, 51-67 = Drizzle/Rain, 80-82 = Showers
 */
export function mapWmoCodeToFilter(code: number, isDay: number = 1): WeatherAlertFilter {
  if (code === 45 || code === 48) {
    return 'Fog';
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
    return 'Rain';
  }
  if (isDay === 0) {
    return 'Night';
  }
  return 'Clear';
}

export function getWmoDescription(code: number, isDay: number = 1): string {
  if (code === 0) return isDay ? 'Clear Sky' : 'Clear Night';
  if (code === 1 || code === 2 || code === 3) return isDay ? 'Partly Cloudy' : 'Overcast Night';
  if (code === 45 || code === 48) return 'Dense Fog / Mist';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Heavy Rainfall';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Normal Atmosphere';
}

/**
 * Fetches live weather from Open-Meteo with a graceful offline fallback
 */
export async function fetchLiveWeather(
  lat: number = 12.9716,
  lon: number = 77.5946,
  cityName: string = 'Bengaluru'
): Promise<LiveWeatherReport> {
  const fallbackReport: LiveWeatherReport = {
    isLive: false,
    filter: 'Clear',
    temperatureC: 25,
    conditionDescription: 'Standard Daytime (Offline Fallback)',
    source: 'offline-fallback',
    cityName,
    timestamp: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast responsiveness

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,is_day&timezone=auto`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    if (!current) {
      return fallbackReport;
    }

    const weatherCode = current.weather_code ?? 0;
    const isDay = current.is_day ?? 1;
    const temperatureC = Math.round(current.temperature_2m ?? 24);
    const filter = mapWmoCodeToFilter(weatherCode, isDay);
    const desc = getWmoDescription(weatherCode, isDay);

    return {
      isLive: true,
      filter,
      temperatureC,
      weatherCode,
      conditionDescription: `${desc} (${temperatureC}°C)`,
      source: 'open-meteo',
      cityName,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    // Graceful offline fallback without interrupting UI
    return {
      ...fallbackReport,
      error: err?.message || 'Network unreachable',
    };
  }
}
