/**
 * Gaia chat – message model for context retention.
 */
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string; // ISO date
}
