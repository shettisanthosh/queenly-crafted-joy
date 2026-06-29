import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Timer, Flame, Hash, Lightbulb, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { defaultStats, storage, type Stats } from "@/game/storage";
import { formatTime } from "@/hooks/useGame";
import type { Difficulty } from "@/game/types";

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "Statistics — Queens" }] }),
  component: StatsPage,
});

const DIFFS: Difficulty[] = ["easy", "medium", "hard", "expert", "master"];

function StatsPage() {
  const [stats, setStats] = useState<Stats>(defaultStats());
  useEffect(() => setStats(storage.getStats()), []);

  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxWon = Math.max(1, ...DIFFS.map((d) => stats.byDifficulty[d].won));

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <h1 className="font-display text-3xl font-bold">Statistics</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card icon={<Trophy />} label="Won" value={stats.won} />
          <Card icon={<Hash />} label="Played" value={stats.played} />
          <Card icon={<TrendingUp />} label="Win rate" value={`${winRate}%`} />
          <Card icon={<Timer />} label="Fastest" value={stats.fastestSolveMs ? formatTime(stats.fastestSolveMs) : "—"} />
          <Card icon={<Flame />} label="Streak" value={stats.currentStreak} />
          <Card icon={<Lightbulb />} label="Hints used" value={stats.hintsUsed} />
        </div>

        <section className="rounded-2xl glass p-5 shadow-soft">
          <h2 className="font-display text-xl font-semibold mb-4">By difficulty</h2>
          <div className="space-y-3">
            {DIFFS.map((d) => {
              const won = stats.byDifficulty[d].won;
              const played = stats.byDifficulty[d].played;
              const best = stats.bestTimeMs[d];
              const avg = stats.avgTimeMs[d];
              const pct = (won / maxWon) * 100;
              return (
                <div key={d}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="capitalize font-medium">{d}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {won}/{played} · best {best ? formatTime(best) : "—"} · avg {avg ? formatTime(avg) : "—"}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-royal rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl glass p-5 shadow-soft">
          <h2 className="font-display text-xl font-semibold mb-2">Streaks</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Card label="Current streak" value={stats.currentStreak} />
            <Card label="Longest streak" value={stats.longestStreak} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl glass p-4 shadow-soft">
      {icon && <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground mb-2">{icon}</div>}
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
