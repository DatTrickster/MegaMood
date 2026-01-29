import * as FileSystem from 'expo-file-system';

const FILE_NAME = 'planner.json';

function getPath(): string {
  return `${FileSystem.documentDirectory}${FILE_NAME}`;
}

export type PlannerItemType = 'meal' | 'workout' | 'mindbody';

export interface PlannerItem {
  id: string;
  type: PlannerItemType;
  date: string;
  content: string;
}

interface PlannerData {
  items: PlannerItem[];
}

async function readData(): Promise<PlannerData> {
  try {
    const path = getPath();
    const exists = await FileSystem.getInfoAsync(path, { size: false });
    if (!exists.exists) return { items: [] };
    const raw = await FileSystem.readAsStringAsync(path);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? { items: parsed.items } : { items: [] };
  } catch {
    return { items: [] };
  }
}

async function writeData(data: PlannerData): Promise<void> {
  await FileSystem.writeAsStringAsync(getPath(), JSON.stringify(data));
}

export async function getPlannerItemsForDate(dateStr: string): Promise<PlannerItem[]> {
  const { items } = await readData();
  return items.filter((i) => i.date === dateStr);
}

export async function addPlannerItem(
  item: Omit<PlannerItem, 'id'>
): Promise<PlannerItem> {
  const data = await readData();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newItem: PlannerItem = { ...item, id };
  data.items.push(newItem);
  await writeData(data);
  return newItem;
}

export async function deletePlannerItem(id: string): Promise<void> {
  const data = await readData();
  data.items = data.items.filter((i) => i.id !== id);
  await writeData(data);
}

export async function clearAllPlannerItems(): Promise<void> {
  await writeData({ items: [] });
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
