import type { Difficulty, GameState } from "./types";

const KEYS = {
  active: "queens.active",
  stats: "queens.stats",
  achievements: "queens.achievements",
  settings: "queens.settings",
  library: "queens.library", // completed puzzle ids
  daily: "queens.daily", // map of date -> completion record
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export interface Stats {
  played: number;
  won: number;
  bestTimeMs: Record<Difficulty, number | null>;
  avgTimeMs: Record<Difficulty, number | null>;
  totalTimeMs: number;
  totalMoves: number;
  hintsUsed: number;
  currentStreak: number;
  longestStreak: number;
  lastWonDate: string | null;
  fastestSolveMs: number | null;
  byDifficulty: Record<Difficulty, { played: number; won: number }>;
}

export const defaultStats = (): Stats => ({
  played: 0,
  won: 0,
  bestTimeMs: { easy: null, medium: null, hard: null, expert: null, master: null },
  avgTimeMs: { easy: null, medium: null, hard: null, expert: null, master: null },
  totalTimeMs: 0,
  totalMoves: 0,
  hintsUsed: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastWonDate: null,
  fastestSolveMs: null,
  byDifficulty: {
    easy: { played: 0, won: 0 },
    medium: { played: 0, won: 0 },
    hard: { played: 0, won: 0 },
    expert: { played: 0, won: 0 },
    master: { played: 0, won: 0 },
  },
});

export interface Settings {
  theme: "light" | "dark" | "system";
  sound: boolean;
  animations: boolean;
  highContrast: boolean;
  autoMark: boolean;
}

export const defaultSettings = (): Settings => ({
  theme: "system",
  sound: true,
  animations: true,
  highContrast: false,
  autoMark: false,
});

export const storage = {
  getActive: () => read<GameState | null>(KEYS.active, null),
  setActive: (s: GameState | null) =>
    s ? write(KEYS.active, s) : window.localStorage.removeItem(KEYS.active),
  getStats: () => read<Stats>(KEYS.stats, defaultStats()),
  setStats: (s: Stats) => write(KEYS.stats, s),
  getAchievements: () => read<string[]>(KEYS.achievements, []),
  setAchievements: (a: string[]) => write(KEYS.achievements, a),
  getSettings: () => read<Settings>(KEYS.settings, defaultSettings()),
  setSettings: (s: Settings) => write(KEYS.settings, s),
  getCompleted: () => read<string[]>(KEYS.library, []),
  setCompleted: (ids: string[]) => write(KEYS.library, ids),
  getDaily: () =>
    read<Record<string, { timeMs: number; moves: number; hints: number }>>(KEYS.daily, {}),
  setDaily: (d: Record<string, { timeMs: number; moves: number; hints: number }>) =>
    write(KEYS.daily, d),
  reset: () => {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  },
};

export { KEYS };
