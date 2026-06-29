import { findConflicts, isAdjacentToQueen } from "./validation";
import type { CellState, Puzzle } from "./types";

export interface Hint {
  message: string;
  cells: { row: number; col: number }[];
  level: 1 | 2 | 3;
}

/** Returns a logic-based hint without revealing the full solution. */
export function getHint(board: CellState[][], puzzle: Puzzle): Hint | null {
  const n = puzzle.size;
  const conflicts = findConflicts(board, puzzle);
  if (conflicts.length > 0) {
    const c = conflicts[0];
    const reason =
      c.reason === "row"
        ? "Two queens share a row."
        : c.reason === "col"
        ? "Two queens share a column."
        : c.reason === "region"
        ? "Two queens share a colored region."
        : "Two queens are touching diagonally or adjacently.";
    return { message: `${reason} Try removing one.`, cells: [{ row: c.row, col: c.col }], level: 1 };
  }

  // Find a row/region/col with only one valid placement
  const candidates: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(true));
  const rowsTaken = new Set<number>();
  const colsTaken = new Set<number>();
  const regsTaken = new Set<number>();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === "queen") {
        rowsTaken.add(r);
        colsTaken.add(c);
        regsTaken.add(puzzle.regions[r][c]);
      }
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === "mark") candidates[r][c] = false;
      if (board[r][c] === "queen") continue;
      if (rowsTaken.has(r) || colsTaken.has(c) || regsTaken.has(puzzle.regions[r][c])) {
        candidates[r][c] = false;
      } else if (isAdjacentToQueen(board, r, c)) {
        candidates[r][c] = false;
      }
    }
  }

  // Single candidate in a row
  for (let r = 0; r < n; r++) {
    if (rowsTaken.has(r)) continue;
    const opts: number[] = [];
    for (let c = 0; c < n; c++) if (candidates[r][c]) opts.push(c);
    if (opts.length === 1) {
      return {
        message: `Row ${r + 1} has only one valid position.`,
        cells: [{ row: r, col: opts[0] }],
        level: 2,
      };
    }
  }
  // Single candidate in a column
  for (let c = 0; c < n; c++) {
    if (colsTaken.has(c)) continue;
    const opts: number[] = [];
    for (let r = 0; r < n; r++) if (candidates[r][c]) opts.push(r);
    if (opts.length === 1) {
      return {
        message: `Column ${c + 1} has only one valid position.`,
        cells: [{ row: opts[0], col: c }],
        level: 2,
      };
    }
  }
  // Single candidate in a region
  for (let reg = 0; reg < n; reg++) {
    if (regsTaken.has(reg)) continue;
    const opts: { row: number; col: number }[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.regions[r][c] === reg && candidates[r][c]) opts.push({ row: r, col: c });
      }
    }
    if (opts.length === 1) {
      return {
        message: `A colored region has only one valid position left.`,
        cells: opts,
        level: 2,
      };
    }
  }

  // Fallback: highlight a small region's candidates
  let bestReg = -1;
  let bestCount = Infinity;
  for (let reg = 0; reg < n; reg++) {
    if (regsTaken.has(reg)) continue;
    let count = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.regions[r][c] === reg && candidates[r][c]) count++;
      }
    }
    if (count > 0 && count < bestCount) {
      bestCount = count;
      bestReg = reg;
    }
  }
  if (bestReg >= 0) {
    const opts: { row: number; col: number }[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.regions[r][c] === bestReg && candidates[r][c]) opts.push({ row: r, col: c });
      }
    }
    return {
      message: `Focus on this region — narrow down the candidates.`,
      cells: opts,
      level: 3,
    };
  }
  return { message: "Looking good. Keep going!", cells: [], level: 3 };
}
