import { File, Paths } from 'expo-file-system';

const FILE_NAME = 'events_notes.json';

function getFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export interface EventOrNote {
  id: string;
  type: 'event' | 'note';
  date: string;
  title: string;
  time?: string;
  content?: string;
}

interface EventsNotesData {
  items: EventOrNote[];
}

async function readData(): Promise<EventsNotesData> {
  try {
    const file = getFile();
    if (!file.exists) return { items: [] };
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? { items: parsed.items } : { items: [] };
  } catch {
    return { items: [] };
  }
}

async function writeData(data: EventsNotesData): Promise<void> {
  const file = getFile();
  file.write(JSON.stringify(data));
}

export async function getEventsAndNotesForDate(dateStr: string): Promise<EventOrNote[]> {
  const { items } = await readData();
  return items.filter((i) => i.date === dateStr);
}

/** Returns date keys (YYYY-MM-DD) that have at least one event or note. Used for calendar dots. */
export async function getDatesWithItems(): Promise<string[]> {
  const { items } = await readData();
  const set = new Set<string>();
  items.forEach((i) => set.add(i.date));
  return Array.from(set);
}

export async function addEventOrNote(item: Omit<EventOrNote, 'id'>): Promise<EventOrNote> {
  const data = await readData();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newItem: EventOrNote = { ...item, id };
  data.items.push(newItem);
  await writeData(data);
  return newItem;
}

export async function deleteEventOrNote(id: string): Promise<void> {
  const data = await readData();
  data.items = data.items.filter((i) => i.id !== id);
  await writeData(data);
}

/** Remove all events and notes (used when destroying profile). */
export async function clearAllEventsAndNotes(): Promise<void> {
  await writeData({ items: [] });
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
