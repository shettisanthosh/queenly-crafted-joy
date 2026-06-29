import { motion } from "motion/react";
import { Crown, Share2, RotateCcw, Home, ArrowRight, Star } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatTime } from "@/hooks/useGame";
import type { Puzzle } from "@/game/types";

interface WinModalProps {
  open: boolean;
  puzzle: Puzzle;
  timeMs: number;
  moves: number;
  hintsUsed: number;
  onReplay: () => void;
  onNext: () => void;
}

function calcStars(hints: number, timeMs: number, size: number): number {
  if (hints === 0 && timeMs < size * 12_000) return 3;
  if (hints <= 1) return 2;
  return 1;
}

export function WinModal({ open, puzzle, timeMs, moves, hintsUsed, onReplay, onNext }: WinModalProps) {
  const stars = calcStars(hintsUsed, timeMs, puzzle.size);

  useEffect(() => {
    if (!open) return;
    const end = Date.now() + 1200;
    const colors = ["#a78bfa", "#f0abfc", "#fde68a", "#86efac"];
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden glass border-0 shadow-elevated">
        <div className="bg-royal px-6 pt-8 pb-6 text-royal-foreground text-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/15"
          >
            <Crown className="h-9 w-9" fill="currentColor" />
          </motion.div>
          <h2 className="mt-4 font-display text-3xl font-bold">Victory</h2>
          <p className="mt-1 text-sm opacity-90">
            {puzzle.difficulty[0].toUpperCase() + puzzle.difficulty.slice(1)} · {puzzle.size}×{puzzle.size} solved
          </p>
          <div className="mt-3 flex justify-center gap-1">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 260 }}
              >
                <Star
                  className={`h-7 w-7 ${i <= stars ? "text-yellow-300" : "text-white/25"}`}
                  fill={i <= stars ? "currentColor" : "transparent"}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Cell label="Time" value={formatTime(timeMs)} />
            <Cell label="Moves" value={moves} />
            <Cell label="Hints" value={hintsUsed} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onNext} className="flex-1 min-w-32 bg-royal text-royal-foreground hover:opacity-90">
              Next puzzle <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onReplay} className="flex-1 min-w-32">
              <RotateCcw className="h-4 w-4" /> Replay
            </Button>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" className="flex-1">
              <Link to="/"><Home className="h-4 w-4" /> Home</Link>
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                const text = `I solved a ${puzzle.difficulty} Queens puzzle in ${formatTime(timeMs)} with ${hintsUsed} hints!`;
                if (navigator.share) navigator.share({ text }).catch(() => {});
                else navigator.clipboard?.writeText(text);
              }}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
