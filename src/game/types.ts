export type CellState = "empty" | "queen" | "mark";

export type Difficulty = "easy" | "medium" | "hard" | "expert" | "master";

export interface Puzzle {
  id: string;
  size: number;
  /** regions[row][col] = region index (0..size-1) */
  regions: number[][];
  /** solution[row] = col of the queen in that row */
  solution: number[];
  difficulty: Difficulty;
  seed: number;
  /** ISO date for daily puzzles, undefined otherwise */
  dailyDate?: string;
}

export interface Move {
  row: number;
  col: number;
  from: CellState;
  to: CellState;
}

export interface GameState {
  puzzleId: string;
  board: CellState[][];
  history: Move[];
  future: Move[];
  startedAt: number;
  elapsedMs: number;
  hintsUsed: number;
  paused: boolean;
  completed: boolean;
}

export interface Conflict {
  row: number;
  col: number;
  reason: "row" | "col" | "region" | "adjacent";
}

export interface PuzzleSource {
  list(): Puzzle[];
  byId(id: string): Puzzle | undefined;
  byDifficulty(d: Difficulty): Puzzle[];
  daily(date: string): Puzzle;
}
