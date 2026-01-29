import * as FileSystem from 'expo-file-system';

const FILE_NAME = 'weather_location.json';

function getPath(): string {
  return `${FileSystem.documentDirectory}${FILE_NAME}`;
}

export interface WeatherLocationSettings {
  /** When false, weather is off and location/precision are treated as disabled. */
  weatherEnabled: boolean;
  usePreciseLocation: boolean;
  locationName: string;
  latitude: number;
  longitude: number;
}

async function read(): Promise<WeatherLocationSettings> {
  try {
    const path = getPath();
    const exists = await FileSystem.getInfoAsync(path);
    if (!exists.exists) {
      return {
        weatherEnabled: true,
        usePreciseLocation: false,
        locationName: '',
        latitude: 0,
        longitude: 0,
      };
    }
    const raw = await FileSystem.readAsStringAsync(path);
    const parsed = JSON.parse(raw);
    return {
      weatherEnabled: parsed.weatherEnabled !== false,
      usePreciseLocation: parsed.usePreciseLocation === true,
      locationName: typeof parsed.locationName === 'string' ? parsed.locationName : '',
      latitude: typeof parsed.latitude === 'number' ? parsed.latitude : 0,
      longitude: typeof parsed.longitude === 'number' ? parsed.longitude : 0,
    };
  } catch {
    return {
      weatherEnabled: true,
      usePreciseLocation: false,
      locationName: '',
      latitude: 0,
      longitude: 0,
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
  const weatherEnabled = settings.weatherEnabled ?? current.weatherEnabled;
  const next: WeatherLocationSettings = {
    weatherEnabled,
    usePreciseLocation: weatherEnabled ? (settings.usePreciseLocation ?? current.usePreciseLocation) : false,
    locationName: settings.locationName ?? current.locationName,
    latitude: settings.latitude ?? current.latitude,
    longitude: settings.longitude ?? current.longitude,
  };
  await write(next);
}

/** Reset weather/location settings to default (used when destroying profile). */
export async function clearWeatherLocationSettings(): Promise<void> {
  await write({
    weatherEnabled: true,
    usePreciseLocation: false,
    locationName: '',
    latitude: 0,
    longitude: 0,
  });
}
