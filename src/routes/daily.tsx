import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Crown, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { puzzleSource, todayKey } from "@/game/puzzles";
import { storage } from "@/game/storage";
import { formatTime } from "@/hooks/useGame";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Daily Challenge — Queens" },
      { name: "description", content: "Today's Queens puzzle — one new logic challenge every day." },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<{ date: string; record: { timeMs: number; moves: number; hints: number } }[]>([]);

  const today = todayKey();
  const todayPuzzle = puzzleSource.daily(today);

  useEffect(() => {
    const daily = storage.getDaily();
    const rows = Object.entries(daily)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, record]) => ({ date, record }));
    setHistory(rows);
  }, []);

  const todayDone = history.find((h) => h.date === today);

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="rounded-3xl glass p-6 shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 bg-royal opacity-90" />
          <div className="relative text-royal-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
              <Calendar className="h-3 w-3" /> {today}
            </div>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold">Today's Challenge</h1>
            <p className="mt-2 opacity-90 text-sm">
              {todayPuzzle.difficulty[0].toUpperCase() + todayPuzzle.difficulty.slice(1)} · {todayPuzzle.size}×{todayPuzzle.size}
              {todayDone && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  <Crown className="h-3 w-3" fill="currentColor" /> Solved · {formatTime(todayDone.record.timeMs)}
                </span>
              )}
            </p>
            <button
              onClick={() => navigate({ to: "/play/$puzzleId", params: { puzzleId: todayPuzzle.id } })}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white text-foreground px-5 py-3 font-semibold shadow-soft hover:scale-[1.02] transition"
            >
              {todayDone ? "Replay" : "Start today's puzzle"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold mb-3">Recent dailies</h2>
          {history.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground shadow-soft">
              No daily puzzles solved yet. Start today!
            </div>
          ) : (
            <ul className="grid gap-2">
              {history.slice(0, 14).map(({ date, record }) => (
                <li
                  key={date}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-xl glass px-4 py-3 shadow-soft"
                >
                  <span className="font-medium truncate">{date}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{formatTime(record.timeMs)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{record.moves} mv</span>
                  <button
                    onClick={() =>
                      navigate({ to: "/play/$puzzleId", params: { puzzleId: `daily-${date}` } })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Replay
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
