import type { SavedBriefing, AppSettings } from "@/types";

const KEYS = { briefings:"compass_briefings", settings:"compass_settings", province:"compass_province" } as const;

const DEFAULT_SETTINGS: AppSettings = {
  devilTone: "moderate", copilotMemory: 10,
  briefingTime: "07:30", briefingEnabled: false,
};

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export const loadSettings  = (): AppSettings =>
  safe(() => { const r = localStorage.getItem(KEYS.settings); return r ? { ...DEFAULT_SETTINGS, ...JSON.parse(r) } : DEFAULT_SETTINGS; }, DEFAULT_SETTINGS);

export const saveSettings  = (s: AppSettings) =>
  safe(() => localStorage.setItem(KEYS.settings, JSON.stringify(s)), undefined);

export const loadBriefings = (): SavedBriefing[] =>
  safe(() => { const r = localStorage.getItem(KEYS.briefings); return r ? JSON.parse(r) : []; }, []);

export const saveBriefing  = (b: SavedBriefing) => {
  const list = loadBriefings();
  list.unshift(b);
  safe(() => localStorage.setItem(KEYS.briefings, JSON.stringify(list.slice(0,50))), undefined);
};

export const deleteBriefing = (id: string) => {
  const list = loadBriefings().filter(b => b.id !== id);
  safe(() => localStorage.setItem(KEYS.briefings, JSON.stringify(list)), undefined);
};

export const loadProvince = (): string | null =>
  safe(() => localStorage.getItem(KEYS.province), null);

export const saveProvince = (p: string | null) =>
  safe(() => p ? localStorage.setItem(KEYS.province, p) : localStorage.removeItem(KEYS.province), undefined);
