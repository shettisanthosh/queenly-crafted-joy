import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Crown, Check } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { puzzleSource } from "@/game/puzzles";
import { storage } from "@/game/storage";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/game/types";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Puzzle Library — Queens" }] }),
  component: LibraryPage,
});

const ALL: ("all" | Difficulty)[] = ["all", "easy", "medium", "hard", "expert", "master"];

function LibraryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | Difficulty>("all");
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => setDone(new Set(storage.getCompleted())), []);

  const list = useMemo(() => {
    const all = puzzleSource.list();
    return filter === "all" ? all : all.filter((p) => p.difficulty === filter);
  }, [filter]);

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold">Puzzle Library</h1>
            <p className="text-sm text-muted-foreground">{list.length} puzzles · {done.size} solved</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition",
                  filter === d
                    ? "bg-royal text-royal-foreground shadow-soft"
                    : "glass hover:bg-accent",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => {
            const solved = done.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => navigate({ to: "/play/$puzzleId", params: { puzzleId: p.id } })}
                className="group text-left rounded-2xl glass p-4 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl shadow-soft",
                    solved ? "bg-success text-success-foreground" : "bg-royal text-royal-foreground",
                  )}>
                    {solved ? <Check className="h-5 w-5" /> : <Crown className="h-5 w-5" fill="currentColor" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate capitalize">{p.difficulty} #{(i % 8) + 1}</p>
                    <p className="text-xs text-muted-foreground">{p.size}×{p.size}</p>
                  </div>
                </div>
                <MiniBoard puzzle={p} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniBoard({ puzzle }: { puzzle: ReturnType<typeof puzzleSource.list>[number] }) {
  const palette = ["#fca5a5","#fdba74","#fde68a","#bef264","#86efac","#67e8f9","#93c5fd","#c4b5fd","#f0abfc","#f9a8d4","#d6d3d1","#a7f3d0"];
  return (
    <div
      className="mt-3 grid gap-px overflow-hidden rounded-lg"
      style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`, aspectRatio: "1/1" }}
    >
      {puzzle.regions.flatMap((row, r) =>
        row.map((reg, c) => (
          <div key={`${r}-${c}`} style={{ backgroundColor: palette[reg % palette.length] }} />
        )),
      )}
    </div>
  );
}
