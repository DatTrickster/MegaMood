import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../models/User';
import { loadAIBuddySettings } from './aiBuddySettingsService';
import { loadGaiaChat } from './gaiaChatService';

const MOTIVATION_FILE = 'daily_motivation.json';
const KEY_DAILY_MOTIVATION_ENABLED = 'MEGAMOOD_DAILY_MOTIVATION_ENABLED';
const DAILY_MOTIVATION_NOTIFICATION_ID = 'daily-motivation-gaia';

function getPath(): string {
  return `${FileSystem.documentDirectory}${MOTIVATION_FILE}`;
}

export interface MotivationCache {
  date: string; // YYYY-MM-DD
  text: string;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Opt-in: daily motivation section and push notification. Default false. */
export async function getDailyMotivationEnabled(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(KEY_DAILY_MOTIVATION_ENABLED);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setDailyMotivationEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEY_DAILY_MOTIVATION_ENABLED, enabled ? 'true' : 'false');
}

export async function getMotivationForToday(): Promise<string | null> {
  try {
    const path = getPath();
    const exists = await FileSystem.getInfoAsync(path);
    if (!exists.exists) return null;
    const raw = await FileSystem.readAsStringAsync(path);
    const parsed = JSON.parse(raw) as MotivationCache;
    const today = formatDateKey(new Date());
    if (parsed.date !== today) return null;
    return parsed.text ?? null;
  } catch {
    return null;
  }
}

async function saveMotivationForToday(text: string): Promise<void> {
  const today = formatDateKey(new Date());
  await FileSystem.writeAsStringAsync(
    getPath(),
    JSON.stringify({ date: today, text })
  );
}

async function fetchOllamaReply(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  const base = baseUrl.replace(/\/$/, '');
  const url = base.endsWith('/api') ? `${base}/chat` : `${base}/api/chat`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ model: model || 'gpt-oss:120b', messages, stream: false }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch a short daily motivation from AI based on user persona, goals, and optional chat context.
 * Saves result for today and returns it.
 */
export async function fetchAndSaveMotivationForToday(user: User): Promise<string | null> {
  const settings = await loadAIBuddySettings();
  if (!settings.enabled || !settings.apiKey.trim()) return null;

  const chatMessages = await loadGaiaChat();
  const recentContext =
    chatMessages.length > 0
      ? chatMessages
          .slice(-6)
          .map((m) => `${m.role}: ${m.content.slice(0, 120)}${m.content.length > 120 ? '…' : ''}`)
          .join('\n')
      : '';

  const goals = user.lifestyleGoals?.length ? user.lifestyleGoals.join(', ') : 'general wellness';
  const prompt = `You are Gaia, a supportive in-app assistant. Write exactly one short motivational statement (2–3 sentences max) for ${user.preferredUsername} for today. Use their name. Consider their lifestyle goals: ${goals}. Keep it warm, specific to their goals, and actionable. Do not use markdown or quotes.${recentContext ? `\n\nRecent chat context (for tone only):\n${recentContext}` : ''}`;

  const reply = await fetchOllamaReply(
    settings.baseUrl,
    settings.apiKey,
    settings.model,
    [{ role: 'user', content: prompt }]
  );

  if (reply) {
    await saveMotivationForToday(reply);
    const enabled = await getDailyMotivationEnabled();
    if (enabled) {
      await scheduleMotivationNotification(reply);
    }
    return reply;
  }
  return null;
}

/** Schedule a one-time local notification with today's motivation (only when opt-in is enabled). */
async function scheduleMotivationNotification(motivationText: string): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.cancelScheduledNotificationAsync(DAILY_MOTIVATION_NOTIFICATION_ID);

    const body = motivationText.length > 200 ? motivationText.slice(0, 197) + '…' : motivationText;
    const trigger = new Date();
    const hour = trigger.getHours();
    const minute = trigger.getMinutes();
    if (hour < 9 || (hour === 9 && minute === 0)) {
      trigger.setHours(9, 0, 0, 0);
    } else {
      trigger.setTime(trigger.getTime() + 60 * 1000);
    }

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_MOTIVATION_NOTIFICATION_ID,
      content: {
        title: "Today's motivation from Gaia",
        body,
        data: { screen: 'Dashboard' },
      },
      trigger,
    });
  } catch {
    // ignore
  }
}

/** Call when we have cached motivation for today and user has opt-in; schedule push so they get it once. */
export async function scheduleDailyMotivationNotificationIfEnabled(): Promise<void> {
  const enabled = await getDailyMotivationEnabled();
  if (!enabled) return;
  const text = await getMotivationForToday();
  if (text) await scheduleMotivationNotification(text);
}
