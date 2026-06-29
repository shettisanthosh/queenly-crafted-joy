import type { Difficulty, Puzzle } from "./types";

// Seeded RNG (mulberry32)
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIRS8 = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];
const DIRS4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/** Generate a random valid queens solution (one per row/col, no adjacency). */
function generateSolution(n: number, rand: () => number): number[] | null {
  const sol: number[] = new Array(n).fill(-1);
  const usedCol = new Set<number>();

  function ok(row: number, col: number): boolean {
    if (usedCol.has(col)) return false;
    if (row > 0) {
      const prev = sol[row - 1];
      if (Math.abs(prev - col) <= 1) return false;
    }
    return true;
  }

  function backtrack(row: number): boolean {
    if (row === n) return true;
    const cols = shuffled([...Array(n).keys()], rand);
    for (const c of cols) {
      if (ok(row, c)) {
        sol[row] = c;
        usedCol.add(c);
        if (backtrack(row + 1)) return true;
        usedCol.delete(c);
        sol[row] = -1;
      }
    }
    return false;
  }

  return backtrack(0) ? sol : null;
}

/** Grow n colored regions, each containing exactly one queen, covering the board. */
function growRegions(n: number, solution: number[], rand: () => number): number[][] {
  const regions: number[][] = Array.from({ length: n }, () => new Array(n).fill(-1));
  // Seed each region with its queen cell
  const frontiers: [number, number][][] = [];
  for (let i = 0; i < n; i++) {
    const r = i;
    const c = solution[i];
    regions[r][c] = i;
    const front: [number, number][] = [];
    for (const [dr, dc] of DIRS4) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) front.push([nr, nc]);
    }
    frontiers.push(front);
  }

  let unassigned = n * n - n;
  // Round-robin expansion
  while (unassigned > 0) {
    let progressed = false;
    const order = shuffled([...Array(n).keys()], rand);
    for (const i of order) {
      const front = frontiers[i];
      // pick random valid frontier cell
      while (front.length > 0) {
        const idx = Math.floor(rand() * front.length);
        const [r, c] = front.splice(idx, 1)[0];
        if (regions[r][c] !== -1) continue;
        regions[r][c] = i;
        unassigned--;
        progressed = true;
        for (const [dr, dc] of DIRS4) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < n && nc >= 0 && nc < n && regions[nr][nc] === -1) {
            front.push([nr, nc]);
          }
        }
        break;
      }
    }
    if (!progressed) {
      // assign any leftovers to nearest region
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] === -1) {
            // BFS to find nearest assigned cell
            const seen = new Set<string>([`${r},${c}`]);
            const q: [number, number][] = [[r, c]];
            while (q.length) {
              const [cr, cc] = q.shift()!;
              for (const [dr, dc] of DIRS4) {
                const nr = cr + dr;
                const nc = cc + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                const key = `${nr},${nc}`;
                if (seen.has(key)) continue;
                seen.add(key);
                if (regions[nr][nc] !== -1) {
                  regions[r][c] = regions[nr][nc];
                  unassigned--;
                  break;
                }
                q.push([nr, nc]);
              }
              if (regions[r][c] !== -1) break;
            }
          }
        }
      }
      break;
    }
  }
  return regions;
}

/** Count solutions up to limit. */
function countSolutions(n: number, regions: number[][], limit = 2): number {
  let count = 0;
  const colUsed = new Array(n).fill(false);
  const regUsed = new Array(n).fill(false);
  const placed: number[] = [];

  function rec(row: number): void {
    if (count >= limit) return;
    if (row === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (colUsed[c]) continue;
      const reg = regions[row][c];
      if (regUsed[reg]) continue;
      if (row > 0 && Math.abs(placed[row - 1] - c) <= 1) continue;
      colUsed[c] = true;
      regUsed[reg] = true;
      placed.push(c);
      rec(row + 1);
      placed.pop();
      colUsed[c] = false;
      regUsed[reg] = false;
      if (count >= limit) return;
    }
  }
  rec(0);
  return count;
}

export function generatePuzzle(
  size: number,
  difficulty: Difficulty,
  seed: number,
): Puzzle {
  // Try until we get a uniquely-solvable puzzle
  let attemptSeed = seed;
  for (let attempt = 0; attempt < 200; attempt++) {
    const rand = rng(attemptSeed);
    const sol = generateSolution(size, rand);
    if (sol) {
      const regions = growRegions(size, sol, rand);
      if (countSolutions(size, regions, 2) === 1) {
        return {
          id: `${difficulty}-${size}-${seed}`,
          size,
          regions,
          solution: sol,
          difficulty,
          seed,
        };
      }
    }
    attemptSeed = (attemptSeed * 31 + 7) >>> 0;
  }
  // Fallback: produce whatever we got (rare)
  const rand = rng(seed);
  const sol = generateSolution(size, rand)!;
  const regions = growRegions(size, sol, rand);
  return {
    id: `${difficulty}-${size}-${seed}`,
    size,
    regions,
    solution: sol,
    difficulty,
    seed,
  };
}

export const DIFFICULTY_SIZES: Record<Difficulty, number> = {
  easy: 6,
  medium: 7,
  hard: 8,
  expert: 9,
  master: 10,
};
