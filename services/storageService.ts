import * as FileSystem from 'expo-file-system';
import type { User } from '../models/User';

const USER_FILE = 'user.json';

function getUserPath(): string {
  return `${FileSystem.documentDirectory}${USER_FILE}`;
}

/**
 * Load user profile from local JSON file (offline only).
 * Returns null if no profile exists (first launch).
 */
export async function loadUser(): Promise<User | null> {
  try {
    const path = getUserPath();
    const exists = await FileSystem.getInfoAsync(path, { getData: false });
    if (!exists.exists) return null;
    const content = await FileSystem.readAsStringAsync(path);
    const raw = JSON.parse(content) as Record<string, unknown>;
    // Backward compat: old profiles had "age", new ones have "dateOfBirth"
    if (raw.dateOfBirth == null && typeof raw.age === 'number') {
      const d = new Date();
      d.setFullYear(d.getFullYear() - raw.age);
      d.setMonth(0);
      d.setDate(1);
      raw.dateOfBirth = d.toISOString().slice(0, 10);
    }
    return raw as User;
  } catch {
    return null;
  }
}

/**
 * Save user profile to local JSON file (offline only).
 */
export async function saveUser(user: User): Promise<void> {
  const path = getUserPath();
  const toSave: User = {
    ...user,
    completedAt: user.completedAt || new Date().toISOString(),
  };
  const content = JSON.stringify(toSave, null, 2);
  await FileSystem.writeAsStringAsync(path, content);
}
