import * as FileSystem from 'expo-file-system';

const FILE_NAME = 'weather_location.json';

function getPath(): string {
  return `${FileSystem.documentDirectory}${FILE_NAME}`;
}

export interface WeatherLocationSettings {
  usePreciseLocation: boolean;
  locationName: string;
  latitude: number;
  longitude: number;
}

const DEFAULT_LAT = 51.5074;
const DEFAULT_LON = -0.1278;

async function read(): Promise<WeatherLocationSettings> {
  try {
    const path = getPath();
    const exists = await FileSystem.getInfoAsync(path);
    if (!exists.exists) {
      return {
        usePreciseLocation: false,
        locationName: 'London',
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LON,
      };
    }
    const raw = await FileSystem.readAsStringAsync(path);
    const parsed = JSON.parse(raw);
    return {
      usePreciseLocation: parsed.usePreciseLocation === true,
      locationName: typeof parsed.locationName === 'string' ? parsed.locationName : 'London',
      latitude: typeof parsed.latitude === 'number' ? parsed.latitude : DEFAULT_LAT,
      longitude: typeof parsed.longitude === 'number' ? parsed.longitude : DEFAULT_LON,
    };
  } catch {
    return {
      usePreciseLocation: false,
      locationName: 'London',
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LON,
    };
  }
}

async function write(settings: WeatherLocationSettings): Promise<void> {
  await FileSystem.writeAsStringAsync(getPath(), JSON.stringify(settings));
}

export async function loadWeatherLocationSettings(): Promise<WeatherLocationSettings> {
  return read();
}

export async function saveWeatherLocationSettings(
  settings: Partial<WeatherLocationSettings>
): Promise<void> {
  const current = await read();
  const next: WeatherLocationSettings = {
    usePreciseLocation: settings.usePreciseLocation ?? current.usePreciseLocation,
    locationName: settings.locationName ?? current.locationName,
    latitude: settings.latitude ?? current.latitude,
    longitude: settings.longitude ?? current.longitude,
  };
  await write(next);
}
