import { DIFFICULTY_SIZES, generatePuzzle } from "./generator";
import type { Difficulty, Puzzle, PuzzleSource } from "./types";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert", "master"];

// Curated library: 8 puzzles per difficulty with fixed seeds for stable IDs.
const LIBRARY: Puzzle[] = (() => {
  const out: Puzzle[] = [];
  for (const d of DIFFICULTIES) {
    const size = DIFFICULTY_SIZES[d];
    for (let i = 0; i < 8; i++) {
      const seed = hashSeed(`${d}-${i + 1}`);
      out.push(generatePuzzle(size, d, seed));
    }
  }
  return out;
})();

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dailySeed(date: string): number {
  return hashSeed(`daily-${date}`);
}

export const puzzleSource: PuzzleSource = {
  list: () => LIBRARY,
  byId: (id) => {
    const found = LIBRARY.find((p) => p.id === id);
    if (found) return found;
    // Daily puzzles: id like daily-YYYY-MM-DD
    if (id.startsWith("daily-")) {
      const date = id.slice("daily-".length);
      return puzzleSource.daily(date);
    }
    return undefined;
  },
  byDifficulty: (d) => LIBRARY.filter((p) => p.difficulty === d),
  daily: (date) => {
    // Rotate difficulty by day for variety
    const day = new Date(date).getUTCDay();
    const d: Difficulty = DIFFICULTIES[day % DIFFICULTIES.length];
    const size = DIFFICULTY_SIZES[d];
    const p = generatePuzzle(size, d, dailySeed(date));
    return { ...p, id: `daily-${date}`, dailyDate: date };
  },
};

export function todayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
