import { motion, AnimatePresence } from "motion/react";
import { Crown, X } from "lucide-react";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { HIGH_CONTRAST_COLORS, REGION_COLORS, REGION_COLORS_DARK } from "@/game/colors";
import type { CellState, Conflict, Puzzle } from "@/game/types";
import { useSettings } from "@/hooks/useSettings";

interface BoardProps {
  puzzle: Puzzle;
  board: CellState[][];
  conflicts: Conflict[];
  hintCells?: { row: number; col: number }[];
  onCell: (row: number, col: number) => void;
  disabled?: boolean;
}

export const Board = memo(function Board({
  puzzle,
  board,
  conflicts,
  hintCells,
  onCell,
  disabled,
}: BoardProps) {
  const { settings } = useSettings();
  const isDark =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const palette = settings.highContrast
    ? HIGH_CONTRAST_COLORS
    : isDark
    ? REGION_COLORS_DARK
    : REGION_COLORS;

  const conflictMap = useMemo(() => {
    const s = new Set<string>();
    for (const c of conflicts) s.add(`${c.row},${c.col}`);
    return s;
  }, [conflicts]);

  const hintMap = useMemo(() => {
    const s = new Set<string>();
    for (const c of hintCells ?? []) s.add(`${c.row},${c.col}`);
    return s;
  }, [hintCells]);

  const n = puzzle.size;

  return (
    <div
      className="rounded-2xl p-2 shadow-elevated glass"
      role="grid"
      aria-label={`${n} by ${n} Queens puzzle board`}
    >
      <div
        className="grid gap-[2px] rounded-xl overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
          aspectRatio: "1 / 1",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const region = puzzle.regions[r][c];
            const bg = palette[region % palette.length];
            const inConflict = conflictMap.has(`${r},${c}`);
            const isHint = hintMap.has(`${r},${c}`);

            // borders between different regions
            const top = r > 0 && puzzle.regions[r - 1][c] !== region;
            const left = c > 0 && puzzle.regions[r][c - 1] !== region;
            const right = c < n - 1 && puzzle.regions[r][c + 1] !== region;
            const bottom = r < n - 1 && puzzle.regions[r + 1][c] !== region;

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={disabled}
                onClick={() => onCell(r, c)}
                aria-label={`Row ${r + 1} column ${c + 1}, ${cell}`}
                className={cn(
                  "relative flex items-center justify-center select-none overflow-hidden",
                  "transition-transform duration-150 active:scale-95",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
                  inConflict && settings.animations && "animate-shake",
                  isHint && "animate-hint-pulse z-10",
                )}
                style={{
                  backgroundColor: bg,
                  borderTop: top ? "2px solid rgba(0,0,0,0.7)" : "1px solid rgba(0,0,0,0.08)",
                  borderLeft: left ? "2px solid rgba(0,0,0,0.7)" : "1px solid rgba(0,0,0,0.08)",
                  borderRight: right ? "2px solid rgba(0,0,0,0.7)" : "1px solid rgba(0,0,0,0.08)",
                  borderBottom: bottom ? "2px solid rgba(0,0,0,0.7)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <AnimatePresence mode="wait">
                  {cell === "queen" && (
                    <motion.div
                      key="q"
                      initial={settings.animations ? { scale: 0.2, rotate: -20, opacity: 0 } : false}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className={cn(
                        "rounded-full p-[12%]",
                        inConflict ? "text-destructive" : "text-foreground/85",
                      )}
                    >
                      <Crown className="w-full h-full" strokeWidth={2.2} fill="currentColor" />
                    </motion.div>
                  )}
                  {cell === "mark" && (
                    <motion.div
                      key="x"
                      initial={settings.animations ? { scale: 0.4, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 0.55 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      className="text-foreground/70"
                    >
                      <X className="w-[55%] h-[55%] mx-auto" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
});
