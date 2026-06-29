import type { Stats } from "./storage";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  check: (stats: Stats, ctx: AchievementCtx) => boolean;
}

export interface AchievementCtx {
  lastWinTimeMs?: number;
  lastWinHints?: number;
  lastWinDifficulty?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-win", title: "First Crown", description: "Win your first puzzle", check: (s) => s.won >= 1 },
  { id: "ten-wins", title: "Steady Reign", description: "Win 10 puzzles", check: (s) => s.won >= 10 },
  { id: "fifty-wins", title: "Court Veteran", description: "Win 50 puzzles", check: (s) => s.won >= 50 },
  { id: "hundred-wins", title: "Royal Master", description: "Win 100 puzzles", check: (s) => s.won >= 100 },
  {
    id: "no-hint",
    title: "Unaided Mind",
    description: "Win a puzzle without using a hint",
    check: (_s, c) => !!c.lastWinTimeMs && (c.lastWinHints ?? 0) === 0,
  },
  {
    id: "speed-solver",
    title: "Speed Solver",
    description: "Solve any puzzle in under 60 seconds",
    check: (_s, c) => !!c.lastWinTimeMs && c.lastWinTimeMs < 60_000,
  },
  {
    id: "streak-3",
    title: "On a Roll",
    description: "Reach a 3-day daily streak",
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: "streak-7",
    title: "Weekly Sovereign",
    description: "Reach a 7-day daily streak",
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: "master-solve",
    title: "Master Solver",
    description: "Win a Master difficulty puzzle",
    check: (_s, c) => c.lastWinDifficulty === "master",
  },
];

export function evaluateAchievements(
  earned: string[],
  stats: Stats,
  ctx: AchievementCtx,
): { earned: string[]; newly: string[] } {
  const set = new Set(earned);
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!set.has(a.id) && a.check(stats, ctx)) {
      set.add(a.id);
      newly.push(a.id);
    }
  }
  return { earned: [...set], newly };
}
