import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Board } from "@/components/game/Board";
import { GameHUD } from "@/components/game/GameHUD";
import { WinModal } from "@/components/game/WinModal";
import { puzzleSource } from "@/game/puzzles";
import { useGame } from "@/hooks/useGame";
import { useSettings } from "@/hooks/useSettings";
import { storage } from "@/game/storage";
import { evaluateAchievements } from "@/game/achievements";
import { getHint, type Hint } from "@/game/hints";
import { sounds } from "@/lib/sounds";
import { toast } from "sonner";
import type { Difficulty } from "@/game/types";

export const Route = createFileRoute("/play/$puzzleId")({
  component: PlayPage,
});

function PlayPage() {
  const { puzzleId } = Route.useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const puzzle = useMemo(() => puzzleSource.byId(puzzleId), [puzzleId]);

  if (!puzzle) {
    return (
      <div>
        <AppHeader />
        <div className="mx-auto max-w-md mt-16 text-center glass p-8 rounded-2xl shadow-elevated">
          <p>Puzzle not found.</p>
          <Link to="/" className="mt-4 inline-block underline">Go home</Link>
        </div>
      </div>
    );
  }

  const saved = useMemo(
    () => (typeof window !== "undefined" ? storage.getActive() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [puzzleId],
  );

  const game = useGame(puzzle, saved && saved.puzzleId === puzzle.id ? saved : null);
  const [hint, setHint] = useState<Hint | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [recorded, setRecorded] = useState(false);

  // Record win
  useEffect(() => {
    if (!game.state.completed || recorded) return;
    setRecorded(true);
    setShowWin(true);
    if (settings.sound) sounds.win();
    const stats = storage.getStats();
    const diff = puzzle.difficulty;
    stats.played += 1;
    stats.won += 1;
    stats.totalMoves += game.state.history.length;
    stats.hintsUsed += game.state.hintsUsed;
    stats.totalTimeMs += game.elapsedMs;
    stats.byDifficulty[diff].played += 1;
    stats.byDifficulty[diff].won += 1;
    const best = stats.bestTimeMs[diff];
    if (best === null || game.elapsedMs < best) stats.bestTimeMs[diff] = game.elapsedMs;
    const dWon = stats.byDifficulty[diff].won;
    const avg = stats.avgTimeMs[diff];
    stats.avgTimeMs[diff] =
      avg === null ? game.elapsedMs : Math.round((avg * (dWon - 1) + game.elapsedMs) / dWon);
    if (stats.fastestSolveMs === null || game.elapsedMs < stats.fastestSolveMs) {
      stats.fastestSolveMs = game.elapsedMs;
    }

    // Streak for daily
    if (puzzle.dailyDate) {
      const today = puzzle.dailyDate;
      const last = stats.lastWonDate;
      if (last) {
        const lastDate = new Date(last);
        const t = new Date(today);
        const diffDays = Math.round((t.getTime() - lastDate.getTime()) / 86_400_000);
        if (diffDays === 1) stats.currentStreak += 1;
        else if (diffDays !== 0) stats.currentStreak = 1;
      } else {
        stats.currentStreak = 1;
      }
      if (stats.currentStreak > stats.longestStreak) stats.longestStreak = stats.currentStreak;
      stats.lastWonDate = today;
      const daily = storage.getDaily();
      daily[today] = {
        timeMs: game.elapsedMs,
        moves: game.state.history.length,
        hints: game.state.hintsUsed,
      };
      storage.setDaily(daily);
    }
    storage.setStats(stats);

    const completed = storage.getCompleted();
    if (!completed.includes(puzzle.id)) storage.setCompleted([...completed, puzzle.id]);

    const { earned, newly } = evaluateAchievements(storage.getAchievements(), stats, {
      lastWinTimeMs: game.elapsedMs,
      lastWinHints: game.state.hintsUsed,
      lastWinDifficulty: diff,
    });
    storage.setAchievements(earned);
    for (const id of newly) {
      toast.success("Achievement unlocked!", { description: id });
    }
  }, [game.state.completed, game.elapsedMs, game.state.history.length, game.state.hintsUsed, puzzle, recorded, settings.sound]);

  // Conflict sound feedback
  useEffect(() => {
    if (!settings.sound) return;
    if (game.conflicts.length > 0) sounds.error();
  }, [game.conflicts.length, settings.sound]);

  const handleCell = (r: number, c: number) => {
    const before = game.state.board[r][c];
    game.cycleCell(r, c);
    setHint(null);
    if (settings.sound) {
      if (before === "empty") sounds.place();
      else if (before === "queen") sounds.mark();
      else sounds.remove();
    }
  };

  const handleHint = () => {
    const h = getHint(game.state.board, puzzle);
    setHint(h);
    if (h) {
      game.useHint();
      toast(h.message);
    }
  };

  const handleNext = () => {
    const list = puzzleSource.byDifficulty(puzzle.difficulty as Difficulty);
    const done = new Set(storage.getCompleted());
    const next = list.find((p) => !done.has(p.id) && p.id !== puzzle.id) ?? list[0];
    setShowWin(false);
    setRecorded(false);
    navigate({ to: "/play/$puzzleId", params: { puzzleId: next.id } });
  };

  const handleReplay = () => {
    setShowWin(false);
    setRecorded(false);
    game.restart();
  };

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        <GameHUD
          difficulty={puzzle.difficulty}
          size={puzzle.size}
          elapsedMs={game.elapsedMs}
          moves={game.state.history.length}
          hintsUsed={game.state.hintsUsed}
          paused={game.state.paused}
          canUndo={game.state.history.length > 0}
          canRedo={game.state.future.length > 0}
          onPauseToggle={() => (game.state.paused ? game.resume() : game.pause())}
          onUndo={game.undo}
          onRedo={game.redo}
          onRestart={game.restart}
          onHint={handleHint}
        />

        <div className="relative">
          <Board
            puzzle={puzzle}
            board={game.state.board}
            conflicts={game.conflicts}
            hintCells={hint?.cells}
            onCell={handleCell}
            disabled={game.state.paused}
          />
          {game.state.paused && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/70 backdrop-blur-md">
              <div className="text-center">
                <p className="font-display text-2xl font-semibold">Paused</p>
                <button
                  onClick={game.resume}
                  className="mt-3 rounded-xl bg-royal text-royal-foreground px-5 py-2 font-medium shadow-soft hover:opacity-90"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center px-2">
          Tap a cell to cycle: empty → <span aria-label="queen">♛</span> → ✕ → empty. One queen per row, column, and color region. No two queens may touch.
        </div>
      </div>

      <WinModal
        open={showWin}
        puzzle={puzzle}
        timeMs={game.elapsedMs}
        moves={game.state.history.length}
        hintsUsed={game.state.hintsUsed}
        onReplay={handleReplay}
        onNext={handleNext}
      />
    </div>
  );
}
