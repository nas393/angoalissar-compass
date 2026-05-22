// ─────────────────────────────────────────────────────────────────────────────
// Persistent storage helpers  (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

import type { SavedBriefing } from '../services/mock-data';

const KEY_BRIEFINGS = 'compass_briefings';
const KEY_SETTINGS  = 'compass_settings';
const KEY_PROVINCE  = 'compass_province';
const KEY_BRIEF_SCHED = 'compass_brief_schedule';

export interface AppSettings {
  devilTone: 'mild' | 'moderate' | 'brutal';
  copilotMemory: number; // turns
  briefingTime: string; // "07:30"
  briefingEnabled: boolean;
  theme: 'dark' | 'light';
}

const DEFAULT_SETTINGS: AppSettings = {
  devilTone: 'moderate',
  copilotMemory: 10,
  briefingTime: '07:30',
  briefingEnabled: false,
  theme: 'dark'
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
};

export const saveSettings = (s: AppSettings) =>
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));

export const loadBriefings = (): SavedBriefing[] => {
  try {
    const raw = localStorage.getItem(KEY_BRIEFINGS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveBriefing = (b: SavedBriefing) => {
  const list = loadBriefings();
  list.unshift(b);
  localStorage.setItem(KEY_BRIEFINGS, JSON.stringify(list.slice(0, 50)));
};

export const deleteBriefing = (id: string) => {
  const list = loadBriefings().filter(b => b.id !== id);
  localStorage.setItem(KEY_BRIEFINGS, JSON.stringify(list));
};

export const loadProvince = (): string | null => {
  try { return localStorage.getItem(KEY_PROVINCE); } catch { return null; }
};

export const saveProvince = (p: string | null) => {
  if (p) localStorage.setItem(KEY_PROVINCE, p);
  else localStorage.removeItem(KEY_PROVINCE);
};
