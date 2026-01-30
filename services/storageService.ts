import { File, Paths } from 'expo-file-system';
import type { User } from '../models/User';
import { clearAllEventsAndNotes } from './eventsNotesStorage';
import { clearAIBuddySettings } from './aiBuddySettingsService';
import { clearWeatherLocationSettings } from './weatherLocationSettings';
import { clearMotivationData } from './motivationService';
import { clearGaiaChat } from './gaiaChatService';
import { clearAllPlannerItems } from './plannerStorage';

const USER_FILE = 'user.json';

function getUserFile(): File {
  return new File(Paths.document, USER_FILE);
}

/**
 * Load user profile from local JSON file (offline only).
 * Returns null if no profile exists (first launch).
 */
export async function loadUser(): Promise<User | null> {
  try {
    const file = getUserFile();
    if (!file.exists) return null;
    const content = await file.text();
    const raw = JSON.parse(content) as Record<string, unknown>;
    // Backward compat: old profiles had "age", new ones have "dateOfBirth"
    if (raw.dateOfBirth == null && typeof raw.age === 'number') {
      const d = new Date();
      d.setFullYear(d.getFullYear() - raw.age);
      d.setMonth(0);
      d.setDate(1);
      raw.dateOfBirth = d.toISOString().slice(0, 10);
    }
    return raw as unknown as User;
  } catch {
    return null;
  }
}

/**
 * Save user profile to local JSON file (offline only).
 */
export async function saveUser(user: User): Promise<void> {
  const toSave: User = {
    ...user,
    completedAt: user.completedAt || new Date().toISOString(),
  };
  const file = getUserFile();
  file.write(JSON.stringify(toSave, null, 2));
}

/**
 * Delete the user profile file. After this, loadUser() will return null.
 */
export async function deleteUser(): Promise<void> {
  try {
    const file = getUserFile();
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}

/**
 * Destroy all user data and reset the app to first launch state.
 * Deletes user profile, events/notes, AI settings, weather settings, motivation, and Gaia chat.
 */
export async function destroyAllUserData(): Promise<void> {
  await Promise.all([
    clearAllEventsAndNotes(),
    clearAIBuddySettings(),
    clearWeatherLocationSettings(),
    clearMotivationData(),
    clearGaiaChat(),
    clearAllPlannerItems(),
  ]);
  await deleteUser();
}
