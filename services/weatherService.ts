/**
 * Open-Meteo weather API – free, no API key required.
 * https://open-meteo.com/
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface WeatherCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface WeatherDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface WeatherForecast {
  current: WeatherCurrent;
  daily: WeatherDaily;
  timezone: string;
}

export function weatherCodeLabel(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Drizzle',
    53: 'Drizzle',
    55: 'Drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Rain',
    71: 'Snow',
    73: 'Snow',
    75: 'Snow',
    77: 'Snow',
    80: 'Showers',
    81: 'Showers',
    82: 'Showers',
    85: 'Snow showers',
    86: 'Snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm',
  };
  return map[code] ?? 'Unknown';
}

const DEFAULT_LAT = 51.5074;
const DEFAULT_LON = -0.1278;

export async function fetchWeatherForecast(
  latitude: number = DEFAULT_LAT,
  longitude: number = DEFAULT_LON
): Promise<WeatherForecast | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
    });
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      current: data.current,
      daily: data.daily,
      timezone: data.timezone ?? 'auto',
    };
  } catch {
    return null;
  }
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  /** e.g. "Cape Town, South Africa" for list display */
  displayLabel?: string;
}

/** Map country_code to full name for display (e.g. ZA -> South Africa). */
const COUNTRY_NAMES: Record<string, string> = {
  ZA: 'South Africa',
  GB: 'United Kingdom',
  US: 'United States',
  AU: 'Australia',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  IN: 'India',
  KE: 'Kenya',
  NG: 'Nigeria',
  EG: 'Egypt',
  MA: 'Morocco',
  // add more as needed; API may also return full "country" field
};

function getCountryDisplay(countryCode: string | undefined, countryFull: string | undefined): string | undefined {
  if (countryFull && typeof countryFull === 'string') return countryFull;
  if (countryCode && COUNTRY_NAMES[countryCode]) return COUNTRY_NAMES[countryCode];
  return countryCode;
}

/** Search locations by name – returns list for autocomplete. Worldwide including South Africa. */
export async function searchLocations(query: string, count: number = 10): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  try {
    const params = new URLSearchParams({
      name: trimmed,
      count: String(Math.min(count, 15)),
      language: 'en',
    });
    const res = await fetch(`${GEOCODING_URL}?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results;
    if (!Array.isArray(results)) return [];
    return results.map((r: Record<string, unknown>) => {
      const country = getCountryDisplay(r.country_code as string, r.country as string);
      const name = (r.name as string) ?? trimmed;
      const displayLabel = country ? `${name}, ${country}` : name;
      return {
        name,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        country,
        displayLabel,
      };
    });
  } catch {
    return [];
  }
}

/** Resolve a city/location name to coordinates (first result). */
export async function geocodeLocation(name: string): Promise<GeocodingResult | null> {
  const list = await searchLocations(name, 1);
  return list.length > 0 ? list[0] : null;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

/** Reverse geocode coordinates to a city/location name (e.g. for "Use my location"). */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
      addressdetails: '1',
    });
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MegaMood/1.0' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
      display_name?: string;
    };
    const addr = data.address;
    if (!addr) return null;
    const city = addr.city ?? addr.town ?? addr.village ?? addr.state ?? '';
    const country = addr.country ?? '';
    const name = city && country ? `${city}, ${country}` : (data.display_name ?? 'Current location');
    return {
      name: city || 'Current location',
      latitude,
      longitude,
      country: country || undefined,
      displayLabel: name,
    };
  } catch {
    return null;
  }
}
