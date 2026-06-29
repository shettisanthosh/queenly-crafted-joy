import type { CellState, Conflict, Puzzle } from "./types";

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function findConflicts(board: CellState[][], puzzle: Puzzle): Conflict[] {
  const n = puzzle.size;
  const conflicts: Conflict[] = [];
  const queens: [number, number][] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === "queen") queens.push([r, c]);
    }
  }

  const rowCount = new Map<number, number>();
  const colCount = new Map<number, number>();
  const regCount = new Map<number, number>();
  for (const [r, c] of queens) {
    rowCount.set(r, (rowCount.get(r) ?? 0) + 1);
    colCount.set(c, (colCount.get(c) ?? 0) + 1);
    const reg = puzzle.regions[r][c];
    regCount.set(reg, (regCount.get(reg) ?? 0) + 1);
  }

  for (const [r, c] of queens) {
    if ((rowCount.get(r) ?? 0) > 1) conflicts.push({ row: r, col: c, reason: "row" });
    if ((colCount.get(c) ?? 0) > 1) conflicts.push({ row: r, col: c, reason: "col" });
    const reg = puzzle.regions[r][c];
    if ((regCount.get(reg) ?? 0) > 1) conflicts.push({ row: r, col: c, reason: "region" });
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === "queen") {
        conflicts.push({ row: r, col: c, reason: "adjacent" });
        break;
      }
    }
  }
  return conflicts;
}

export function isComplete(board: CellState[][], puzzle: Puzzle): boolean {
  const n = puzzle.size;
  let queens = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (board[r][c] === "queen") queens++;
  }
  if (queens !== n) return false;
  return findConflicts(board, puzzle).length === 0;
}

export function isAdjacentToQueen(board: CellState[][], r: number, c: number): boolean {
  const n = board.length;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === "queen") return true;
  }
  return false;
}
