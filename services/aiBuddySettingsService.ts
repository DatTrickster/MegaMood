import * as SecureStore from 'expo-secure-store';

const KEY_ENABLED = 'MEGAMOOD_AI_BUDDY_ENABLED';
const KEY_API_KEY = 'MEGAMOOD_AI_BUDDY_API_KEY';
const KEY_BASE_URL = 'MEGAMOOD_AI_BUDDY_BASE_URL';
const KEY_MODEL = 'MEGAMOOD_AI_BUDDY_MODEL';

const DEFAULT_BASE_URL = 'https://ollama.com';
const DEFAULT_MODEL = 'gpt-oss:120b';

export interface AIBuddySettings {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  model: string;
}

/**
 * Load AI Buddy settings from secure storage.
 */
export async function loadAIBuddySettings(): Promise<AIBuddySettings> {
  try {
    const [enabled, apiKey, baseUrl, model] = await Promise.all([
      SecureStore.getItemAsync(KEY_ENABLED),
      SecureStore.getItemAsync(KEY_API_KEY),
      SecureStore.getItemAsync(KEY_BASE_URL),
      SecureStore.getItemAsync(KEY_MODEL),
    ]);
    return {
      enabled: enabled === 'true',
      apiKey: apiKey ?? '',
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      model: model ?? DEFAULT_MODEL,
    };
  } catch {
    return {
      enabled: false,
      apiKey: '',
      baseUrl: DEFAULT_BASE_URL,
      model: DEFAULT_MODEL,
    };
  }
}

/**
 * Save AI Buddy settings to secure storage.
 */
export async function saveAIBuddySettings(settings: AIBuddySettings): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEY_ENABLED, settings.enabled ? 'true' : 'false'),
    settings.apiKey
      ? SecureStore.setItemAsync(KEY_API_KEY, settings.apiKey)
      : SecureStore.deleteItemAsync(KEY_API_KEY),
    SecureStore.setItemAsync(KEY_BASE_URL, settings.baseUrl || DEFAULT_BASE_URL),
    SecureStore.setItemAsync(KEY_MODEL, settings.model || DEFAULT_MODEL),
  ]);
}

/** Reset AI Buddy settings to default (used when destroying profile). */
export async function clearAIBuddySettings(): Promise<void> {
  await saveAIBuddySettings({
    enabled: false,
    apiKey: '',
    baseUrl: DEFAULT_BASE_URL,
    model: DEFAULT_MODEL,
  });
}
