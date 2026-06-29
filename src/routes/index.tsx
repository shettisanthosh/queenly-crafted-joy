import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Crown,
  Play,
  Calendar,
  Library,
  BarChart3,
  Trophy,
  Settings as SettingsIcon,
  BookOpen,
  Info,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { storage } from "@/game/storage";
import type { GameState } from "@/game/types";
import { puzzleSource, todayKey } from "@/game/puzzles";
import { formatTime } from "@/hooks/useGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Queens — Royal Logic Puzzle" },
      { name: "description", content: "Solve elegant queen-placement puzzles. Daily challenges, library, and achievements." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [active, setActive] = useState<GameState | null>(null);
  const [completed, setCompleted] = useState<number>(0);

  useEffect(() => {
    setActive(storage.getActive());
    setCompleted(storage.getCompleted().length);
  }, []);

  const startDifficulty = (difficulty: "easy" | "medium" | "hard" | "expert" | "master") => {
    const list = puzzleSource.byDifficulty(difficulty);
    const done = new Set(storage.getCompleted());
    const next = list.find((p) => !done.has(p.id)) ?? list[0];
    navigate({ to: "/play/$puzzleId", params: { puzzleId: next.id } });
  };

  return (
    <div className="relative">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 pb-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mt-6 overflow-hidden rounded-3xl glass shadow-elevated"
        >
          <div className="absolute inset-0 bg-royal opacity-90" />
          <div className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 text-royal-foreground">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Daily logic, royally done
                </span>
                <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold text-balance">
                  Crown the board.
                </h1>
                <p className="mt-3 max-w-md text-sm sm:text-base opacity-90 text-balance">
                  One queen per row, column, and color region. Never touching. Pure logic, no guessing.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {active ? (
                    <Link
                      to="/play/$puzzleId"
                      params={{ puzzleId: active.puzzleId }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white text-foreground px-5 py-3 font-semibold shadow-soft hover:scale-[1.02] transition"
                    >
                      <Play className="h-4 w-4" fill="currentColor" /> Continue · {formatTime(active.elapsedMs)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => startDifficulty("easy")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white text-foreground px-5 py-3 font-semibold shadow-soft hover:scale-[1.02] transition"
                    >
                      <Play className="h-4 w-4" fill="currentColor" /> Play now
                    </button>
                  )}
                  <Link
                    to="/daily"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur px-5 py-3 font-semibold hover:bg-white/25 transition"
                  >
                    <Calendar className="h-4 w-4" /> Daily challenge
                  </Link>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="hidden md:grid h-40 w-40 place-items-center rounded-3xl bg-white/15 backdrop-blur shadow-elevated"
              >
                <Crown className="h-20 w-20" fill="currentColor" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Difficulty */}
        <section className="mt-8">
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-2xl font-semibold">Choose your challenge</h2>
            <p className="text-xs text-muted-foreground">{completed} solved</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {([
              { d: "easy", size: 6, label: "Easy" },
              { d: "medium", size: 7, label: "Medium" },
              { d: "hard", size: 8, label: "Hard" },
              { d: "expert", size: 9, label: "Expert" },
              { d: "master", size: 10, label: "Master" },
            ] as const).map(({ d, size, label }, i) => (
              <motion.button
                key={d}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -3 }}
                onClick={() => startDifficulty(d)}
                className="group relative overflow-hidden rounded-2xl glass p-4 text-left shadow-soft hover:shadow-elevated transition"
              >
                <div className="absolute inset-0 bg-royal opacity-0 group-hover:opacity-10 transition" />
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-royal text-royal-foreground shadow-soft">
                  <Crown className="h-5 w-5" fill="currentColor" />
                </div>
                <p className="mt-3 font-display text-lg font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{size}×{size} board</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Navigation tiles */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Tile to="/library" icon={<Library className="h-5 w-5" />} title="Puzzle Library" subtitle="Curated set, all difficulties" />
          <Tile to="/daily" icon={<Calendar className="h-5 w-5" />} title="Daily Challenge" subtitle="One new puzzle, every day" />
          <Tile to="/stats" icon={<BarChart3 className="h-5 w-5" />} title="Statistics" subtitle="Track your progress" />
          <Tile to="/achievements" icon={<Trophy className="h-5 w-5" />} title="Achievements" subtitle="Earn royal honors" />
          <Tile to="/how-to-play" icon={<BookOpen className="h-5 w-5" />} title="How to Play" subtitle="Rules and strategy" />
          <Tile to="/settings" icon={<SettingsIcon className="h-5 w-5" />} title="Settings" subtitle="Themes, sound, more" />
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <Link to="/about" className="inline-flex items-center gap-1 hover:text-foreground transition">
            <Info className="h-3 w-3" /> About Queens
          </Link>
        </footer>
      </div>
    </div>
  );
}

function Tile({
  to,
  icon,
  title,
  subtitle,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl glass p-4 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
    </Link>
  );
}
