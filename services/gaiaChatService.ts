import * as FileSystem from 'expo-file-system';
import type { ChatMessage } from '../models/ChatMessage';

const CHAT_FILE = 'gaia_chat.json';

function getChatPath(): string {
  return `${FileSystem.documentDirectory}${CHAT_FILE}`;
}

/**
 * Load Gaia chat history from local JSON (offline).
 */
export async function loadGaiaChat(): Promise<ChatMessage[]> {
  try {
    const path = getChatPath();
    const exists = await FileSystem.getInfoAsync(path, { getData: false });
    if (!exists.exists) return [];
    const content = await FileSystem.readAsStringAsync(path);
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Append a message and persist (for context retention).
 */
export async function appendGaiaMessage(message: ChatMessage): Promise<void> {
  const path = getChatPath();
  const messages = await loadGaiaChat();
  messages.push(message);
  await FileSystem.writeAsStringAsync(path, JSON.stringify(messages, null, 2));
}

/**
 * Save full chat (e.g. after receiving assistant reply).
 */
export async function saveGaiaChat(messages: ChatMessage[]): Promise<void> {
  const path = getChatPath();
  await FileSystem.writeAsStringAsync(path, JSON.stringify(messages, null, 2));
}

/**
 * Remove all Gaia chat data from this device.
 */
export async function clearGaiaChat(): Promise<void> {
  const path = getChatPath();
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path);
    }
  } catch {
    // ignore
  }
}
