import { File, Paths } from 'expo-file-system';
import type { ChatMessage } from '../models/ChatMessage';

const CHAT_FILE = 'gaia_chat.json';

function getChatFile(): File {
  return new File(Paths.document, CHAT_FILE);
}

/**
 * Load Gaia chat history from local JSON (offline).
 */
export async function loadGaiaChat(): Promise<ChatMessage[]> {
  try {
    const file = getChatFile();
    if (!file.exists) return [];
    const content = await file.text();
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
  const messages = await loadGaiaChat();
  messages.push(message);
  const file = getChatFile();
  file.write(JSON.stringify(messages, null, 2));
}

/**
 * Save full chat (e.g. after receiving assistant reply).
 */
export async function saveGaiaChat(messages: ChatMessage[]): Promise<void> {
  const file = getChatFile();
  file.write(JSON.stringify(messages, null, 2));
}

/**
 * Remove all Gaia chat data from this device.
 */
export async function clearGaiaChat(): Promise<void> {
  try {
    const file = getChatFile();
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}
