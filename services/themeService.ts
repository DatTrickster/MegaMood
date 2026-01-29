import * as FileSystem from 'expo-file-system';

export type AppearancePreference = 'system' | 'light' | 'dark';

const THEME_FILE = 'appearance.json';

function getThemePath(): string {
  return `${FileSystem.documentDirectory}${THEME_FILE}`;
}

/**
 * Load saved appearance preference. Defaults to 'system'.
 */
export async function getAppearance(): Promise<AppearancePreference> {
  try {
    const path = getThemePath();
    const exists = await FileSystem.getInfoAsync(path, { getData: false });
    if (!exists.exists) return 'system';
    const content = await FileSystem.readAsStringAsync(path);
    const raw = JSON.parse(content) as { preference?: string };
    if (raw.preference === 'light' || raw.preference === 'dark' || raw.preference === 'system') {
      return raw.preference;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

/**
 * Save appearance preference.
 */
export async function setAppearance(preference: AppearancePreference): Promise<void> {
  const path = getThemePath();
  await FileSystem.writeAsStringAsync(path, JSON.stringify({ preference }));
}
