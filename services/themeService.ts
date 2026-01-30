import { File, Paths } from 'expo-file-system';

export type AppearancePreference = 'system' | 'light' | 'dark';

const THEME_FILE = 'appearance.json';

function getThemeFile(): File {
  return new File(Paths.document, THEME_FILE);
}

/**
 * Load saved appearance preference. Defaults to 'system'.
 */
export async function getAppearance(): Promise<AppearancePreference> {
  try {
    const file = getThemeFile();
    if (!file.exists) return 'system';
    const content = await file.text();
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
  const file = getThemeFile();
  file.write(JSON.stringify({ preference }));
}
